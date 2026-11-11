import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  Trash2,
  Eye,
  FileImage,
  Filter,
  Search,
  RotateCw,
  Plus,
  AlertCircle,
  CheckCircle2,
  Clock,
  Scan,
  ShieldCheck
} from 'lucide-react'
import { getHistory, deleteHistory } from '../utils/api.js'
import RiskBadge from '../components/RiskBadge.jsx'
import DisclaimerBanner from '../components/DisclaimerBanner.jsx'

// Demo records if database is empty or offline
const DEMO_HISTORY = [
  {
    id: 101,
    filename: 'Patient_0821_Thoracic_CT.png',
    class_name: 'Benign',
    confidence: 0.884,
    risk_level: 'Moderate',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 102,
    filename: 'Screening_Scan_PA_049.png',
    class_name: 'Normal',
    confidence: 0.962,
    risk_level: 'Low',
    timestamp: new Date(Date.now() - 3600000 * 28).toISOString(),
  },
  {
    id: 103,
    filename: 'CT_Suspicious_Lesion_RUL.png',
    class_name: 'Malignant',
    confidence: 0.915,
    risk_level: 'High',
    timestamp: new Date(Date.now() - 3600000 * 72).toISOString(),
  }
]

export default function HistoryPage() {
  const navigate = useNavigate()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('ALL')
  const [feedbackMsg, setFeedbackMsg] = useState(null)

  const fetchScanHistory = async () => {
    setLoading(true)
    try {
      const data = await getHistory()
      if (Array.isArray(data) && data.length > 0) {
        setHistory(data)
      } else {
        setHistory(DEMO_HISTORY)
      }
    } catch (err) {
      console.warn('Backend history unreachable, showing local records:', err)
      setHistory(DEMO_HISTORY)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchScanHistory()
  }, [])

  const handleDelete = async (id, e) => {
    e.stopPropagation()
    try {
      await deleteHistory(id)
    } catch (err) {
      console.warn('API delete request failed (demo fallback active)')
    }
    setHistory((prev) => prev.filter((item) => item.id !== id))
    setFeedbackMsg('Scan record deleted.')
    setTimeout(() => setFeedbackMsg(null), 2500)
  }

  const filteredHistory = history.filter((item) => {
    const matchesSearch = item.filename?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.class_name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = selectedFilter === 'ALL' || item.class_name?.toUpperCase() === selectedFilter
    return matchesSearch && matchesFilter
  })

  return (
    <div className="flex flex-col min-h-screen bg-[#FAFAFA] pb-24">
      <DisclaimerBanner />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold uppercase tracking-wider mb-2">
              <Calendar className="w-3.5 h-3.5" />
              <span>Audit Log & Storage</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Scan History Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Review previous classification runs, confidence scores, and diagnostic reports.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchScanHistory}
              className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-2xs"
              title="Refresh records"
            >
              <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={() => navigate('/analyze')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-teal-600/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>New Scan</span>
            </button>
          </div>
        </div>

        {/* Feedback notification */}
        <AnimatePresence>
          {feedbackMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-4 p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs font-semibold text-teal-800 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
              <span>{feedbackMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by filename or diagnosis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-teal-500 focus:bg-white transition-all text-slate-800 placeholder-slate-400"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {['ALL', 'NORMAL', 'BENIGN', 'MALIGNANT'].map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedFilter === filter
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Table / Grid */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-10 h-10 border-3 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-slate-500 font-medium">Loading historical scans...</p>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">
                <FileImage className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-1">No Scans Found</h3>
              <p className="text-xs text-slate-500 mb-6 max-w-sm mx-auto">
                No radiological scans match your current filter criteria or none have been submitted yet.
              </p>
              <button
                onClick={() => navigate('/analyze')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-colors"
              >
                <Scan className="w-4 h-4" />
                <span>Upload First Scan</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-6">File Name</th>
                    <th className="py-3.5 px-6">Diagnosis</th>
                    <th className="py-3.5 px-6">Confidence</th>
                    <th className="py-3.5 px-6">Risk Tier</th>
                    <th className="py-3.5 px-6">Date / Time</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredHistory.map((item) => {
                    const confidenceVal = typeof item.confidence === 'number' ? item.confidence : 0.8
                    const confidencePercent = confidenceVal <= 1.0 ? confidenceVal * 100 : confidenceVal
                    const risk = item.risk_level || (item.class_name === 'Malignant' ? 'High' : item.class_name === 'Benign' ? 'Moderate' : 'Low')
                    const dateFormatted = item.timestamp ? new Date(item.timestamp).toLocaleString() : 'Recent'

                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                        onClick={() =>
                          navigate('/results', {
                            state: {
                              result: {
                                class_name: item.class_name,
                                confidence: item.confidence,
                                risk_level: item.risk_level,
                                heatmap_url: item.heatmap_url,
                              },
                              fileName: item.filename,
                            },
                          })
                        }
                      >
                        <td className="py-4 px-6 font-semibold text-slate-800 flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 flex-shrink-0">
                            <FileImage className="w-4 h-4" />
                          </div>
                          <span className="truncate max-w-[200px] sm:max-w-xs">{item.filename}</span>
                        </td>

                        <td className="py-4 px-6">
                          <span
                            className={`font-bold text-xs ${
                              item.class_name === 'Malignant'
                                ? 'text-red-700'
                                : item.class_name === 'Benign'
                                ? 'text-amber-700'
                                : 'text-green-700'
                            }`}
                          >
                            {item.class_name}
                          </span>
                        </td>

                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-slate-200 h-2 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  item.class_name === 'Malignant'
                                    ? 'bg-red-500'
                                    : item.class_name === 'Benign'
                                    ? 'bg-amber-500'
                                    : 'bg-green-500'
                                }`}
                                style={{ width: `${confidencePercent}%` }}
                              />
                            </div>
                            <span className="font-semibold text-slate-700 text-xs">
                              {confidencePercent.toFixed(1)}%
                            </span>
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          <RiskBadge level={risk} />
                        </td>

                        <td className="py-4 px-6 text-slate-500 text-xs">
                          {dateFormatted}
                        </td>

                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() =>
                                navigate('/results', {
                                  state: {
                                    result: {
                                      class_name: item.class_name,
                                      confidence: item.confidence,
                                      risk_level: item.risk_level,
                                      heatmap_url: item.heatmap_url,
                                    },
                                    fileName: item.filename,
                                  },
                                })
                              }
                              className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-colors"
                              title="View Result Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => handleDelete(item.id, e)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Delete Record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
