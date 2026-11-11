/**
 * useWakeWord — High-Sensitivity continuous background speech recognition hook.
 *
 * Features:
 * - Hardware Auto-Gain Control (AGC) & Noise Suppression mic boost
 * - 5-alternative phonetic fuzzy detection for "Siri", "Hey Siri", "MyCare"
 * - Instant 200ms auto-recovery loop (zero dead gaps)
 * - Immediate unlock on page load or first user click
 */
import { useEffect, useRef, useCallback } from 'react'

// All phonetic triggers for "Siri" and "MyCare"
const PHONETIC_TRIGGERS = [
  'hey siri',
  'hay siri',
  'hi siri',
  'ok siri',
  'hey city',
  'hey cherry',
  'hey serious',
  'hey series',
  'hey sue',
  'hey cd',
  'hey see',
  'hey c',
  'siri',
  'shiri',
  'sheeri',
  'siree',
  'seree',
  'seri',
  'ceri',
  'sidi',
  'suri',
  'sari',
  'see ree',
  'hey mycare',
  'hey my care',
  'hay mycare',
  'hay my care',
  'mycare',
  'my care',
  'ok mycare',
  'hi mycare',
  'hey care',
  'hay care',
]

/**
 * Check if text contains any wake word and extract query after it.
 */
function matchWakePhrase(rawText) {
  const clean = rawText.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ').replace(/\s+/g, ' ').trim()
  
  for (const trigger of PHONETIC_TRIGGERS) {
    const idx = clean.indexOf(trigger)
    if (idx !== -1) {
      const query = clean.slice(idx + trigger.length).trim()
      return { matched: true, trigger, query: query.length > 2 ? query : null }
    }
  }
  return { matched: false, trigger: null, query: null }
}

/**
 * @param {Object}   opts
 * @param {Function} opts.onWake    - called with (inlineQuery: string|null) when wake word heard
 * @param {boolean}  [opts.enabled] - master on/off
 * @param {boolean}  [opts.paused]  - temporarily paused (e.g. when chatbot is already listening)
 */
export function useWakeWord({ onWake, enabled = true, paused = false }) {
  const recognitionRef = useRef(null)
  const restartTimerRef = useRef(null)
  const activeRef = useRef(enabled && !paused)
  const onWakeRef = useRef(onWake)
  const micBoostStreamRef = useRef(null)

  useEffect(() => { onWakeRef.current = onWake }, [onWake])
  useEffect(() => { activeRef.current = enabled && !paused }, [enabled, paused])

  // Stop recognition
  const stopListening = useCallback(() => {
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current)
      restartTimerRef.current = null
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.stop() } catch {}
      recognitionRef.current = null
    }
  }, [])

  // Start high-sensitivity recognition loop
  const startListening = useCallback(() => {
    if (!activeRef.current) return
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) return
    if (recognitionRef.current) return // already active

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-IN'
    recognition.maxAlternatives = 5

    recognition.onresult = (event) => {
      if (!activeRef.current) return

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i]
        for (let a = 0; a < res.length; a++) {
          const raw = res[a].transcript || ''
          const { matched, query } = matchWakePhrase(raw)
          if (matched) {
            recognitionRef.current = null
            try { recognition.stop() } catch {}
            onWakeRef.current(query)
            return
          }
        }
      }
    }

    recognition.onend = () => {
      recognitionRef.current = null
      if (!activeRef.current) return
      // Instant rapid recovery loop (200ms)
      restartTimerRef.current = setTimeout(startListening, 200)
    }

    recognition.onerror = (e) => {
      recognitionRef.current = null
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') return
      if (!activeRef.current) return
      restartTimerRef.current = setTimeout(startListening, 400)
    }

    try {
      recognition.start()
      recognitionRef.current = recognition
    } catch {
      restartTimerRef.current = setTimeout(startListening, 400)
    }
  }, [])

  // Request hardware Auto-Gain mic boost
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({
        audio: {
          autoGainControl: true,
          echoCancellation: true,
          noiseSuppression: true,
        }
      }).then(stream => {
        micBoostStreamRef.current = stream
      }).catch(() => {})
    }

    return () => {
      if (micBoostStreamRef.current) {
        try {
          micBoostStreamRef.current.getTracks().forEach(t => t.stop())
        } catch {}
      }
    }
  }, [])

  // Start listening immediately
  useEffect(() => {
    if (enabled && !paused) {
      const t = setTimeout(startListening, 400)
      
      // Also unlock on first user click or key anywhere
      const unlockMic = () => {
        startListening()
        window.removeEventListener('click', unlockMic)
        window.removeEventListener('keydown', unlockMic)
      }
      window.addEventListener('click', unlockMic)
      window.addEventListener('keydown', unlockMic)

      return () => {
        clearTimeout(t)
        window.removeEventListener('click', unlockMic)
        window.removeEventListener('keydown', unlockMic)
      }
    } else {
      stopListening()
    }
  }, [enabled, paused, startListening, stopListening])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      activeRef.current = false
      stopListening()
    }
  }, [stopListening])
}
