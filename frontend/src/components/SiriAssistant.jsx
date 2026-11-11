/**
 * SiriAssistant — "Hey MyCare" hands-free AI voice assistant.
 *
 * - Shows a small pulsing orb (bottom-left) on every page when idle
 * - Activates on wake word "Hey MyCare" or on click
 * - Shows Siri-style animated waveform while listening / speaking
 * - Sends the query to /api/chat with full activity context
 * - Responds in Siri-smooth voice
 */
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, X, Volume2, Sparkles } from 'lucide-react'
import { useWakeWord } from '../hooks/useWakeWord.js'
import { useActivity } from '../context/ActivityContext.jsx'
import { sendChatMessage } from '../utils/api.js'
import {
  startVoiceRecognition,
  speakText,
  stopSpeaking,
  SIRI_VOICE_PROFILE,
} from '../utils/speech.js'

// ─────────────────── state machine ───────────────────
const S = {
  IDLE:       'idle',
  ACTIVATING: 'activating',
  LISTENING:  'listening',
  THINKING:   'thinking',
  SPEAKING:   'speaking',
}

// Number of waveform bars
const NUM_BARS = 14

// ─────────────────── tiny audio chime ────────────────
function playActivationChime() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext
    if (!Ctx) return
    const ctx = new Ctx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(660, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.15)
    gain.gain.setValueAtTime(0.25, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.45)
  } catch {}
}

