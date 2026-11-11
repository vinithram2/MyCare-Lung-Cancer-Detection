/**
 * Web Speech Recognition (Speech-to-Text) and Synthesis (Text-to-Speech)
 * Supporting English, Hindi (हिन्दी), and Kannada (ಕನ್ನಡ).
 */

/**
 * Voice profiles for Text-to-Speech output.
 * Users can pick from 4 distinct styles.
 */
export const VOICE_PROFILES = [
  {
    id: 'default',
    label: 'Default',
    emoji: '🔊',
    description: 'Natural balanced voice',
    rate: 0.95,
    pitch: 1.0,
    volume: 1.0,
    preferFemale: false,
  },
  {
    id: 'calm_female',
    label: 'Calm Female',
    emoji: '👩',
    description: 'Soft, slow & soothing',
    rate: 0.82,
    pitch: 1.25,
    volume: 0.95,
    preferFemale: true,
  },
  {
    id: 'deep_male',
    label: 'Deep Male',
    emoji: '👨',
    description: 'Deep, clear & authoritative',
    rate: 0.88,
    pitch: 0.72,
    volume: 1.0,
    preferFemale: false,
  },
  {
    id: 'fast_energetic',
    label: 'Fast & Energetic',
    emoji: '⚡',
    description: 'Quick, upbeat & clear',
    rate: 1.22,
    pitch: 1.1,
    volume: 1.0,
    preferFemale: false,
  },
]

/**
 * SIRI_VOICE_PROFILE — smooth, natural AI assistant voice.
 * Tries to pick the best available voice (Microsoft Aria > Google Female > Samantha).
 * Rate/pitch tuned to sound like Siri.
 */
export const SIRI_VOICE_PROFILE = {
  id: 'siri_ai',
  label: 'MyCare AI',
  emoji: '🤖',
  description: 'Smooth Siri-style AI voice',
  rate: 0.97,
  pitch: 1.08,
  volume: 1.0,
  preferFemale: true,
}

/**
 * Returns the smoothest available TTS voice in priority order:
 * Microsoft Aria Online → Google US English → Samantha → Victoria → Zira → any female → first en voice
 * @returns {SpeechSynthesisVoice|null}
 */
export function getSiriVoice() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null
  const voices = window.speechSynthesis.getVoices()
  if (!voices.length) return null

  // Priority order — best sounding AI voices
  const PRIORITY_NAMES = [
    'microsoft aria online',
    'aria',
    'google us english',
    'google uk english female',
    'samantha',
    'victoria',
    'zira',
    'karen',
    'moira',
    'tessa',
    'fiona',
  ]

  for (const name of PRIORITY_NAMES) {
    const match = voices.find(v => v.name.toLowerCase().includes(name))
    if (match) return match
  }

  // Fallback: any female-sounding en voice
  const femaleKeywords = ['female', 'woman', 'girl']
  const female = voices.find(v => {
    const n = v.name.toLowerCase()
    return v.lang.startsWith('en') && femaleKeywords.some(k => n.includes(k))
  })
  if (female) return female

  // Last resort: first English voice
  return voices.find(v => v.lang.startsWith('en')) || null
}

export const SUPPORTED_LANGUAGES = [
  {
    code: 'en',
    label: 'English',
    nativeLabel: 'English',
    speechLocale: 'en-IN',
    flag: '🌐',
    greeting: 'Hello! How can I assist with your lung health today?',
    placeholder: 'Ask about lung cancer, symptoms, CT scans... or click Mic to speak',
    listeningText: 'Listening in English... Speak clearly into your mic',
  },
  {
    code: 'hi',
    label: 'Hindi',
    nativeLabel: 'हिन्दी',
    speechLocale: 'hi-IN',
    flag: '🇮🇳',
    greeting: 'नमस्ते! मैं आपकी फेफड़ों के स्वास्थ्य में कैसे मदद कर सकता हूँ?',
    placeholder: 'लक्षणों, सीटी स्कैन, या उपचार के बारे में पूछें... या बोलें',
    listeningText: 'हिन्दी में सुन रहे हैं... कृपया अपने माइक में बोलें',
  },
  {
    code: 'kn',
    label: 'Kannada',
    nativeLabel: 'ಕನ್ನಡ',
    speechLocale: 'kn-IN',
    flag: '🟡🔴',
    greeting: 'ನಮಸ್ಕಾರ! ಶ್ವಾಸಕೋಶದ ಆರೋಗ್ಯದ ಬಗ್ಗೆ ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?',
    placeholder: 'ರೋಗಲಕ್ಷಣ, ಸಿಟಿ ಸ್ಕ್ಯಾನ್, ಚಿಕಿತ್ಸೆ ಬಗ್ಗೆ ಕೇಳಿ... ಅಥವಾ ಮಾತನಾಡಿ',
    listeningText: 'ಕನ್ನಡದಲ್ಲಿ ಆಲಿಸಲಾಗುತ್ತಿದೆ... ದಯವಿಟ್ಟು ಮೈಕ್‌ನಲ್ಲಿ ಮಾತನಾಡಿ',
  },
]

