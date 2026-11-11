/**
 * useVoiceCall — Real-Time Full-Duplex Voice Call Hook for MyCare AI Assistant.
 *
 * Architecture & Features:
 * - Real-time WebSocket connection to /api/ws/voice for bidirectional streaming
 * - Continuous Web Audio API Voice Activity Detection (VAD) & audio level tracking
 * - Zero Push-to-Talk: hands-free automatic pause detection
 * - Low-latency sentence-by-sentence streaming Speech Synthesis (TTS)
 * - Instant Barge-In / Interruption: speech cancels AI voice immediately and switches to listening
 * - Spoken natural greeting on call connect
 * - Microphone AGC, noise suppression, and permission error handling
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import {
  startVoiceRecognition,
  StreamingSpeechQueue,
  stopSpeaking,
  isSpeechRecognitionSupported,
  isSpeechSynthesisSupported,
} from '../utils/speech.js'
import { createVoiceActivityDetector } from '../utils/vad.js'

export const CALL_STATUS = {
  IDLE:       'idle',
  CONNECTING: 'connecting',
  LISTENING:  'listening',
  THINKING:   'thinking',
  SPEAKING:   'speaking',
  MUTED:      'muted',
  ENDED:      'ended',
}

// Simple audio tone generator
function playTone(type) {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext
    if (!Ctx) return
    const ctx = new Ctx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)

    if (type === 'connect') {
      osc.frequency.setValueAtTime(440, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.18)
      gain.gain.setValueAtTime(0.2, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.35)
    } else if (type === 'end') {
      osc.frequency.setValueAtTime(700, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(350, ctx.currentTime + 0.2)
      gain.gain.setValueAtTime(0.2, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.35)
    }
  } catch {}
}

export function useVoiceCall({
  language = 'en',
  voiceProfile = null,
  onMessageReceived,
  getContextSummary = null,
}) {
  const [callStatus, setCallStatus] = useState(CALL_STATUS.IDLE)
  const [callDuration, setCallDuration] = useState(0)
  const [liveTranscript, setLiveTranscript] = useState('')
  const [aiLiveTranscript, setAiLiveTranscript] = useState('')
  const [audioLevel, setAudioLevel] = useState(0)
  const [permissionError, setPermissionError] = useState('')
  
  const wsRef = useRef(null)
  const micStreamRef = useRef(null)
  const vadRef = useRef(null)
  const recognitionRef = useRef(null)
  const speechQueueRef = useRef(null)
  const silenceTimerRef = useRef(null)
  const timerIntervalRef = useRef(null)
  
  const isMutedRef = useRef(false)
  const callActiveRef = useRef(false)
  const latestSpeechRef = useRef('')
  const statusRef = useRef(callStatus)
  const isInterruptedRef = useRef(false)

  // Keep statusRef synchronized
  useEffect(() => {
    statusRef.current = callStatus
  }, [callStatus])

  const isCallActive = callStatus !== CALL_STATUS.IDLE && callStatus !== CALL_STATUS.ENDED

  // Format call duration into mm:ss
  const formattedDuration = `${String(Math.floor(callDuration / 60)).padStart(2, '0')}:${String(callDuration % 60).padStart(2, '0')}`

  // Call timer
  useEffect(() => {
    if (isCallActive && callStatus !== CALL_STATUS.CONNECTING) {
      timerIntervalRef.current = setInterval(() => {
        setCallDuration(d => d + 1)
      }, 1000)
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
    }
  }, [isCallActive, callStatus])

  // Stop active speech recognition
  const stopRecognition = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current)
      silenceTimerRef.current = null
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.stop() } catch {}
      recognitionRef.current = null
    }
  }, [])

  // Send message over WebSocket helper
  const sendWs = useCallback((data) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data))
    }
  }, [])

  // Perform Barge-In / Interruption
  const handleBargeIn = useCallback(() => {
    if (!callActiveRef.current) return
    console.log('[VoiceCall] User interrupted AI speech (Barge-in).')

    // 1. Cancel in-flight TTS playback immediately
    if (speechQueueRef.current) {
      speechQueueRef.current.cancel()
    }
    stopSpeaking()

    // 2. Notify backend to cancel generation
    sendWs({ type: 'barge_in' })

    // 3. Update state to Listening immediately
    setCallStatus(CALL_STATUS.LISTENING)
    setAiLiveTranscript('')
    isInterruptedRef.current = true
  }, [sendWs])

  // Submit user speech turn to AI backend
  const submitSpeechTurn = useCallback((userText) => {
    const text = (userText || '').trim()
    if (!text || !callActiveRef.current) return

    setLiveTranscript('')
    latestSpeechRef.current = ''
    setCallStatus(CALL_STATUS.THINKING)
    setAiLiveTranscript('')

    // Append user message to chat UI
    if (onMessageReceived) {
      onMessageReceived({
        sender: 'user',
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      })
    }

    // Initialize fresh streaming speech queue for this turn
    if (speechQueueRef.current) {
      speechQueueRef.current.cancel()
    }

    speechQueueRef.current = new StreamingSpeechQueue({
      language,
      voiceProfile,
      onStartSpeaking: () => {
        if (callActiveRef.current && !isMutedRef.current) {
          setCallStatus(CALL_STATUS.SPEAKING)
        }
      },
      onFinished: () => {
        // AI finished speaking this entire response turn -> automatically resume listening!
        if (callActiveRef.current && !isMutedRef.current) {
          setCallStatus(CALL_STATUS.LISTENING)
          setAiLiveTranscript('')
        }
      },
    })

    // Send query via WebSocket
    const pageContext = getContextSummary ? getContextSummary() : null
    sendWs({
      type: 'user_speech_final',
      text,
      language,
      page_context: pageContext,
    })
  }, [language, voiceProfile, onMessageReceived, getContextSummary, sendWs])

  // Start continuous speech recognition loop
  const startContinuousListening = useCallback(() => {
    if (!callActiveRef.current || isMutedRef.current) return
    stopRecognition()

    const rec = startVoiceRecognition({
      language,
      continuous: true,
      onStart: () => {
        if (callActiveRef.current && !isMutedRef.current && statusRef.current !== CALL_STATUS.SPEAKING) {
          setCallStatus(CALL_STATUS.LISTENING)
        }
      },
      onResult: (transcript, isFinal) => {
        if (!callActiveRef.current || isMutedRef.current) return

        // If AI is speaking and user says words -> Barge-in immediately!
        if (statusRef.current === CALL_STATUS.SPEAKING && transcript.trim().length > 1) {
          handleBargeIn()
        }

        setLiveTranscript(transcript)
        latestSpeechRef.current = transcript

        // Broadcast interim words for preview
        sendWs({
          type: 'user_speech_interim',
          text: transcript,
          is_final: isFinal,
        })

        // Silence debounce
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current)
        }

        // 1.3s of silence -> submit query
        silenceTimerRef.current = setTimeout(() => {
          if (latestSpeechRef.current && latestSpeechRef.current.trim().length > 1) {
            submitSpeechTurn(latestSpeechRef.current)
          }
        }, 1300)
      },
      onEnd: (finalTranscript) => {
        // STT ended, restart immediately if still in call
        if (callActiveRef.current && !isMutedRef.current) {
          const textToUse = finalTranscript || latestSpeechRef.current
          if (textToUse && textToUse.trim().length > 1) {
            submitSpeechTurn(textToUse)
          }
          // Restart STT to keep always-listening active
          setTimeout(() => {
            if (callActiveRef.current && !isMutedRef.current) {
              startContinuousListening()
            }
          }, 150)
        }
      },
      onError: (err) => {
        console.warn('[VoiceCall] STT warning:', err)
        // Auto-recover after momentary error
        if (callActiveRef.current && !isMutedRef.current) {
          setTimeout(() => {
            if (callActiveRef.current && !isMutedRef.current) {
              startContinuousListening()
            }
          }, 400)
        }
      },
    })
    recognitionRef.current = rec
  }, [language, submitSpeechTurn, handleBargeIn, sendWs, stopRecognition])

  // Start the voice call
  const startCall = useCallback(async () => {
    setPermissionError('')
    setCallDuration(0)
    setLiveTranscript('')
    setAiLiveTranscript('')
    setAudioLevel(0)
    latestSpeechRef.current = ''
    isMutedRef.current = false

    if (!isSpeechRecognitionSupported()) {
      setPermissionError('Speech Recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.')
      return
    }

    // 1. Capture real microphone with hardware AGC and noise suppression
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('MediaDevices API not available (requires HTTPS or localhost).')
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          autoGainControl: true,
          echoCancellation: true,
          noiseSuppression: true,
          channelCount: 1,
        }
      })
      micStreamRef.current = stream

      // 2. Initialize real-time Web Audio VAD
      if (vadRef.current) vadRef.current.destroy()
      vadRef.current = createVoiceActivityDetector({
        stream,
        onAudioLevel: (lvl) => {
          setAudioLevel(lvl)
        },
        onSpeechStart: () => {
          // Barge-in trigger when user starts speaking while AI is talking
          if (statusRef.current === CALL_STATUS.SPEAKING) {
            handleBargeIn()
          }
        },
        onSpeechEnd: () => {
          // Pause detected
          if (latestSpeechRef.current && latestSpeechRef.current.trim().length > 1) {
            submitSpeechTurn(latestSpeechRef.current)
          }
        },
      })

    } catch (err) {
      console.error('[VoiceCall] Mic initialization error:', err)
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionError('Microphone permission denied. Please click the camera/mic icon in your address bar and allow microphone access.')
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setPermissionError('No microphone detected. Please plug in a microphone or headset and try again.')
      } else {
        setPermissionError(`Microphone error: ${err.message || 'Unable to access audio input.'}`)
      }
      return
    }

    callActiveRef.current = true
    setCallStatus(CALL_STATUS.CONNECTING)
    playTone('connect')

    // 3. Establish WebSocket connection to backend
    try {
      const loc = window.location
      const protocol = loc.protocol === 'https:' ? 'wss:' : 'ws:'
      const wsHost = loc.host || 'localhost:5173'
      const wsUrl = `${protocol}//${wsHost}/api/ws/voice`

      if (wsRef.current) {
        try { wsRef.current.close() } catch {}
      }

      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => {
        console.log('[VoiceCall] WebSocket connected successfully.')
        ws.send(JSON.stringify({
          type: 'start_call',
          language,
        }))
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          
          if (data.type === 'call_connected') {
            // Initial greeting streaming started
            speechQueueRef.current = new StreamingSpeechQueue({
              language: data.language || language,
              voiceProfile,
              onStartSpeaking: () => {
                if (callActiveRef.current) setCallStatus(CALL_STATUS.SPEAKING)
              },
              onFinished: () => {
                if (callActiveRef.current) {
                  setCallStatus(CALL_STATUS.LISTENING)
                  setAiLiveTranscript('')
                  startContinuousListening()
                }
              },
            })
          }
          
          else if (data.type === 'ai_state') {
            if (data.state === 'thinking') {
              setCallStatus(CALL_STATUS.THINKING)
            } else if (data.state === 'listening') {
              setCallStatus(CALL_STATUS.LISTENING)
              setAiLiveTranscript('')
            }
          }
          
          else if (data.type === 'ai_sentence_stream') {
            // Live sentence streamed from backend
            if (callActiveRef.current) {
              setAiLiveTranscript(data.accumulated_text || data.sentence)
              if (speechQueueRef.current) {
                speechQueueRef.current.enqueue(data.sentence, data.is_final_sentence)
              }
            }
          }
          
          else if (data.type === 'ai_stream_end') {
            // Stream complete
            if (speechQueueRef.current) {
              speechQueueRef.current.markStreamEnd()
            }
            if (onMessageReceived && data.full_text && !data.is_greeting) {
              onMessageReceived({
                sender: 'assistant',
                text: data.full_text,
                actionButtons: data.action_buttons || null,
                suggestions: data.suggestions || [],
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              })
            }
          }

        } catch (err) {
          console.error('[VoiceCall] WS message parse error:', err)
        }
      }

      ws.onerror = (err) => {
        console.warn('[VoiceCall] WebSocket error:', err)
      }

      ws.onclose = () => {
        console.log('[VoiceCall] WebSocket closed.')
      }

    } catch (err) {
      console.error('[VoiceCall] WS initiation failed:', err)
    }

    // Start background listening
    startContinuousListening()

  }, [language, voiceProfile, handleBargeIn, submitSpeechTurn, startContinuousListening, onMessageReceived])

  // End the voice call
  const endCall = useCallback(() => {
    callActiveRef.current = false
    isMutedRef.current = false
    
    stopRecognition()
    if (speechQueueRef.current) {
      speechQueueRef.current.cancel()
      speechQueueRef.current = null
    }
    stopSpeaking()
    
    if (vadRef.current) {
      vadRef.current.destroy()
      vadRef.current = null
    }
    
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(t => t.stop())
      micStreamRef.current = null
    }

    sendWs({ type: 'end_call' })
    if (wsRef.current) {
      try { wsRef.current.close() } catch {}
      wsRef.current = null
    }

    playTone('end')
    setCallStatus(CALL_STATUS.ENDED)
    setLiveTranscript('')
    setAiLiveTranscript('')
    setAudioLevel(0)

    setTimeout(() => {
      setCallStatus(CALL_STATUS.IDLE)
      setCallDuration(0)
    }, 1200)
  }, [stopRecognition, sendWs])

  // Toggle Mute / Unmute
  const toggleMute = useCallback(() => {
    if (callStatus === CALL_STATUS.MUTED) {
      isMutedRef.current = false
      setCallStatus(CALL_STATUS.LISTENING)
      startContinuousListening()
    } else {
      isMutedRef.current = true
      stopRecognition()
      setCallStatus(CALL_STATUS.MUTED)
    }
  }, [callStatus, startContinuousListening, stopRecognition])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      callActiveRef.current = false
      stopRecognition()
      if (speechQueueRef.current) speechQueueRef.current.cancel()
      stopSpeaking()
      if (vadRef.current) vadRef.current.destroy()
      if (micStreamRef.current) micStreamRef.current.getTracks().forEach(t => t.stop())
      if (wsRef.current) {
        try { wsRef.current.close() } catch {}
      }
    }
  }, [stopRecognition])

  return {
    callStatus,
    isCallActive,
    callDuration: formattedDuration,
    liveTranscript,
    aiLiveTranscript,
    audioLevel,
    permissionError,
    startCall,
    endCall,
    toggleMute,
    isMuted: callStatus === CALL_STATUS.MUTED,
  }
}