// ─────────────────── component ───────────────────────
export default function SiriAssistant() {
  const [mode, setMode] = useState(S.IDLE)
  const [transcript, setTranscript] = useState('')
  const [reply, setReply] = useState('')
  const recognitionRef = useRef(null)
  const silenceTimerRef = useRef(null)
  const latestTranscriptRef = useRef('')
  const { getContextSummary, pageName } = useActivity()
  const isActive = mode !== S.IDLE

  // ── stop everything and go idle ──
  const dismiss = useCallback(() => {
    stopSpeaking()
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current)
      silenceTimerRef.current = null
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.stop() } catch {}
      recognitionRef.current = null
    }
    setMode(S.IDLE)
    setTranscript('')
    setReply('')
    latestTranscriptRef.current = ''
  }, [])

  // ── send query to AI and speak response ──
  const handleQuery = useCallback(async (text) => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current)
      silenceTimerRef.current = null
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.stop() } catch {}
      recognitionRef.current = null
    }

    const cleanText = (text || '').trim()
    if (!cleanText) {
      dismiss()
      return
    }

    setMode(S.THINKING)
    const context = getContextSummary()
    try {
      const res = await sendChatMessage(cleanText, 'en', null, context)
      const replyText = res.reply || "I'm sorry, I couldn't get an answer right now."
      setReply(replyText)
      setMode(S.SPEAKING)
      
      // Siri speaks the reply aloud using sentence queue
      speakText(replyText, 'en', () => {
        setMode(S.IDLE)
      }, SIRI_VOICE_PROFILE)
    } catch (err) {
      const errorMsg = "I'm having trouble reaching the server right now. Please check if the backend is running."
      setReply(errorMsg)
      setMode(S.SPEAKING)
      speakText(errorMsg, 'en', () => {
        setMode(S.IDLE)
      }, SIRI_VOICE_PROFILE)
    }
  }, [getContextSummary, dismiss])

  // ── start mic and listen with silence debouncing ──
  const startListening = useCallback(() => {
    setTranscript('')
    latestTranscriptRef.current = ''

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current)
      silenceTimerRef.current = null
    }

    const rec = startVoiceRecognition({
      language: 'en',
      continuous: true,
      onStart: () => setMode(S.LISTENING),
      onResult: (text) => {
        setTranscript(text)
        latestTranscriptRef.current = text

        // Reset silence timer every time user speaks new words
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current)
        }

        // Wait 1.6s of silence after speech before submitting query
        silenceTimerRef.current = setTimeout(() => {
          if (latestTranscriptRef.current && latestTranscriptRef.current.trim().length > 1) {
            handleQuery(latestTranscriptRef.current)
          }
        }, 1600)
      },
      onEnd: (finalText) => {
        const textToUse = finalText || latestTranscriptRef.current
        if (textToUse && textToUse.trim().length > 1) {
          handleQuery(textToUse)
        } else {
          setMode(prev => (prev === S.LISTENING ? S.IDLE : prev))
        }
      },
      onError: (err) => {
        console.warn('Voice recognition error:', err)
        setMode(S.IDLE)
      },
    })
    recognitionRef.current = rec
  }, [handleQuery])

  // ── wake word / click handler ──
  const handleWake = useCallback((inlineQuery = null) => {
    stopSpeaking()
    playActivationChime()
    setTranscript('')
    setReply('')
    setMode(S.ACTIVATING)

    if (inlineQuery && inlineQuery.trim().length > 2) {
      setTranscript(inlineQuery)
      setTimeout(() => {
        handleQuery(inlineQuery)
      }, 300)
    } else {
      // Speak the exact requested greeting and start listening
      const wakeGreeting = "Yes, please ask your question! How can I help you?"
      setReply(wakeGreeting)
      speakText(wakeGreeting, 'en', () => {
        startListening()
      }, SIRI_VOICE_PROFILE)
    }
  }, [handleQuery, startListening])

  // ── wire wake word hook (paused while assistant is open) ──
  useWakeWord({
    onWake: handleWake,
    enabled: true,
    paused: isActive,
  })

  // cleanup on unmount
  useEffect(() => () => dismiss(), [dismiss])

  // ── waveform random heights (re-calc on each render while animating) ──
  const barHeights = Array.from({ length: NUM_BARS }, () => 6 + Math.random() * 22)

  // ── gradient color string based on mode ──
  const orbGradient = mode === S.SPEAKING
    ? 'from-purple-500 via-blue-500 to-teal-400'
    : mode === S.THINKING
    ? 'from-amber-400 via-orange-400 to-rose-400'
    : 'from-blue-500 via-teal-400 to-indigo-500'

  return (
    <>
      {/* ── IDLE ORB (bottom-left) ── */}
      <AnimatePresence>
        {!isActive && (
          <motion.div
            key="idle-orb"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="fixed bottom-6 left-6 z-40"
          >
            <button
              onClick={() => handleWake()}
              className="relative w-14 h-14 group"
              title='Say "Hey Siri" or click'
            >
              {/* pulse rings */}
              <span className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 to-teal-400 opacity-20 animate-ping" />
              <span className="absolute inset-1.5 rounded-full bg-gradient-to-br from-blue-400 to-teal-400 opacity-10 animate-pulse" />
              {/* orb */}
              <div className={`relative w-14 h-14 rounded-full bg-gradient-to-br ${orbGradient} shadow-lg shadow-blue-500/40 flex items-center justify-center transition-transform duration-200 group-hover:scale-110`}>
                <Mic className="w-6 h-6 text-white drop-shadow" />
              </div>
              {/* tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap bg-slate-900/90 text-white text-[11px] font-medium px-2.5 py-1 rounded-lg shadow-lg">
                Say "Hey Siri" 🎙️
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── ACTIVE SIRI OVERLAY ── */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            key="siri-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4 sm:pb-0"
            style={{ background: 'rgba(2,6,23,0.6)', backdropFilter: 'blur(12px)' }}
            onClick={(e) => { if (e.target === e.currentTarget) dismiss() }}
          >
            <motion.div
              initial={{ y: 60, scale: 0.92, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 60, scale: 0.92, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
              className="w-full max-w-xs"
            >
              {/* Card */}
              <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border border-white/10"
                style={{ background: 'linear-gradient(145deg,#0a0f2e,#0d1b4b,#0a192f)' }}>

                {/* Glow bg decoration */}
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
                <div className="absolute -bottom-8 left-1/4 w-32 h-32 rounded-full bg-teal-400/10 blur-2xl pointer-events-none" />

                {/* Close button */}
                <button
                  onClick={dismiss}
                  className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-colors z-10"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Brand label */}
                <div className="pt-6 pb-1 flex justify-center">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                    <Sparkles className="w-3 h-3 text-teal-400" />
                    <span className="text-[11px] font-bold tracking-widest uppercase text-teal-300/80">MyCare AI</span>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-3 flex flex-col items-center">

                  {/* ── SIRI ORB ── */}
                  <div className="relative w-28 h-28 flex items-center justify-center mb-3">
                    {/* outer glow rings */}
                    {(mode === S.LISTENING || mode === S.SPEAKING) && (
                      <>
                        <motion.span
                          animate={{ scale: [1, 1.4], opacity: [0.3, 0] }}
                          transition={{ repeat: Infinity, duration: 1.4 }}
                          className={`absolute inset-0 rounded-full bg-gradient-to-br ${orbGradient}`}
                        />
                        <motion.span
                          animate={{ scale: [1, 1.2], opacity: [0.2, 0] }}
                          transition={{ repeat: Infinity, duration: 1.0, delay: 0.3 }}
                          className={`absolute inset-2 rounded-full bg-gradient-to-br ${orbGradient}`}
                        />
                      </>
                    )}
                    {/* main orb */}
                    <motion.div
                      onClick={() => {
                        stopSpeaking()
                        startListening()
                      }}
                      animate={{
                        scale: mode === S.LISTENING
                          ? [1, 1.07, 1]
                          : mode === S.SPEAKING
                          ? [1, 1.05, 1.09, 1.05, 1]
                          : mode === S.THINKING
                          ? [1, 1.03, 1]
                          : 1,
                      }}
                      transition={{ repeat: Infinity, duration: mode === S.SPEAKING ? 0.9 : 1.4, ease: 'easeInOut' }}
                      className={`w-24 h-24 rounded-full bg-gradient-to-br ${orbGradient} shadow-xl flex items-center justify-center cursor-pointer active:scale-95 transition-transform`}
                      style={{ boxShadow: '0 0 40px rgba(56,189,248,0.4), 0 0 80px rgba(20,184,166,0.2)' }}
                      title="Tap to speak"
                    >
                      {mode === S.THINKING ? (
                        <div className="flex gap-1.5 items-end">
                          {[0, 1, 2].map(i => (
                            <motion.span
                              key={i}
                              animate={{ height: ['8px', '20px', '8px'] }}
                              transition={{ repeat: Infinity, duration: 0.7, delay: i * 0.15 }}
                              className="w-1.5 rounded-full bg-white"
                              style={{ display: 'block' }}
                            />
                          ))}
                        </div>
                      ) : mode === S.SPEAKING ? (
                        <Volume2 className="w-8 h-8 text-white drop-shadow-lg" />
                      ) : (
                        <Mic className="w-8 h-8 text-white drop-shadow-lg" />
                      )}
                    </motion.div>
                  </div>

                  {/* ── SIRI WAVEFORM ── */}
                  {(mode === S.LISTENING || mode === S.SPEAKING) && (
                    <div className="flex items-center gap-[3px] h-9 mb-3">
                      {barHeights.map((h, i) => (
                        <motion.div
                          key={i}
                          className={`w-[3px] rounded-full bg-gradient-to-t ${
                            mode === S.SPEAKING
                              ? 'from-purple-400 to-blue-300'
                              : 'from-teal-400 to-blue-300'
                          }`}
                          animate={{ height: [`6px`, `${h}px`, `6px`] }}
                          transition={{
                            repeat: Infinity,
                            duration: 0.4 + Math.random() * 0.5,
                            delay: i * 0.04,
                            ease: 'easeInOut',
                          }}
                        />
                      ))}
                    </div>
                  )}

                  {/* ── STATUS TEXT ── */}
                  <div className="text-center min-h-[4rem] flex flex-col items-center justify-center gap-1.5 w-full">
                    {mode === S.ACTIVATING && (
                      <motion.p
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-teal-200 font-semibold text-xs sm:text-sm px-2 text-center"
                      >
                        "Yes, please ask your question! How can I help you?" 🎙️
                      </motion.p>
                    )}

                    {mode === S.LISTENING && !transcript && (
                      <p className="text-blue-200 text-sm font-medium animate-pulse">
                        Listening… go ahead 🎤
                      </p>
                    )}

                    {transcript && (mode === S.LISTENING || mode === S.THINKING) && (
                      <p className="text-white/60 text-xs italic px-2">"{transcript}"</p>
                    )}

                    {mode === S.THINKING && (
                      <p className="text-amber-300 text-xs font-medium animate-pulse">Thinking…</p>
                    )}

                    {mode === S.SPEAKING && reply && (
                      <p className="text-white text-xs leading-relaxed line-clamp-4 px-1">
                        {reply}
                      </p>
                    )}
                  </div>

                  {/* ── INTERACTIVE CONTROLS ── */}
                  {mode === S.LISTENING && transcript.trim().length > 1 && (
                    <button
                      onClick={() => handleQuery(transcript)}
                      className="mt-2.5 px-4 py-1.5 rounded-full bg-teal-500 hover:bg-teal-400 text-white text-xs font-bold shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Send Now</span>
                      <span>➔</span>
                    </button>
                  )}

                  {mode === S.SPEAKING && (
                    <button
                      onClick={() => {
                        stopSpeaking()
                        startListening()
                      }}
                      className="mt-2.5 px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Mic className="w-3.5 h-3.5 text-teal-400" />
                      <span>Tap to Ask Another Question</span>
                    </button>
                  )}

                  {/* ── PAGE CONTEXT CHIP ── */}
                  <div className="mt-3 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 flex items-center gap-1.5">
                    <span className="text-[10px]">📍</span>
                    <p className="text-[10px] text-white/40 font-medium">{pageName}</p>
                  </div>
                </div>
              </div>

              {/* Hint below */}
              <p className="text-center text-white/30 text-[11px] mt-3 font-medium">
                Tap outside or press X to close
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