/**
 * Check if speech recognition is supported in this browser.
 */
export function isSpeechRecognitionSupported() {
  return typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)
}

/**
 * Check if speech synthesis (TTS) is supported.
 */
export function isSpeechSynthesisSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

/**
 * Start speech recognition.
 * @param {Object} options
 * @param {string} options.language - 'en' | 'hi' | 'kn'
 * @param {boolean} [options.continuous] - continuous listening without immediate cutoff
 * @param {Function} options.onResult - callback with (transcript, isFinal)
 * @param {Function} options.onStart - callback when mic starts
 * @param {Function} options.onEnd - callback when mic ends
 * @param {Function} options.onError - callback with error string
 * @returns {Object|null} recognition instance
 */
export function startVoiceRecognition({ language = 'en', continuous = true, onResult, onStart, onEnd, onError }) {
  if (!isSpeechRecognitionSupported()) {
    if (onError) onError('Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.')
    return null
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  const recognition = new SpeechRecognition()

  const langObj = SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0]
  recognition.lang = langObj.speechLocale
  recognition.continuous = continuous
  recognition.interimResults = true
  recognition.maxAlternatives = 1

  recognition.onstart = () => {
    if (onStart) onStart()
  }

  let fullTranscript = ''

  recognition.onresult = (event) => {
    let interim = ''
    let latestFinal = ''

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      const piece = event.results[i][0].transcript
      if (event.results[i].isFinal) {
        latestFinal += piece
      } else {
        interim += piece
      }
    }

    if (latestFinal) {
      fullTranscript = (fullTranscript + ' ' + latestFinal).trim()
    }

    const currentDisplay = (fullTranscript + (interim ? ' ' + interim : '')).trim()
    if (onResult && currentDisplay) {
      onResult(currentDisplay, !!latestFinal)
    }
  }

  recognition.onerror = (event) => {
    let msg = 'Voice recognition error.'
    if (event.error === 'not-allowed') {
      msg = 'Microphone permission denied. Please allow microphone access in your browser.'
    } else if (event.error === 'no-speech') {
      msg = 'No speech detected. Please try speaking again.'
    } else if (event.error === 'network') {
      msg = 'Network error during voice recognition.'
    }
    if (onError) onError(msg)
  }

  recognition.onend = () => {
    if (onEnd) onEnd(fullTranscript)
  }

  try {
    recognition.start()
    return recognition
  } catch (err) {
    if (onError) onError(err.message || 'Could not start voice recognition.')
    return null
  }
}

/**
 * Clean markdown symbols for natural text-to-speech reading.
 */
