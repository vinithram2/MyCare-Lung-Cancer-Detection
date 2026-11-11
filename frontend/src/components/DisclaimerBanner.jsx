import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'

export default function DisclaimerBanner({ persistent = false }) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed && !persistent) return null

  return (
    <AnimatePresence>
      {(!dismissed || persistent) && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3 }}
          className="w-full bg-amber-50 border-b border-amber-200"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800 flex-1 leading-relaxed">
                <span className="font-semibold">Medical Disclaimer: </span>
                This AI tool provides educational information only. It is{' '}
                <span className="font-bold underline">NOT</span> a diagnostic tool and should{' '}
                <span className="font-bold underline">NOT</span> replace consultation with a licensed
                oncologist or radiologist. For any health concerns, please seek professional medical advice.
              </p>
              {!persistent && (
                <button
                  onClick={() => setDismissed(true)}
                  className="flex-shrink-0 p-1 rounded-md text-amber-600 hover:bg-amber-100 transition-colors"
                  aria-label="Dismiss disclaimer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
