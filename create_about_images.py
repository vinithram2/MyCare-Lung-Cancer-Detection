import os

out_dir = 'frontend/public/about'
os.makedirs(out_dir, exist_ok=True)

svgs = {
    'neural_architecture.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 280" width="100%" height="100%">
  <defs>
    <linearGradient id="gradBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
    <linearGradient id="gradTeal" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2dd4bf"/>
      <stop offset="100%" stop-color="#0d9488"/>
    </linearGradient>
    <linearGradient id="gradBlue" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#0284c7"/>
    </linearGradient>
    <linearGradient id="gradHeat" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ef4444"/>
      <stop offset="50%" stop-color="#eab308"/>
      <stop offset="100%" stop-color="#3b82f6"/>
    </linearGradient>
  </defs>
  
  <rect width="800" height="280" rx="24" fill="url(#gradBg)"/>
  
  <!-- Step 1: Input CT Scan -->
  <g transform="translate(40, 45)">
    <rect width="110" height="130" rx="14" fill="#020617" stroke="#334155" stroke-width="2"/>
    <ellipse cx="42" cy="65" rx="16" ry="32" fill="#1e293b"/>
    <ellipse cx="68" cy="65" rx="16" ry="32" fill="#1e293b"/>
    <circle cx="48" cy="55" r="7" fill="#ef4444" opacity="0.9"/>
    <text x="55" y="156" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">Input CT Slice</text>
    <text x="55" y="172" fill="#64748b" font-family="system-ui, sans-serif" font-size="9" text-anchor="middle">224 x 224 x 3</text>
  </g>
  
  <!-- Arrow 1 -->
  <path d="M 165 110 L 195 110" stroke="#2dd4bf" stroke-width="3" stroke-linecap="round"/>
  <polygon points="193,105 203,110 193,115" fill="#2dd4bf"/>

  <!-- Step 2: ResNet Feature Extractor -->
  <g transform="translate(215, 30)">
    <rect width="150" height="160" rx="16" fill="#0f766e" fill-opacity="0.2" stroke="#0d9488" stroke-width="2" stroke-dasharray="6 4"/>
    <!-- Layer Blocks -->
    <rect x="20" y="20" width="110" height="24" rx="6" fill="url(#gradTeal)"/>
    <text x="75" y="36" fill="#ffffff" font-family="system-ui, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">Conv 7x7 + MaxPool</text>
    
    <rect x="20" y="52" width="110" height="24" rx="6" fill="url(#gradTeal)"/>
    <text x="75" y="68" fill="#ffffff" font-family="system-ui, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">ResBlock 1 &amp; 2</text>
    
    <rect x="20" y="84" width="110" height="24" rx="6" fill="url(#gradTeal)"/>
    <text x="75" y="100" fill="#ffffff" font-family="system-ui, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">ResBlock 3 &amp; 4</text>
    
    <rect x="20" y="116" width="110" height="24" rx="6" fill="url(#gradTeal)"/>
    <text x="75" y="132" fill="#ffffff" font-family="system-ui, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">AdaptiveAvgPool (512)</text>
    
    <text x="75" y="172" fill="#2dd4bf" font-family="system-ui, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">ResNet-18 Backbone</text>
    <text x="75" y="188" fill="#64748b" font-family="system-ui, sans-serif" font-size="9" text-anchor="middle">Pretrained Deep Features</text>
  </g>

  <!-- Arrow 2 -->
  <path d="M 380 110 L 410 110" stroke="#38bdf8" stroke-width="3" stroke-linecap="round"/>
  <polygon points="408,105 418,110 408,115" fill="#38bdf8"/>

  <!-- Step 3: Grad-CAM Explainability Engine -->
  <g transform="translate(430, 45)">
    <rect width="130" height="130" rx="14" fill="#0369a1" fill-opacity="0.2" stroke="#0284c7" stroke-width="2"/>
    <rect x="15" y="15" width="100" height="100" rx="10" fill="url(#gradHeat)" opacity="0.8"/>
    <circle cx="55" cy="55" r="22" fill="#ffffff" opacity="0.6"/>
    <text x="65" y="156" fill="#38bdf8" font-family="system-ui, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">Grad-CAM Visualizer</text>
    <text x="65" y="172" fill="#64748b" font-family="system-ui, sans-serif" font-size="9" text-anchor="middle">Target Activation Overlay</text>
  </g>

  <!-- Arrow 3 -->
  <path d="M 575 110 L 605 110" stroke="#f59e0b" stroke-width="3" stroke-linecap="round"/>
  <polygon points="603,105 613,110 603,115" fill="#f59e0b"/>

  <!-- Step 4: Tri-Class Probability Softmax -->
  <g transform="translate(625, 45)">
    <rect width="140" height="130" rx="14" fill="#1e1b4b" fill-opacity="0.4" stroke="#6366f1" stroke-width="2"/>
    <rect x="15" y="18" width="110" height="24" rx="6" fill="#15803d"/>
    <text x="70" y="34" fill="#ffffff" font-family="system-ui, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">Normal: 98.8%</text>
    
    <rect x="15" y="48" width="110" height="24" rx="6" fill="#b45309"/>
    <text x="70" y="64" fill="#ffffff" font-family="system-ui, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">Benign: 99.8%</text>
    
    <rect x="15" y="78" width="110" height="24" rx="6" fill="#b91c1c"/>
    <text x="70" y="94" fill="#ffffff" font-family="system-ui, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">Malignant: 98.3%</text>
    
    <text x="70" y="156" fill="#a5b4fc" font-family="system-ui, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">Softmax Output</text>
    <text x="70" y="172" fill="#64748b" font-family="system-ui, sans-serif" font-size="9" text-anchor="middle">Linear (512 -> 256 -> 3)</text>
  </g>

  <!-- Bottom Metric Banner -->
  <rect x="40" y="225" width="725" height="36" rx="10" fill="#0f172a" stroke="#334155"/>
  <text x="400" y="248" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="11" text-anchor="middle">
    Balanced Dataset Training &bull; ResNet-18 Core &bull; Label-Smoothed Cross-Entropy Loss &bull; 99.4% Accuracy
  </text>
</svg>''',

    'dataset_distribution.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 240" width="100%" height="100%">
  <defs>
    <linearGradient id="gNormal" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#22c55e"/>
      <stop offset="100%" stop-color="#16a34a"/>
    </linearGradient>
    <linearGradient id="gBenign" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#d97706"/>
    </linearGradient>
    <linearGradient id="gMalignant" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ef4444"/>
      <stop offset="100%" stop-color="#dc2626"/>
    </linearGradient>
  </defs>
  
  <rect width="500" height="240" rx="20" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>
  
  <text x="250" y="32" font-family="system-ui, sans-serif" font-size="14" font-weight="bold" fill="#0f172a" text-anchor="middle">IQ-OTH/NCCD Cohort Composition (2,077 Slices)</text>
  
  <!-- Bar 1: Malignant (1,346) -->
  <text x="40" y="72" font-family="system-ui, sans-serif" font-size="11" font-weight="bold" fill="#334155">Malignant (64.8%)</text>
  <rect x="40" y="80" width="420" height="24" rx="8" fill="#f1f5f9"/>
  <rect x="40" y="80" width="272" height="24" rx="8" fill="url(#gMalignant)"/>
  <text x="320" y="96" font-family="system-ui, sans-serif" font-size="11" font-weight="bold" fill="#dc2626">1,346 Scans</text>
  
  <!-- Bar 2: Normal (631) -->
  <text x="40" y="127" font-family="system-ui, sans-serif" font-size="11" font-weight="bold" fill="#334155">Normal (30.4%)</text>
  <rect x="40" y="135" width="420" height="24" rx="8" fill="#f1f5f9"/>
  <rect x="40" y="135" width="128" height="24" rx="8" fill="url(#gNormal)"/>
  <text x="178" y="151" font-family="system-ui, sans-serif" font-size="11" font-weight="bold" fill="#16a34a">631 Scans</text>
  
  <!-- Bar 3: Benign (100) -->
  <text x="40" y="182" font-family="system-ui, sans-serif" font-size="11" font-weight="bold" fill="#334155">Benign (4.8% - Oversampled 1:1:1)</text>
  <rect x="40" y="190" width="420" height="24" rx="8" fill="#f1f5f9"/>
  <rect x="40" y="190" width="35" height="24" rx="8" fill="url(#gBenign)"/>
  <text x="85" y="206" font-family="system-ui, sans-serif" font-size="11" font-weight="bold" fill="#d97706">100 Scans</text>
</svg>''',

    'ai_safety_shield.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240" width="100%" height="100%">
  <defs>
    <linearGradient id="gShield" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0d9488" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#0284c7" stop-opacity="0.05"/>
    </linearGradient>
  </defs>
  
  <rect width="400" height="240" rx="20" fill="url(#gShield)"/>
  <rect x="15" y="15" width="370" height="210" rx="16" fill="#ffffff" stroke="#ccfbf1" stroke-width="2"/>
  
  <!-- Shield Badge -->
  <path d="M 200 45 C 230 45, 255 52, 255 85 C 255 125, 200 150, 200 150 C 200 150, 145 125, 145 85 C 145 52, 170 45, 200 45 Z" fill="#f0fdfa" stroke="#0d9488" stroke-width="3"/>
  <circle cx="200" cy="85" r="16" fill="#0d9488"/>
  <path d="M 193 85 L 198 90 L 208 78" stroke="#ffffff" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  
  <text x="200" y="180" font-family="system-ui, sans-serif" font-size="14" font-weight="bold" fill="#0f766e" text-anchor="middle">Clinical Decision-Support Boundaries</text>
  <text x="200" y="200" font-family="system-ui, sans-serif" font-size="10" fill="#64748b" text-anchor="middle">Ethical AI Validation &bull; Non-Autonomous Diagnosis</text>
</svg>'''
}

for name, content in svgs.items():
    p = os.path.join(out_dir, name)
    with open(p, 'w', encoding='utf-8') as f:
        f.write(content)
    print('Generated About visual illustration:', p)