function cleanTextForSpeech(rawText) {
  return rawText
    .replace(/\*\*(.*?)\*\*/g, '$1')  // bold
    .replace(/\*(.*?)\*/g, '$1')      // italic
    .replace(/•/g, '')                // bullet point
    .replace(/#{1,6}\s?/g, '')        // headers
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // links
    .replace(/[\(\)]/g, ', ')         // parentheses to natural pauses
    .replace(/\n+/g, '. ')            // line breaks to sentence pauses
}

/**
 * Split long response into clean sentence chunks so Chrome TTS never cuts off mid-sentence.
 */
function splitIntoSentences(text) {
  const clean = cleanTextForSpeech(text)
  const rawParts = clean.split(/(?<=[.?!:;\n])\s+/)
  const sentences = []

  for (const s of rawParts) {
    const trimmed = s.trim().replace(/^[-•*#\s]+/, '')
    if (!trimmed) continue
    if (trimmed.length > 140) {
      const commaParts = trimmed.split(/(?<=[,])\s+/)
      for (const cp of commaParts) {
        if (cp.trim()) sentences.push(cp.trim())
      }
    } else {
      sentences.push(trimmed)
    }
  }
  return sentences.length > 0 ? sentences : [clean]
}

/**
 * Preload browser voices on load
 */
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.getVoices()
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = () => {
      try { window.speechSynthesis.getVoices() } catch {}
    }
  }
}

// Global active queue tracker for cancelation
let activeSpeechQueueId = 0

/**
 * Speak text aloud using SpeechSynthesis with Sentence-Chunk Queueing so it NEVER cuts off mid-way.
 * @param {string} text - text to speak
 * @param {string} language - 'en' | 'hi' | 'kn'
 * @param {Function} [onEnd] - callback when finished speaking the entire text
 * @param {Object} [voiceProfile] - optional profile from VOICE_PROFILES
 * @returns {number} active queue id
 */
export function speakText(text, language = 'en', onEnd = null, voiceProfile = null) {
  if (!isSpeechSynthesisSupported()) {
    if (onEnd) onEnd()
    return 0
  }

  try {
    window.speechSynthesis.cancel()
    window.speechSynthesis.resume()
  } catch {}

  const sentences = splitIntoSentences(text)
  if (sentences.length === 0) {
    if (onEnd) onEnd()
    return 0
  }

  const currentQueueId = ++activeSpeechQueueId
  const langObj = SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0]
  const profile = voiceProfile || { rate: 0.95, pitch: 1.0, volume: 1.0, preferFemale: false }

  // Resolve matching voice once
  const voices = window.speechSynthesis.getVoices()
  let selectedVoice = null

  if (profile.id === 'siri_ai') {
    selectedVoice = getSiriVoice()
  } else if (voices && voices.length > 0) {
    const langVoices = voices.filter(v => v.lang && (v.lang.startsWith(langObj.code) || v.lang === langObj.speechLocale))
    if (langVoices.length > 0) {
      selectedVoice = langVoices.find(v => {
        const name = (v.name || '').toLowerCase()
        if (profile.preferFemale) {
          return name.includes('female') || name.includes('woman') || name.includes('zira') || name.includes('hazel') || name.includes('samantha') || name.includes('victoria') || name.includes('aria')
        }
        return name.includes('male') || name.includes('man') || name.includes('david') || name.includes('james') || name.includes('mark')
      }) || langVoices[0]
    } else {
      selectedVoice = voices.find(v => v.lang && v.lang.startsWith('en')) || null
    }
  }

  let index = 0

  function speakNextSentence() {
    if (currentQueueId !== activeSpeechQueueId) return // canceled
    if (index >= sentences.length) {
      if (onEnd) onEnd()
      return
    }

    const sentenceText = sentences[index]
    index++

    const utterance = new SpeechSynthesisUtterance(sentenceText)
    utterance.lang = langObj.speechLocale
    utterance.rate = profile.rate || 0.95
    utterance.pitch = profile.pitch || 1.0
    utterance.volume = profile.volume !== undefined ? profile.volume : 1.0
    if (selectedVoice) utterance.voice = selectedVoice

    let advanceTimer = null

    const advance = () => {
      if (advanceTimer) clearTimeout(advanceTimer)
      if (currentQueueId === activeSpeechQueueId) {
        speakNextSentence()
      }
    }

    utterance.onend = advance
    utterance.onerror = (e) => {
      console.warn('Utterance error, advancing queue:', e)
      advance()
    }

    // Safety timeout in case browser gets stuck on a sentence
    const maxDuration = Math.max(4000, sentenceText.length * 150)
    advanceTimer = setTimeout(() => {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.resume()
      }
      advance()
    }, maxDuration)

    try {
      window.speechSynthesis.speak(utterance)
      window.speechSynthesis.resume()
    } catch {
      advance()
    }
  }

  // Small timeout after cancel before beginning sequential queue
  setTimeout(() => {
    if (currentQueueId === activeSpeechQueueId) {
      speakNextSentence()
    }
  }, 60)

  return currentQueueId
}

