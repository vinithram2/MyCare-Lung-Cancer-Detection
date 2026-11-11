import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  MessageSquare,
  X,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Bot,
  User,
  Sparkles,
  RotateCcw,
  Languages,
  Radio,
  Check,
  ExternalLink,
  ArrowRight,
  Phone,
  PhoneCall,
  PhoneOff
} from 'lucide-react'
import VoiceCallBanner from '../components/VoiceCallBanner.jsx'
import { sendChatMessage } from '../utils/api.js'
import { useVoiceCall } from '../hooks/useVoiceCall.js'
import {
  SUPPORTED_LANGUAGES,
  VOICE_PROFILES,
  startVoiceRecognition,
  speakText,
  stopSpeaking,
  isSpeechRecognitionSupported,
  isSpeechSynthesisSupported
} from '../utils/speech.js'

export default function ChatWidget({ defaultOpen = false, initialContext = null }) {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const [language, setLanguage] = useState('en')
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [voiceSupported, setVoiceSupported] = useState(true)
  const [speakingIndex, setSpeakingIndex] = useState(null)
  const [autoSpeak, setAutoSpeak] = useState(true)
  const [voiceProfile, setVoiceProfile] = useState(VOICE_PROFILES[0])
  const [showVoicePicker, setShowVoicePicker] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [activeRecognition, setActiveRecognition] = useState(null)
  const [errorBanner, setErrorBanner] = useState('')

  // Two-way interactive voice call engine
  const {
    callStatus,
    isCallActive,
    callDuration,
    liveTranscript,
    aiLiveTranscript,
    audioLevel,
    permissionError,
    startCall,
    endCall,
    toggleMute,
    isMuted,
  } = useVoiceCall({
    language,
    voiceProfile,
    onMessageReceived: (newMsg) => {
      setMessages(prev => [...prev, newMsg])
    },
  })

  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const currentLangObj = SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0]

  // Initialize speech support and initial greeting
  useEffect(() => {
    setVoiceSupported(isSpeechRecognitionSupported())

    // Load initial greeting in current language
    const initialGreeting = {
      sender: 'assistant',
      text: currentLangObj.greeting,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      lang: language,
      actionButtons: [
        { label: '🚀 Go to Scan Upload', url: '/analyze' },
        { label: '❓ How to use this website?', url: '/chat' }
      ]
    }
    setMessages([initialGreeting])
    fetchSuggestions(language)
  }, [])

  // When language changes, update greeting and suggestions
  const handleLanguageChange = (newLang) => {
    if (newLang === language) return
    stopSpeaking()
    if (isListening && activeRecognition) {
      activeRecognition.abort()
      setIsListening(false)
    }

    setLanguage(newLang)
    const newLangObj = SUPPORTED_LANGUAGES.find(l => l.code === newLang) || SUPPORTED_LANGUAGES[0]

    const welcomeMsg = {
      sender: 'assistant',
      text: newLangObj.greeting,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      lang: newLang
    }
    setMessages(prev => [...prev, welcomeMsg])
    fetchSuggestions(newLang)

    if (autoSpeak) {
      speakText(newLangObj.greeting, newLang, () => setSpeakingIndex(null))
    }
  }

  const fetchSuggestions = async (langCode) => {
    try {
      const res = await sendChatMessage('', langCode)
      if (res.suggestions) {
        setSuggestions(res.suggestions)
      }
    } catch {
      const defaultSuggestions = {
        en: ["What are lung cancer symptoms?", "What is a benign nodule?", "How does MyCare AI work?", "Tips for healthy lungs"],
        hi: ["फेफड़ों के कैंसर के शुरुआती लक्षण क्या हैं?", "सौम्य (Benign) गांठ क्या होती है?", "MyCare AI कैसे काम करता है?", "स्वस्थ फेफड़ों के लिए सुझाव"],
        kn: ["ಶ್ವಾಸಕೋಶದ ಕ್ಯಾನ್ಸರ್‌ನ ಆರಂಭಿಕ ಲಕ್ಷಣಗಳು ಯಾವುವು?", "ಬೆನೈನ್ (Benign) ಗಡ್ಡೆ ಎಂದರೇನು?", "MyCare AI ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ?", "ಆರೋಗ್ಯಕರ ಶ್ವಾಸಕೋಶಕ್ಕೆ ಸಲಹೆಗಳು"]
      }
      setSuggestions(defaultSuggestions[langCode] || defaultSuggestions.en)
    }
  }

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading, isListening])

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      stopSpeaking()
      if (activeRecognition) {
        try { activeRecognition.abort() } catch {}
      }
    }
  }, [activeRecognition])

  // Send a message
  const handleSendMessage = async (textToSend = null) => {
    const text = (textToSend || inputValue).trim()
    if (!text || isLoading) return

    stopSpeaking()
    setSpeakingIndex(null)
    setErrorBanner('')

    const userMessage = {
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      lang: language
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      const response = await sendChatMessage(text, language, initialContext)
      const assistantMessage = {
        sender: 'assistant',
        text: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        lang: response.language || language,
        actionButtons: response.action_buttons || []
      }

      setMessages(prev => [...prev, assistantMessage])
      if (response.suggestions) {
        setSuggestions(response.suggestions)
      }

      // Auto read response if enabled
      if (autoSpeak) {
        const msgIdx = messages.length + 1
        setSpeakingIndex(msgIdx)
        speakText(response.reply, response.language || language, () => {
          setSpeakingIndex(null)
        }, voiceProfile)
      }
    } catch (err) {
      const fallbackReplies = {
        en: "I apologize, but I am currently having trouble reaching the server. You can ask about lung cancer symptoms, benign nodules, or treatments.",
        hi: "क्षमा करें, सर्वर से जुड़ने में समस्या आ रही है। आप फेफड़ों के कैंसर के लक्षणों या उपचार के बारे में पूछ सकते हैं।",
        kn: "ಕ್ಷಮಿಸಿ, ಸರ್ವರ್ ಸಂಪರ್ಕದಲ್ಲಿ ತೊಂದರೆಯಾಗಿದೆ. ನೀವು ಶ್ವಾಸಕೋಶದ ಕ್ಯಾನ್ಸರ್ ಲಕ್ಷಣಗಳು ಅಥವಾ ಚಿಕಿತ್ಸೆಗಳ ಬಗ್ಗೆ ಕೇಳಬಹುದು."
      }
      const errorMsg = {
        sender: 'assistant',
        text: fallbackReplies[language] || fallbackReplies.en,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        lang: language
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setIsLoading(false)
    }
  }

  // Toggle Voice Input (Speech-to-Text)
  const toggleVoiceInput = () => {
    if (isListening) {
      if (activeRecognition) {
        activeRecognition.stop()
      }
      setIsListening(false)
      return
    }

    stopSpeaking()
    setErrorBanner('')

    const rec = startVoiceRecognition({
      language,
      onStart: () => {
        setIsListening(true)
      },
      onResult: (transcript, isFinal) => {
        setInputValue(transcript)
        if (isFinal) {
          setIsListening(false)
          // Automatically send after voice recognized
          setTimeout(() => {
            handleSendMessage(transcript)
          }, 300)
        }
      },
      onEnd: () => {
        setIsListening(false)
      },
      onError: (errMsg) => {
        setIsListening(false)
        setErrorBanner(errMsg)
        setTimeout(() => setErrorBanner(''), 4000)
      }
    })

    if (rec) {
      setActiveRecognition(rec)
    }
  }

  // Speak a specific message aloud
  const toggleSpeakMessage = (index, text, msgLang) => {
    if (speakingIndex === index) {
      stopSpeaking()
      setSpeakingIndex(null)
    } else {
      setSpeakingIndex(index)
      speakText(text, msgLang || language, () => {
        setSpeakingIndex(null)
      }, voiceProfile)
    }
  }

  const handleClearChat = () => {
    stopSpeaking()
    setSpeakingIndex(null)
    const resetMsg = {
      sender: 'assistant',
      text: currentLangObj.greeting,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      lang: language
    }
    setMessages([resetMsg])
  }

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3"
        >
          {/* Prompt badge */}
          <div className="hidden sm:flex items-center gap-2 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-lg border border-teal-100 text-xs font-semibold text-teal-800">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>Voice Assistant (EN / हि / ಕ)</span>
          </div>

          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-teal-600 via-teal-500 to-blue-600 text-white rounded-full shadow-2xl hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-teal-300"
            aria-label="Open MyCare Voice AI Chatbot"
          >
            <Bot className="w-7 h-7 group-hover:rotate-12 transition-transform duration-300" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-teal-400 rounded-full border-2 border-white flex items-center justify-center">
              <Sparkles className="w-2.5 h-2.5 text-white" />
            </span>
          </button>
        </motion.div>
      )}

      {/* Expandable Chat Modal Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[95vw] sm:w-[440px] h-[600px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-700 via-teal-600 to-blue-700 text-white p-4 flex flex-col gap-3 shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center flex-shrink-0 shadow-inner">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm leading-none">MyCare AI Voice Assistant</h3>
                      <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    </div>
                    <p className="text-[11px] text-teal-100 mt-1">Multilingual Oncology & CT Support</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Interactive Voice Call Button */}
                  <button
                    onClick={isCallActive ? endCall : startCall}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer ${
                      isCallActive
                        ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                        : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                    }`}
                    title={isCallActive ? 'End active voice call' : 'Start interactive voice call'}
                  >
                    {isCallActive ? <PhoneOff className="w-3.5 h-3.5" /> : <PhoneCall className="w-3.5 h-3.5" />}
                    <span className="text-[11px]">{isCallActive ? 'End' : 'Call'}</span>
                  </button>

                  {/* Voice Profile Picker */}
                  <div className="relative">
                    <button
                      onClick={() => setShowVoicePicker(v => !v)}
                      className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        showVoicePicker ? 'bg-white/30' : 'bg-white/15 hover:bg-white/25'
                      } text-white`}
                      title="Change voice style"
                    >
                      <span>{voiceProfile.emoji}</span>
                      <span className="opacity-60 text-[9px]">▾</span>
                    </button>
                    {showVoicePicker && (
                      <div className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 z-[999] overflow-hidden">
                        <div className="px-3 py-2 bg-slate-50 border-b border-slate-100">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">🎙️ Voice Style</p>
                        </div>
                        {VOICE_PROFILES.map(profile => (
                          <button
                            key={profile.id}
                            onClick={() => {
                              setVoiceProfile(profile)
                              setShowVoicePicker(false)
                              stopSpeaking()
                              setTimeout(() => speakText(`${profile.label}`, language, null, profile), 100)
                            }}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-teal-50 ${
                              voiceProfile.id === profile.id ? 'bg-teal-50 border-l-2 border-teal-500' : ''
                            }`}
                          >
                            <span className="text-lg">{profile.emoji}</span>
                            <div className="flex-1 min-w-0">
                              <div className={`text-xs font-bold ${voiceProfile.id === profile.id ? 'text-teal-700' : 'text-slate-700'}`}>{profile.label}</div>
                              <div className="text-[10px] text-slate-400 truncate">{profile.description}</div>
                            </div>
                            {voiceProfile.id === profile.id && <span className="text-teal-600 text-xs">✓</span>}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* TTS Mute / Unmute */}
                  <button
                    onClick={() => {
                      if (autoSpeak) stopSpeaking()
                      setAutoSpeak(!autoSpeak)
                    }}
                    className={`p-1.5 rounded-lg transition-colors ${
                      autoSpeak ? 'bg-white/20 text-white' : 'bg-white/10 text-teal-200'
                    }`}
                    title={autoSpeak ? 'Voice response enabled (click to mute)' : 'Voice response muted (click to enable)'}
                  >
                    {autoSpeak ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </button>

                  {/* Clear chat */}
                  <button
                    onClick={handleClearChat}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                    title="Reset Conversation"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  {/* Close */}
                  <button
                    onClick={() => {
                      stopSpeaking()
                      setIsOpen(false)
                    }}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                    aria-label="Close Chat"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Language Switcher Bar */}
              <div className="flex items-center justify-between bg-black/20 backdrop-blur-md rounded-xl p-1 text-xs">
                <span className="text-[10px] uppercase font-bold tracking-wider text-teal-100 px-2 flex items-center gap-1">
                  <Languages className="w-3.5 h-3.5" /> Language:
                </span>
                <div className="flex items-center gap-1">
                  {SUPPORTED_LANGUAGES.map(l => (
                    <button
                      key={l.code}
                      onClick={() => handleLanguageChange(l.code)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                        language === l.code
                          ? 'bg-white text-teal-800 shadow-sm'
                          : 'text-white/80 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {l.flag} {l.nativeLabel}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Voice Call Banner */}
            <div className="px-4 pt-3">
              <VoiceCallBanner
                callStatus={callStatus}
                callDuration={callDuration}
                liveTranscript={liveTranscript}
                aiLiveTranscript={aiLiveTranscript}
                audioLevel={audioLevel}
                permissionError={permissionError}
                onEndCall={endCall}
                onToggleMute={toggleMute}
                isMuted={isMuted}
              />
            </div>

            {/* Error Banner */}
            {errorBanner && (
              <div className="bg-amber-500 text-white px-4 py-1.5 text-xs text-center font-medium animate-fadeIn">
                {errorBanner}
              </div>
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/60">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'assistant' && (
                    <div className="w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[82%] rounded-2xl p-3.5 shadow-xs text-xs sm:text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-teal-600 text-white rounded-tr-none'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                    }`}
                  >
                    <div className="whitespace-pre-line break-words font-normal">
                      {msg.text}
                    </div>

                    {/* Interactive Action Navigation Buttons */}
                    {msg.actionButtons && msg.actionButtons.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                        {msg.actionButtons.map((btn, bIdx) => (
                          <button
                            key={bIdx}
                            onClick={() => {
                              if (btn.url.startsWith('http')) {
                                window.open(btn.url, '_blank')
                              } else if (btn.url === '/chat') {
                                handleSendMessage(btn.label.replace(/^[^\w\s]+/, '').trim())
                              } else {
                                navigate(btn.url)
                              }
                            }}
                            className="flex items-center gap-1 px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 font-semibold text-[11px] rounded-lg border border-teal-200 shadow-2xs hover:shadow-xs transition-all hover:scale-[1.02] cursor-pointer"
                          >
                            <span>{btn.label}</span>
                            <ArrowRight className="w-3 h-3 text-teal-600" />
                          </button>
                        ))}
                      </div>
                    )}

                    <div
                      className={`mt-2 flex items-center justify-between text-[10px] ${
                        msg.sender === 'user' ? 'text-teal-200' : 'text-slate-400'
                      }`}
                    >
                      <span>{msg.timestamp}</span>

                      {/* Read aloud button for assistant */}
                      {msg.sender === 'assistant' && (
                        <button
                          onClick={() => toggleSpeakMessage(idx, msg.text, msg.lang)}
                          className={`ml-2 px-1.5 py-0.5 rounded flex items-center gap-1 font-medium transition-colors ${
                            speakingIndex === idx
                              ? 'bg-teal-100 text-teal-700 animate-pulse'
                              : 'hover:bg-slate-100 text-slate-500'
                          }`}
                          title="Read this message aloud"
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>{speakingIndex === idx ? 'Playing' : 'Listen'}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {msg.sender === 'user' && (
                    <div className="w-7 h-7 rounded-full bg-slate-700 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}

              {/* Loading Indicator */}
              {isLoading && (
                <div className="flex gap-2.5 justify-start">
                  <div className="w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none shadow-xs flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-teal-500 animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-2 h-2 rounded-full bg-teal-500 animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-2 h-2 rounded-full bg-teal-500 animate-bounce" />
                    <span className="text-xs text-slate-400 ml-1">Analyzing medical query…</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Listening Live Overlay */}
            {isListening && (
              <div className="bg-red-50 border-t border-red-200 px-4 py-2.5 flex items-center justify-between animate-pulse">
                <div className="flex items-center gap-2 text-xs font-semibold text-red-700">
                  <Radio className="w-4 h-4 text-red-600 animate-spin" />
                  <span>{currentLangObj.listeningText}</span>
                </div>
                <button
                  onClick={toggleVoiceInput}
                  className="px-2.5 py-1 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 shadow-xs"
                >
                  Stop Mic
                </button>
              </div>
            )}

            {/* Suggested Question Chips */}
            {suggestions.length > 0 && !isListening && (
              <div className="px-3 py-2 bg-slate-100/80 border-t border-slate-200/80 overflow-x-auto whitespace-nowrap flex gap-1.5 scrollbar-thin">
                {suggestions.slice(0, 4).map((sugg, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(sugg)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white hover:bg-teal-50 hover:text-teal-700 border border-slate-200 text-[11px] font-medium text-slate-600 transition-all flex-shrink-0 shadow-2xs"
                  >
                    <Sparkles className="w-2.5 h-2.5 text-teal-600" />
                    <span>{sugg}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Input & Voice Controls */}
            <div className="p-3 bg-white border-t border-slate-200">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSendMessage()
                }}
                className="flex items-center gap-2"
              >
                {/* Voice Recognition Mic Button */}
                <button
                  type="button"
                  onClick={toggleVoiceInput}
                  className={`p-2.5 rounded-xl transition-all duration-200 flex-shrink-0 ${
                    isListening
                      ? 'bg-red-600 text-white ring-4 ring-red-200 animate-pulse'
                      : 'bg-slate-100 hover:bg-teal-100 text-slate-600 hover:text-teal-700'
                  }`}
                  title={isListening ? 'Stop listening' : `Speak in ${currentLangObj.nativeLabel}`}
                >
                  {isListening ? <Mic className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5" />}
                </button>

                {/* Text input */}
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={currentLangObj.placeholder}
                  disabled={isLoading}
                  className="flex-1 bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white text-slate-800 text-xs sm:text-sm rounded-xl px-3.5 py-2.5 outline-none transition-all"
                />

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className={`p-2.5 rounded-xl transition-all duration-200 flex-shrink-0 ${
                    inputValue.trim() && !isLoading
                      ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-md hover:scale-105'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                  title="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
