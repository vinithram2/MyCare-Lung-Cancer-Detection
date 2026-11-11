/**
 * Voice Activity Detection (VAD) and Audio Level Monitoring
 * Powered by browser Web Audio API (AudioContext & AnalyserNode).
 *
 * Capabilities:
 * - Real-time Root-Mean-Square (RMS) microphone decibel & energy calculation
 * - Zero-latency Speech Start trigger (for Barge-in and Speaking state)
 * - Silence Debounce trigger (auto-detects sentence completion)
 * - Continuous audio level callback for live waveform animations
 */

export function createVoiceActivityDetector({
  stream,
  onSpeechStart,
  onSpeechEnd,
  onAudioLevel,
  speechThreshold = 0.032,
  silenceDebounceMs = 1300,
}) {
  if (!stream) {
    console.warn('[VAD] No MediaStream provided.')
    return { destroy: () => {}, isSpeaking: () => false }
  }

  let audioCtx = null
  let analyser = null
  let source = null
  let animFrameId = null
  let isSpeaking = false
  let silenceTimer = null
  let isDestroyed = false

  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (!AudioContextClass) {
      console.warn('[VAD] Web Audio API is not supported in this browser.')
      return { destroy: () => {}, isSpeaking: () => false }
    }

    audioCtx = new AudioContextClass()
    analyser = audioCtx.createAnalyser()
    analyser.fftSize = 512
    analyser.smoothingTimeConstant = 0.25

    source = audioCtx.createMediaStreamSource(stream)
    source.connect(analyser)

    const dataArray = new Uint8Array(analyser.frequencyBinCount)

    const checkAudio = () => {
      if (isDestroyed) return

      analyser.getByteFrequencyData(dataArray)

      // Calculate Root-Mean-Square (RMS) energy
      let sum = 0
      for (let i = 0; i < dataArray.length; i++) {
        sum += (dataArray[i] / 255) * (dataArray[i] / 255)
      }
      const rms = Math.sqrt(sum / dataArray.length)

      // Normalize level with dynamic amplification curve for visualizer
      const normalizedLevel = Math.min(1.0, rms * 3.5)
      if (onAudioLevel) {
        onAudioLevel(normalizedLevel)
      }

      // Voice Activity Detection logic
      if (rms >= speechThreshold) {
        // User is actively speaking
        if (silenceTimer) {
          clearTimeout(silenceTimer)
          silenceTimer = null
        }

        if (!isSpeaking) {
          isSpeaking = true
          if (onSpeechStart) {
            onSpeechStart(rms)
          }
        }
      } else {
        // Volume is below threshold
        if (isSpeaking && !silenceTimer) {
          silenceTimer = setTimeout(() => {
            if (isSpeaking && !isDestroyed) {
              isSpeaking = false
              silenceTimer = null
              if (onSpeechEnd) {
                onSpeechEnd()
              }
            }
          }, silenceDebounceMs)
        }
      }

      animFrameId = requestAnimationFrame(checkAudio)
    }

    // Resume AudioContext if suspended (browser autoplay policy)
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().then(() => {
        checkAudio()
      }).catch(() => {
        checkAudio()
      })
    } else {
      checkAudio()
    }

  } catch (err) {
    console.error('[VAD] Initialization error:', err)
  }

  return {
    destroy: () => {
      isDestroyed = true
      if (animFrameId) cancelAnimationFrame(animFrameId)
      if (silenceTimer) clearTimeout(silenceTimer)
      if (source) {
        try { source.disconnect() } catch {}
      }
      if (analyser) {
        try { analyser.disconnect() } catch {}
      }
      if (audioCtx && audioCtx.state !== 'closed') {
        try { audioCtx.close() } catch {}
      }
    },
    isSpeaking: () => isSpeaking,
  }
}
