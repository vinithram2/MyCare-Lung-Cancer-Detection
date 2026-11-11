import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Bot,
  User,
  Send,
  Mic,
  Volume2,
  VolumeX,
  Sparkles,
  RotateCcw,
  Languages,
  Radio,
  ShieldAlert,
  HelpCircle,
  Activity,
  HeartPulse,
  Scan,
  Stethoscope,
  ArrowRight,
  Phone,
  PhoneCall,
  PhoneOff
} from 'lucide-react'
import DisclaimerBanner from '../components/DisclaimerBanner.jsx'
import VoiceCallBanner from '../components/VoiceCallBanner.jsx'
import { sendChatMessage } from '../utils/api.js'
import { useVoiceCall } from '../hooks/useVoiceCall.js'
import {
  SUPPORTED_LANGUAGES,
  VOICE_PROFILES,
  startVoiceRecognition,
  speakText,
  stopSpeaking,
  isSpeechRecognitionSupported
} from '../utils/speech.js'

export default function ChatbotPage() {
  const navigate = useNavigate()
  const [language, setLanguage] = useState('en')
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
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

  useEffect(() => {
    const welcomeMsg = {
      sender: 'assistant',
      text: currentLangObj.greeting,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      lang: language,
      actionButtons: [
        { label: '🚀 Go to Scan Upload', url: '/analyze' },
        { label: '❓ How to use this website?', url: '/chat' },
        { label: '💡 How to improve lung pain?', url: '/chat' }
      ]
    }
    setMessages([welcomeMsg])
    fetchSuggestions(language)
  }, [])

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
      speakText(newLangObj.greeting, newLang, () => setSpeakingIndex(null), voiceProfile)
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
        en: ["What are lung cancer symptoms?", "What is a benign nodule?", "How does MyCare AI work?", "Explain Fleischner guidelines", "Tips for healthy lungs"],
        hi: ["फेफड़ों के कैंसर के शुरुआती लक्षण क्या हैं?", "सौम्य (Benign) गांठ क्या होती है?", "MyCare AI कैसे काम करता है?", "फेफड़ों के कैंसर का इलाज क्या है?"],
        kn: ["ಶ್ವಾಸಕೋಶದ ಕ್ಯಾನ್ಸರ್‌ನ ಆರಂಭಿಕ ಲಕ್ಷಣಗಳು ಯಾವುವು?", "ಬೆನೈನ್ (Benign) ಗಡ್ಡೆ ಎಂದರೇನು?", "MyCare AI ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ?", "ಆರೋಗ್ಯಕರ ಶ್ವಾಸಕೋಶಕ್ಕೆ ಸಲಹೆಗಳು"]
      }
      setSuggestions(defaultSuggestions[langCode] || defaultSuggestions.en)
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading, isListening])

  useEffect(() => {
    return () => {
      stopSpeaking()
      if (activeRecognition) {
        try { activeRecognition.abort() } catch {}
      }
    }
  }, [activeRecognition])

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
      const response = await sendChatMessage(text, language)
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

      if (autoSpeak) {
        const msgIdx = messages.length + 1
        setSpeakingIndex(msgIdx)
        speakText(response.reply, response.language || language, () => {
          setSpeakingIndex(null)
        }, voiceProfile)
      }
    } catch {
      const fallbackReplies = {
        en: "I am having trouble connecting to the backend server. You can ask about symptoms, benign nodules, or CT screening.",
        hi: "सर्वर से जुड़ने में समस्या आ रही है। आप फेफड़ों के कैंसर के लक्षणों या सीटी स्कैन के बारे में पूछ सकते हैं।",
        kn: "ಸರ್ವರ್ ಸಂಪರ್ಕದಲ್ಲಿ ತೊಂದರೆಯಾಗಿದೆ. ನೀವು ರೋಗಲಕ್ಷಣಗಳು ಅಥವಾ ಸಿಟಿ ಸ್ಕ್ಯಾನ್ ಬಗ್ಗೆ ಕೇಳಬಹುದು."
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

  const toggleVoiceInput = () => {
    if (isListening) {
      if (activeRecognition) activeRecognition.stop()
      setIsListening(false)
      return
    }

    stopSpeaking()
    setErrorBanner('')

    const rec = startVoiceRecognition({
      language,
      onStart: () => setIsListening(true),
      onResult: (transcript, isFinal) => {
        setInputValue(transcript)
        if (isFinal) {
          setIsListening(false)
          setTimeout(() => handleSendMessage(transcript), 300)
        }
      },
      onEnd: () => setIsListening(false),
      onError: (errMsg) => {
        setIsListening(false)
        setErrorBanner(errMsg)
        setTimeout(() => setErrorBanner(''), 4000)
      }
    })

    if (rec) setActiveRecognition(rec)
  }

  const toggleSpeakMessage = (index, text, msgLang) => {
    if (speakingIndex === index) {
      stopSpeaking()
      setSpeakingIndex(null)
    } else {
      setSpeakingIndex(index)
      speakText(text, msgLang || language, () => setSpeakingIndex(null), voiceProfile)
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

  // Quick Topic cards
  const quickTopics = [
    {
      title: language === 'hi' ? 'शुरुआती लक्षण' : language === 'kn' ? 'ಆರಂಭಿಕ ಲಕ್ಷಣಗಳು' : 'Early Symptoms',
      prompt: language === 'hi' ? 'फेफड़ों के कैंसर के शुरुआती लक्षण क्या हैं?' : language === 'kn' ? 'ಶ್ವಾಸಕೋಶದ ಕ್ಯಾನ್ಸರ್‌ನ ಆರಂಭಿಕ ಲಕ್ಷಣಗಳು ಯಾವುವು?' : 'What are common lung cancer symptoms?',
      icon: Activity,
      color: 'bg-red-50 text-red-700 border-red-200'
    },
    {
      title: language === 'hi' ? 'सौम्य (Benign) गांठ' : language === 'kn' ? 'ಬೆನೈನ್ (Benign) ಗಡ್ಡೆ' : 'Benign Nodules',
      prompt: language === 'hi' ? 'सौम्य (Benign) गांठ क्या होती है?' : language === 'kn' ? 'ಬೆನೈನ್ (Benign) ಗಡ್ಡೆ ಎಂದರೇನು?' : 'What is a benign lung nodule?',
      icon: Stethoscope,
      color: 'bg-amber-50 text-amber-700 border-amber-200'
    },
    {
      title: language === 'hi' ? 'उपचार विकल्प' : language === 'kn' ? 'ಚಿಕಿತ್ಸಾ ವಿಧಾನಗಳು' : 'Treatment Options',
      prompt: language === 'hi' ? 'फेफड़ों के कैंसर का क्या इलाज है?' : language === 'kn' ? 'ಕ್ಯಾನ್ಸರ್‌ಗೆ ಲಭ್ಯವಿರುವ ಚಿಕಿತ್ಸೆಗಳು ಯಾವುವು?' : 'What are the main lung cancer treatments?',
      icon: HeartPulse,
      color: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    {
      title: language === 'hi' ? 'सीटी स्कैन और एआई' : language === 'kn' ? 'ಸಿಟಿ ಸ್ಕ್ಯಾನ್ & AI' : 'CT Scan & AI',
      prompt: language === 'hi' ? 'MyCare AI कैसे काम करता है?' : language === 'kn' ? 'MyCare AI ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ?' : 'How does MyCare AI detect cancer on CT scans?',
      icon: Scan,
      color: 'bg-teal-50 text-teal-700 border-teal-200'
    }
  ]

  return (
    <div className="flex flex-col min-h-screen bg-[#FAFAFA] pb-16">
      <DisclaimerBanner />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 w-full">
        {/* Header Title */}
        <div className="text-center max-w-2xl mx-auto mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Multilingual Voice & Oncology AI</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            MyCare AI Health Assistant
          </h1>
          <p className="mt-2 text-slate-600 text-xs sm:text-sm">
            Interactive voice & text assistant supporting <strong className="text-teal-700">English</strong>, <strong className="text-teal-700">हिन्दी (Hindi)</strong>, and <strong className="text-teal-700">ಕನ್ನಡ (Kannada)</strong>.
          </p>
        </div>

        {/* Quick Topics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {quickTopics.map((topic, i) => {
            const Icon = topic.icon
            return (
              <button
                key={i}
                onClick={() => handleSendMessage(topic.prompt)}
                className={`p-3.5 rounded-2xl border text-left transition-all hover:scale-[1.02] hover:shadow-sm flex flex-col justify-between ${topic.color}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold">{topic.title}</span>
                  <Icon className="w-4 h-4 opacity-80" />
                </div>
                <span className="text-[11px] opacity-75 line-clamp-1">{topic.prompt}</span>
              </button>
            )
          })}
        </div>

        {/* Chat Main Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden flex flex-col h-[640px]">
          {/* Top Control Bar */}
          <div className="bg-gradient-to-r from-teal-700 via-teal-600 to-blue-700 text-white p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-base">Oncology Decision Assistant</h2>
                  <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
                </div>
                <p className="text-xs text-teal-100">Voice-Operated Assistant (English / हिन्दी / ಕನ್ನಡ)</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Interactive Voice Call Button */}
              <button
                onClick={isCallActive ? endCall : startCall}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer ${
                  isCallActive
                    ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse shadow-rose-600/30'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/30'
                }`}
                title={isCallActive ? 'End active voice call' : 'Start interactive two-way voice call'}
              >
                {isCallActive ? <PhoneOff className="w-4 h-4" /> : <PhoneCall className="w-4 h-4" />}
                <span className="hidden sm:inline">{isCallActive ? 'End Call' : 'Voice Call'}</span>
              </button>

              {/* Language Selector */}
              <div className="flex items-center bg-black/20 backdrop-blur-md rounded-xl p-1 text-xs">
                {SUPPORTED_LANGUAGES.map(l => (
                  <button
                    key={l.code}
                    onClick={() => handleLanguageChange(l.code)}
                    className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                      language === l.code
                        ? 'bg-white text-teal-800 shadow-xs'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {l.flag} {l.nativeLabel}
                  </button>
                ))}
              </div>

              {/* Voice Profile Picker */}
              <div className="relative">
                <button
                  onClick={() => setShowVoicePicker(v => !v)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    showVoicePicker ? 'bg-white/30 text-white' : 'bg-white/15 hover:bg-white/25 text-white'
                  }`}
                  title="Change voice style"
                >
                  <span className="text-base leading-none">{voiceProfile.emoji}</span>
                  <span className="hidden sm:inline">{voiceProfile.label}</span>
                  <span className="ml-0.5 opacity-70 text-[10px]">▾</span>
                </button>

                {showVoicePicker && (
                  <div className="absolute right-0 top-full mt-1.5 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden">
                    <div className="px-3 py-2 bg-slate-50 border-b border-slate-100">
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">🎙️ Choose Voice Style</p>
                    </div>
                    {VOICE_PROFILES.map(profile => (
                      <button
                        key={profile.id}
                        onClick={() => {
                          setVoiceProfile(profile)
                          setShowVoicePicker(false)
                          stopSpeaking()
                          // Preview the selected voice
                          setTimeout(() => speakText(`Voice set to ${profile.label}`, language, null, profile), 100)
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-teal-50 ${
                          voiceProfile.id === profile.id ? 'bg-teal-50 border-l-2 border-teal-500' : ''
                        }`}
                      >
                        <span className="text-xl">{profile.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <div className={`text-xs font-bold ${voiceProfile.id === profile.id ? 'text-teal-700' : 'text-slate-800'}`}>
                            {profile.label}
                          </div>
                          <div className="text-[11px] text-slate-400">{profile.description}</div>
                        </div>
                        {voiceProfile.id === profile.id && (
                          <span className="text-teal-600 text-xs font-bold">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* TTS On/Off Toggle */}
              <button
                onClick={() => {
                  if (autoSpeak) stopSpeaking()
                  setAutoSpeak(!autoSpeak)
                }}
                className={`p-2 rounded-xl transition-colors ${
                  autoSpeak ? 'bg-white/20 text-white' : 'bg-white/10 text-teal-200'
                }`}
                title={autoSpeak ? 'Voice response enabled' : 'Voice response muted'}
              >
                {autoSpeak ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>

              {/* Reset Chat */}
              <button
                onClick={handleClearChat}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Reset conversation"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Voice Call Banner */}
          <div className="px-6 pt-4">
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
            <div className="bg-amber-500 text-white px-4 py-2 text-xs text-center font-medium animate-fadeIn">
              {errorBanner}
            </div>
          )}

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/70">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-9 h-9 rounded-2xl bg-teal-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                    <Bot className="w-5 h-5" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-2xl p-4 shadow-xs text-xs sm:text-sm leading-relaxed ${
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
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap gap-2">
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
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-teal-50 to-blue-50 hover:from-teal-100 hover:to-blue-100 text-teal-800 font-semibold text-xs rounded-xl border border-teal-200/90 shadow-2xs hover:shadow-xs transition-all hover:scale-[1.02] cursor-pointer"
                        >
                          <span>{btn.label}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-teal-600" />
                        </button>
                      ))}
                    </div>
                  )}

                  <div
                    className={`mt-2.5 flex items-center justify-between text-[11px] ${
                      msg.sender === 'user' ? 'text-teal-200' : 'text-slate-400'
                    }`}
                  >
                    <span>{msg.timestamp}</span>

                    {msg.sender === 'assistant' && (
                      <button
                        onClick={() => toggleSpeakMessage(idx, msg.text, msg.lang)}
                        className={`ml-3 px-2 py-0.5 rounded-md flex items-center gap-1.5 font-medium transition-colors ${
                          speakingIndex === idx
                            ? 'bg-teal-100 text-teal-700 animate-pulse'
                            : 'hover:bg-slate-100 text-slate-500'
                        }`}
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>{speakingIndex === idx ? 'Playing Audio' : 'Listen Voice'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-9 h-9 rounded-2xl bg-slate-800 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                    <User className="w-5 h-5" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-9 h-9 rounded-2xl bg-teal-600 text-white flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-none shadow-xs flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-bounce" />
                  <span className="text-xs text-slate-500 ml-2">MyCare AI is analyzing your medical query…</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Listening Live Status */}
          {isListening && (
            <div className="bg-red-50 border-t border-red-200 px-6 py-3 flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-3 text-xs sm:text-sm font-semibold text-red-700">
                <Radio className="w-5 h-5 text-red-600 animate-spin" />
                <span>{currentLangObj.listeningText}</span>
              </div>
              <button
                onClick={toggleVoiceInput}
                className="px-3.5 py-1.5 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 shadow-xs"
              >
                Stop Listening
              </button>
            </div>
          )}

          {/* Suggested Questions */}
          {suggestions.length > 0 && !isListening && (
            <div className="px-4 py-2.5 bg-slate-100/90 border-t border-slate-200 overflow-x-auto whitespace-nowrap flex gap-2 scrollbar-thin">
              {suggestions.map((sugg, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(sugg)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-teal-50 hover:text-teal-700 border border-slate-200 text-xs font-medium text-slate-600 transition-all flex-shrink-0 shadow-2xs"
                >
                  <Sparkles className="w-3 h-3 text-teal-600" />
                  <span>{sugg}</span>
                </button>
              ))}
            </div>
          )}

          {/* Input Box with Voice Mic */}
          <div className="p-4 bg-white border-t border-slate-200">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSendMessage()
              }}
              className="flex items-center gap-3"
            >
              <button
                type="button"
                onClick={toggleVoiceInput}
                className={`p-3 rounded-2xl transition-all duration-200 flex-shrink-0 ${
                  isListening
                    ? 'bg-red-600 text-white ring-4 ring-red-200 animate-pulse'
                    : 'bg-slate-100 hover:bg-teal-100 text-slate-700 hover:text-teal-700'
                }`}
                title={isListening ? 'Stop listening' : `Click to speak in ${currentLangObj.nativeLabel}`}
              >
                <Mic className="w-6 h-6" />
              </button>

              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={currentLangObj.placeholder}
                disabled={isLoading}
                className="flex-1 bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white text-slate-800 text-sm rounded-2xl px-4 py-3 outline-none transition-all shadow-inner"
              />

              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className={`p-3 rounded-2xl transition-all duration-200 flex-shrink-0 ${
                  inputValue.trim() && !isLoading
                    ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-md hover:scale-105'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
                title="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
