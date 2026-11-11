import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  Radio,
  Loader2,
  Sparkles,
  AlertCircle,
  Zap
} from 'lucide-react'
import { CALL_STATUS } from '../hooks/useVoiceCall.js'

export default function VoiceCallBanner({
  callStatus,
  callDuration,
  liveTranscript,
  aiLiveTranscript,
  audioLevel = 0,
  permissionError,
  onEndCall,
  onToggleMute,
  isMuted,
}) {
  if (callStatus === CALL_STATUS.IDLE && !permissionError) return null

  // Status configuration
  const statusConfig = {
    [CALL_STATUS.CONNECTING]: {
      label: 'Connecting Live Call...',
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      icon: Loader2,
      spin: true,
      dotColor: 'bg-amber-400',
    },
    [CALL_STATUS.LISTENING]: {
      label: 'Listening to you...',
      badgeBg: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
      icon: Mic,
      pulse: true,
      dotColor: 'bg-teal-400',
    },
    [CALL_STATUS.THINKING]: {
      label: 'Processing...',
      badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      icon: Sparkles,
      spin: true,
      dotColor: 'bg-blue-400',
    },
    [CALL_STATUS.SPEAKING]: {
      label: 'AI Speaking...',
      badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      icon: Volume2,
      pulse: true,
      dotColor: 'bg-purple-400',
    },
    [CALL_STATUS.MUTED]: {
      label: 'Microphone Muted',
      badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      icon: MicOff,
      dotColor: 'bg-rose-400',
    },
    [CALL_STATUS.ENDED]: {
      label: 'Call Ended',
      badgeBg: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
      icon: PhoneOff,
      dotColor: 'bg-slate-400',
    },
  }

  const currentStatus = statusConfig[callStatus] || statusConfig[CALL_STATUS.CONNECTING]
  const StatusIcon = currentStatus.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: -12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.98 }}
      className="w-full bg-gradient-to-r from-slate-900 via-slate-850 to-teal-950 border border-teal-500/30 rounded-2xl p-4 sm:p-5 shadow-2xl mb-4 text-white relative overflow-hidden"
    >
      {/* Dynamic background glow based on call status */}
      <div
        className={`absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
          callStatus === CALL_STATUS.SPEAKING
            ? 'bg-purple-500/15'
            : callStatus === CALL_STATUS.LISTENING
            ? 'bg-teal-500/20'
            : 'bg-blue-500/10'
        }`}
      />

      {permissionError ? (
        <div className="flex items-center gap-3 text-rose-300 text-xs sm:text-sm p-1">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
          <p className="font-medium">{permissionError}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {/* Top Bar: Status, Call Timer, and Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            {/* Left: Status Badge & Live Waveform */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-all ${
                  callStatus === CALL_STATUS.SPEAKING
                    ? 'bg-purple-500/20 border-purple-500/40'
                    : 'bg-teal-500/20 border-teal-500/40'
                }`}>
                  <StatusIcon className={`w-5 h-5 ${callStatus === CALL_STATUS.SPEAKING ? 'text-purple-300' : 'text-teal-300'} ${currentStatus.spin ? 'animate-spin' : ''}`} />
                </div>
                {currentStatus.pulse && (
                  <span className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full ${currentStatus.dotColor} animate-ping`} />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold border tracking-wide uppercase ${currentStatus.badgeBg}`}>
                    {currentStatus.label}
                  </span>
                  <span className="text-xs text-slate-400 font-mono font-bold bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700/50">
                    {callDuration}
                  </span>
                </div>

                {/* Real-Time Reactive Waveform */}
                <div className="flex items-center gap-1 h-3.5 mt-2">
                  {[0.3, 0.7, 1.0, 0.5, 0.9, 0.4, 0.8, 1.0, 0.6, 0.85, 0.4, 0.7].map((multiplier, i) => {
                    const dynamicHeight = callStatus === CALL_STATUS.LISTENING
                      ? Math.max(4, Math.min(22, 4 + audioLevel * multiplier * 24))
                      : callStatus === CALL_STATUS.SPEAKING
                      ? 6 + Math.sin(Date.now() / 200 + i) * 6 + 6
                      : 4

                    return (
                      <motion.span
                        key={i}
                        className={`w-1 rounded-full transition-all duration-75 ${
                          callStatus === CALL_STATUS.SPEAKING
                            ? 'bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.5)]'
                            : 'bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.5)]'
                        }`}
                        style={{ height: `${dynamicHeight}px` }}
                      />
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Right: Controls & Interruption info */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={onToggleMute}
                disabled={callStatus === CALL_STATUS.CONNECTING || callStatus === CALL_STATUS.ENDED}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isMuted
                    ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                }`}
                title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
              >
                {isMuted ? <MicOff className="w-4 h-4 text-rose-400" /> : <Mic className="w-4 h-4 text-teal-400" />}
                <span>{isMuted ? 'Unmute' : 'Mute'}</span>
              </button>

              <button
                onClick={onEndCall}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
                title="End Voice Call"
              >
                <PhoneOff className="w-4 h-4" />
                <span>End Call</span>
              </button>
            </div>
          </div>

          {/* Real-Time Live Transcripts & Streaming Response */}
          <div className="grid grid-cols-1 gap-2 pt-1">
            {/* Live User Utterance */}
            {liveTranscript && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-teal-500/10 border border-teal-500/20 text-xs text-teal-200">
                <Mic className="w-3.5 h-3.5 text-teal-400 flex-shrink-0 animate-pulse" />
                <span className="font-semibold text-teal-300">You:</span>
                <span className="italic truncate">{liveTranscript}</span>
              </div>
            )}

            {/* Live AI Streaming Response */}
            {aiLiveTranscript && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-200">
                <Volume2 className="w-3.5 h-3.5 text-purple-400 flex-shrink-0 animate-bounce" />
                <span className="font-semibold text-purple-300">MyCare AI:</span>
                <span className="truncate">{aiLiveTranscript}</span>
              </div>
            )}

            {/* Barge-in Interruption hint */}
            {callStatus === CALL_STATUS.SPEAKING && (
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <Zap className="w-3 h-3 text-amber-400 flex-shrink-0" />
                <span>Barge-in active: speak at any time to interrupt the AI.</span>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  )
}
