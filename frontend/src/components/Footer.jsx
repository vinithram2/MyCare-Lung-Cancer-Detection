import React from 'react'
import { Link } from 'react-router-dom'
import { Wind, AlertTriangle, Github, Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-100 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Wind className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-teal-600">MyCare</span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              AI-powered lung health & cancer detection platform built for accessible clinical insights.
            </p>
          </div>

          {/* Quick links */}
          <div className="flex flex-col gap-2">
            <h4 className="text-sm font-semibold text-slate-700 mb-1">Quick Links</h4>
            {[
              { to: '/',        label: 'Home'     },
              { to: '/analyze', label: 'Analyze'  },
              { to: '/history', label: 'History'  },
              { to: '/about',   label: 'About'    },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="text-sm text-slate-500 hover:text-teal-600 transition-colors w-fit"
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Disclaimer */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <h4 className="text-sm font-semibold">Medical Disclaimer</h4>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              This tool is for educational purposes only and is NOT a substitute for professional medical
              advice, diagnosis, or treatment. Always consult a licensed oncologist or radiologist.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-400">
            &copy; {new Date().getFullYear()} MyCare Platform. All rights reserved.
          </p>
          <p className="text-xs text-slate-400 flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-red-400 fill-red-400" /> for research & education
          </p>
        </div>
      </div>
    </footer>
  )
}