/**
 * Stop any ongoing text-to-speech playback and cancel queue.
 */
export function stopSpeaking() {
  activeSpeechQueueId++
  if (isSpeechSynthesisSupported()) {
    try {
      window.speechSynthesis.cancel()
    } catch {}
  }
}

/**
 * Real-time Streaming Speech Queue for live voice conversations.
 * Plays incoming sentences sequentially without waiting for full response.
 * Supports instantaneous barge-in cancellation.
 */
export class StreamingSpeechQueue {
  constructor({
    language = 'en',
    voiceProfile = null,
    onStartSpeaking = null,
    onSentenceSpoken = null,
    onFinished = null,
  } = {}) {
    this.language = language
    this.voiceProfile = voiceProfile
    this.onStartSpeaking = onStartSpeaking
    this.onSentenceSpoken = onSentenceSpoken
    this.onFinished = onFinished

    this.queue = []
    this.isPlaying = false
    this.isClosed = false
    this.isStreamEnded = false
    this.queueId = ++activeSpeechQueueId
  }

  enqueue(sentence, isFinal = false) {
    if (this.isClosed || !sentence) return
    const clean = cleanTextForSpeech(sentence)
    if (!clean) return

    this.queue.push({ sentence: clean, isFinal })
    if (!this.isPlaying) {
      this._playNext()
    }
  }

  markStreamEnd() {
    this.isStreamEnded = true
    if (!this.isPlaying && this.queue.length === 0) {
      if (this.onFinished) this.onFinished()
    }
  }

  cancel() {
    this.isClosed = true
    this.queue = []
    this.isPlaying = false
    this.queueId = ++activeSpeechQueueId
    if (isSpeechSynthesisSupported()) {
      try {
        window.speechSynthesis.cancel()
      } catch {}
    }
  }

  _playNext() {
    if (this.isClosed || this.queueId !== activeSpeechQueueId) return

    if (this.queue.length === 0) {
      this.isPlaying = false
      if (this.isStreamEnded && this.onFinished) {
        this.onFinished()
      }
      return
    }

    if (!isSpeechSynthesisSupported()) {
      this.queue = []
      this.isPlaying = false
      if (this.onFinished) this.onFinished()
      return
    }

    this.isPlaying = true
    const item = this.queue.shift()

    if (this.onStartSpeaking) {
      this.onStartSpeaking(item.sentence)
    }

    const currentId = this.queueId
    const langObj = SUPPORTED_LANGUAGES.find(l => l.code === this.language) || SUPPORTED_LANGUAGES[0]
    const profile = this.voiceProfile || SIRI_VOICE_PROFILE

    const voices = window.speechSynthesis.getVoices()
    let selectedVoice = null

    if (profile.id === 'siri_ai') {
      selectedVoice = getSiriVoice()
    } else if (voices && voices.length > 0) {
      const langVoices = voices.filter(v => v.lang && (v.lang.startsWith(langObj.code) || v.lang === langObj.speechLocale))
      if (langVoices.length > 0) {
        selectedVoice = langVoices[0]
      }
    }

    const utterance = new SpeechSynthesisUtterance(item.sentence)
    utterance.lang = langObj.speechLocale
    utterance.rate = profile.rate || 0.97
    utterance.pitch = profile.pitch || 1.05
    utterance.volume = profile.volume !== undefined ? profile.volume : 1.0
    if (selectedVoice) utterance.voice = selectedVoice

    let advanceTimer = null
    const advance = () => {
      if (advanceTimer) clearTimeout(advanceTimer)
      if (currentId !== this.queueId || this.isClosed) return

      if (this.onSentenceSpoken) {
        this.onSentenceSpoken(item.sentence, item.isFinal)
      }
      this._playNext()
    }

    utterance.onend = advance
    utterance.onerror = () => advance()

    // Safety timeout
    const maxDur = Math.max(3500, item.sentence.length * 120)
    advanceTimer = setTimeout(() => {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.resume()
      }
      advance()
    }, maxDur)

    try {
      window.speechSynthesis.speak(utterance)
      window.speechSynthesis.resume()
    } catch {
      advance()
    }
  }
}



