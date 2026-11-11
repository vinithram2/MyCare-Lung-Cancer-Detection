import os

out_dir = 'frontend/public/guidance'
os.makedirs(out_dir, exist_ok=True)

svgs = {
    'consultation.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 220" width="100%" height="100%">
  <defs>
    <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0d9488" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#0284c7" stop-opacity="0.05"/>
    </linearGradient>
  </defs>
  <rect width="400" height="220" rx="20" fill="url(#g1)"/>
  <rect x="15" y="15" width="370" height="190" rx="16" fill="#ffffff" stroke="#ccfbf1" stroke-width="2"/>
  <circle cx="140" cy="75" r="26" fill="#0d9488" opacity="0.9"/>
  <circle cx="140" cy="70" r="13" fill="#ffffff"/>
  <path d="M110 130 C110 102, 170 102, 170 130 Z" fill="#0d9488" opacity="0.9"/>
  <path d="M132 90 C132 110, 148 110, 148 90" stroke="#f59e0b" stroke-width="3.5" fill="none" stroke-linecap="round"/>
  <circle cx="140" cy="112" r="5" fill="#f59e0b"/>
  <circle cx="240" cy="82" r="20" fill="#64748b" opacity="0.8"/>
  <circle cx="240" cy="78" r="10" fill="#ffffff"/>
  <path d="M215 132 C215 110, 265 110, 265 132 Z" fill="#64748b" opacity="0.8"/>
  <rect x="180" y="98" width="38" height="48" rx="6" fill="#f8fafc" stroke="#0d9488" stroke-width="2"/>
  <line x1="188" y1="110" x2="208" y2="110" stroke="#0d9488" stroke-width="2" stroke-linecap="round"/>
  <line x1="188" y1="120" x2="208" y2="120" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"/>
  <line x1="188" y1="130" x2="202" y2="130" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"/>
  <text x="200" y="172" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="bold" fill="#0f766e" text-anchor="middle">Specialist Oncology Review</text>
  <text x="200" y="189" font-family="system-ui, -apple-system, sans-serif" font-size="10" fill="#64748b" text-anchor="middle">Staging &amp; Clinical Staging Consultation</text>
</svg>''',

    'ct_surveillance.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 220" width="100%" height="100%">
  <defs>
    <linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0284c7" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#6366f1" stop-opacity="0.05"/>
    </linearGradient>
  </defs>
  <rect width="400" height="220" rx="20" fill="url(#g2)"/>
  <rect x="15" y="15" width="370" height="190" rx="16" fill="#ffffff" stroke="#e0f2fe" stroke-width="2"/>
  <circle cx="200" cy="85" r="46" fill="#f0f9ff" stroke="#0284c7" stroke-width="4" stroke-dasharray="7 3"/>
  <circle cx="200" cy="85" r="34" fill="#0f172a"/>
  <line x1="166" y1="85" x2="234" y2="85" stroke="#38bdf8" stroke-width="3" stroke-linecap="round"/>
  <ellipse cx="190" cy="85" rx="7" ry="12" fill="#334155" opacity="0.8"/>
  <ellipse cx="210" cy="85" rx="7" ry="12" fill="#334155" opacity="0.8"/>
  <circle cx="192" cy="82" r="3" fill="#f59e0b"/>
  <rect x="172" y="122" width="56" height="12" rx="3" fill="#0284c7"/>
  <text x="200" y="172" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="bold" fill="#0369a1" text-anchor="middle">Low-Dose CT Surveillance</text>
  <text x="200" y="189" font-family="system-ui, -apple-system, sans-serif" font-size="10" fill="#64748b" text-anchor="middle">3–6 Month Serial Volume Doubling Check</text>
</svg>''',

    'biopsy_diagnostics.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 220" width="100%" height="100%">
  <defs>
    <linearGradient id="g3" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#d97706" stop-opacity="0.05"/>
    </linearGradient>
  </defs>
  <rect width="400" height="220" rx="20" fill="url(#g3)"/>
  <rect x="15" y="15" width="370" height="190" rx="16" fill="#ffffff" stroke="#fef3c7" stroke-width="2"/>
  <circle cx="150" cy="75" r="22" fill="#fef3c7" stroke="#d97706" stroke-width="3"/>
  <path d="M142 97 L142 128 L158 128 L158 97 Z" fill="#d97706"/>
  <rect x="132" y="128" width="36" height="7" rx="2" fill="#78350f"/>
  <circle cx="250" cy="78" r="30" fill="#fffbeb" stroke="#f59e0b" stroke-width="2" stroke-dasharray="4 3"/>
  <circle cx="245" cy="74" r="5" fill="#dc2626" opacity="0.8"/>
  <circle cx="258" cy="82" r="7" fill="#d97706" opacity="0.7"/>
  <circle cx="242" cy="87" r="4" fill="#0d9488" opacity="0.7"/>
  <line x1="215" y1="78" x2="285" y2="78" stroke="#ef4444" stroke-width="1.5"/>
  <line x1="250" y1="43" x2="250" y2="113" stroke="#ef4444" stroke-width="1.5"/>
  <text x="200" y="172" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="bold" fill="#b45309" text-anchor="middle">Histopathology &amp; Biopsy Analysis</text>
  <text x="200" y="189" font-family="system-ui, -apple-system, sans-serif" font-size="10" fill="#64748b" text-anchor="middle">EBUS-TBNA &amp; Tissue Biomarker Profiling</text>
</svg>''',

    'thoracic_surgery.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 220" width="100%" height="100%">
  <defs>
    <linearGradient id="g4" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#059669" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#10b981" stop-opacity="0.05"/>
    </linearGradient>
  </defs>
  <rect width="400" height="220" rx="20" fill="url(#g4)"/>
  <rect x="15" y="15" width="370" height="190" rx="16" fill="#ffffff" stroke="#d1fae5" stroke-width="2"/>
  <circle cx="200" cy="78" r="34" fill="#ecfdf5" stroke="#059669" stroke-width="3"/>
  <path d="M178 95 L222 58 L214 49 L170 86 Z" fill="#059669"/>
  <circle cx="173" cy="91" r="3.5" fill="#10b981"/>
  <path d="M200 42 C214 42, 226 46, 226 68 C226 95, 200 108, 200 108 C200 108, 174 95, 174 68 C174 46, 186 42, 200 42 Z" fill="none" stroke="#059669" stroke-width="2"/>
  <text x="200" y="172" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="bold" fill="#047857" text-anchor="middle">Minimally Invasive Thoracic Surgery</text>
  <text x="200" y="189" font-family="system-ui, -apple-system, sans-serif" font-size="10" fill="#64748b" text-anchor="middle">VATS / Robotic Lobectomy &amp; Resection</text>
</svg>''',

    'immunotherapy.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 220" width="100%" height="100%">
  <defs>
    <linearGradient id="g5" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#8b5cf6" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#a855f7" stop-opacity="0.05"/>
    </linearGradient>
  </defs>
  <rect width="400" height="220" rx="20" fill="url(#g5)"/>
  <rect x="15" y="15" width="370" height="190" rx="16" fill="#ffffff" stroke="#ede9fe" stroke-width="2"/>
  <circle cx="200" cy="78" r="36" fill="#f5f3ff" stroke="#8b5cf6" stroke-width="3"/>
  <path d="M200 86 L200 104" stroke="#7c3aed" stroke-width="5" stroke-linecap="round"/>
  <path d="M200 86 L182 64" stroke="#7c3aed" stroke-width="5" stroke-linecap="round"/>
  <path d="M200 86 L218 64" stroke="#7c3aed" stroke-width="5" stroke-linecap="round"/>
  <circle cx="179" cy="61" r="5" fill="#06b6d4"/>
  <circle cx="221" cy="61" r="5" fill="#06b6d4"/>
  <text x="200" y="172" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="bold" fill="#6d28d9" text-anchor="middle">Targeted &amp; Immunotherapy</text>
  <text x="200" y="189" font-family="system-ui, -apple-system, sans-serif" font-size="10" fill="#64748b" text-anchor="middle">PD-1/PD-L1 Checkpoint &amp; Tyrosine Kinase Inhibitors</text>
</svg>''',

    'pulmonary_wellness.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 220" width="100%" height="100%">
  <defs>
    <linearGradient id="g6" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10b981" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#14b8a6" stop-opacity="0.05"/>
    </linearGradient>
  </defs>
  <rect width="400" height="220" rx="20" fill="url(#g6)"/>
  <rect x="15" y="15" width="370" height="190" rx="16" fill="#ffffff" stroke="#ccfbf1" stroke-width="2"/>
  <circle cx="200" cy="78" r="36" fill="#f0fdf4" stroke="#10b981" stroke-width="3"/>
  <path d="M190 64 C178 64, 172 78, 178 96 C182 104, 192 100, 192 88 Z" fill="#10b981" opacity="0.9"/>
  <path d="M210 64 C222 64, 228 78, 222 96 C218 104, 208 100, 208 88 Z" fill="#10b981" opacity="0.9"/>
  <path d="M148 126 L170 126 L180 110 L194 140 L204 118 L212 130 L220 126 L248 126" stroke="#059669" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="200" y="172" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="bold" fill="#047857" text-anchor="middle">Respiratory Wellness &amp; Rehabilitation</text>
  <text x="200" y="189" font-family="system-ui, -apple-system, sans-serif" font-size="10" fill="#64748b" text-anchor="middle">Diaphragmatic Conditioning &amp; Smoke Cessation</text>
</svg>'''
}

for name, content in svgs.items():
    p = os.path.join(out_dir, name)
    with open(p, 'w', encoding='utf-8') as f:
        f.write(content)
    print('Generated guidance illustration:', p)
