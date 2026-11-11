/**
 * ActivityContext — tracks user activity across all pages.
 * The Siri AI assistant reads this context to give relevant, aware answers.
 */
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { useLocation } from 'react-router-dom'

const ActivityContext = createContext(null)

export const PAGE_NAMES = {
  '/':         'Home Page',
  '/analyze':  'CT Scan Upload Page',
  '/news':     'PulmoNews & Oncology Research Page',
  '/results':  'Scan Results & Heatmap Page',
  '/guidance': 'Treatment Guidance Page',
  '/history':  'Scan History Page',
  '/about':    'About MyCare Page',
  '/chat':     'AI Chat Assistant Page',
}

export function ActivityProvider({ children }) {
  const location = useLocation()
  const [currentPage, setCurrentPage] = useState('/')
  const [visitedPages, setVisitedPages] = useState([])
  const [lastAction, setLastAction] = useState(null)
  const [scanResult, setScanResult] = useState(null)
  const sessionStartRef = useRef(Date.now())

  // Track page changes automatically
  useEffect(() => {
    const path = location.pathname
    setCurrentPage(path)
    setVisitedPages(prev => {
      const entry = {
        path,
        name: PAGE_NAMES[path] || path,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      // Avoid duplicate consecutive entries
      if (prev.length > 0 && prev[prev.length - 1].path === path) return prev
      return [...prev.slice(-9), entry]
    })
  }, [location.pathname])

  /**
   * Log an action from any page.
   * @param {string} type  e.g. 'scan_uploaded', 'result_viewed', 'history_deleted'
   * @param {any}    detail extra info (string, object, etc.)
   */
  const logAction = useCallback((type, detail = null) => {
    const action = { type, detail, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    setLastAction(action)
    if (type === 'scan_result' && detail) {
      setScanResult(detail)
    }
  }, [])

  /**
   * Returns a short natural-language context string to send to the AI.
   */
  const getContextSummary = useCallback(() => {
    const pageName = PAGE_NAMES[currentPage] || currentPage
    const sessionMins = Math.round((Date.now() - sessionStartRef.current) / 60000)
    const parts = [`User is currently on the ${pageName}.`]
    if (sessionMins > 0) parts.push(`Session time: ${sessionMins} minute(s).`)
    if (visitedPages.length > 1) {
      const prev = visitedPages.slice(0, -1).map(p => p.name).join(', ')
      parts.push(`Previously visited: ${prev}.`)
    }
    if (lastAction) {
      const detail = lastAction.detail
        ? typeof lastAction.detail === 'object'
          ? JSON.stringify(lastAction.detail)
          : String(lastAction.detail)
        : ''
      parts.push(`Last action: ${lastAction.type}${detail ? ` — ${detail}` : ''}.`)
    }
    if (scanResult) {
      const r = typeof scanResult === 'object'
        ? `class=${scanResult.class_name}, confidence=${scanResult.confidence}`
        : String(scanResult)
      parts.push(`Last CT scan result: ${r}.`)
    }
    return parts.join(' ')
  }, [currentPage, visitedPages, lastAction, scanResult])

  const value = {
    currentPage,
    pageName: PAGE_NAMES[currentPage] || currentPage,
    visitedPages,
    lastAction,
    scanResult,
    logAction,
    getContextSummary,
  }

  return (
    <ActivityContext.Provider value={value}>
      {children}
    </ActivityContext.Provider>
  )
}

export function useActivity() {
  const ctx = useContext(ActivityContext)
  if (!ctx) throw new Error('useActivity must be used inside <ActivityProvider>')
  return ctx
}
