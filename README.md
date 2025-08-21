CollabBoard - AI-Powered Collaborative Whiteboard 🎨✍️

https://via.placeholder.com/150x150/4A90E2/FFFFFF?text=%F0%9F%8E%A8

https://via.placeholder.com/600x200/4A90E2/FFFFFF?text=Real-time+Collaborative+Drawing

https://img.shields.io/badge/License-MIT-yellow.svg

https://img.shields.io/badge/TypeScript-4.9-blue.svg

https://img.shields.io/badge/React-18-blue.svg



✨ Features
🎨 Core Whiteboard
<svg width="600" height="120"> <rect width="600" height="120" fill="#f0f8ff" rx="10" /> <circle cx="80" cy="60" r="15" fill="#4A90E2" /> <circle cx="130" cy="60" r="15" fill="#50E3C2" /> <circle cx="180" cy="60" r="15" fill="#B8E986" /> <circle cx="230" cy="60" r="15" fill="#FF4081" /> <rect x="280" y="45" width="30" height="30" fill="#9013FE" /> <path d="M330 45 L360 75 L330 75 Z" fill="#F5A623" /> <text x="400" y="65" font-family="Arial" font-size="14" fill="#333">Real-time collaboration</text> </svg>
Real-time collaborative drawing with multiple users

Brush customization (color, size, opacity)

Shapes, text, sticky notes, and image embedding

Unlimited undo/redo history

Export as PNG, JPEG, PDF (SVG coming soon)

🤖 AI Enhancements
<svg width="600" height="120"> <rect width="600" height="120" fill="#f0f8ff" rx="10" /> <path d="M50 60 L80 40 L110 60 L80 80 Z" fill="#4A90E2" /> <circle cx="160" cy="60" r="20" fill="#50E3C2" /> <rect x="210" y="40" width="40" height="40" fill="#B8E986" /> <path d="M280 40 C300 20, 320 20, 340 40 S360 60, 340 80 S300 100, 280 80 S260 60, 280 40" fill="#FF4081" /> <text x="380" y="65" font-family="Arial" font-size="14" fill="#333">AI-powered tools</text> </svg>
Sketch-to-Shape: Converts rough drawings into perfect shapes

Diagram Suggestions: Recommends flowchart/UML improvements

Template Generator: Creates templates based on your content

Code Whiteboarding: Sketch-to-pseudocode conversion

🗣️ Voice & Accessibility
<svg width="600" height="120"> <rect width="600" height="120" fill="#f0f8ff" rx="10" /> <circle cx="60" cy="60" r="25" fill="#4A90E2" /> <path d="M40 50 L30 30 L50 40 Z" fill="#FFFFFF" /> <path d="M80 50 L90 30 L70 40 Z" fill="#FFFFFF" /> <path d="M50 80 Q60 90 70 80" stroke="#FFFFFF" stroke-width="2" fill="none" /> <path d="M120 40 L160 40 L180 80 L140 80 Z" fill="#50E3C2" /> <path d="M200 40 L240 40 L220 80 Z" fill="#B8E986" /> <text x="280" y="65" font-family="Arial" font-size="14" fill="#333">Voice commands & accessibility</text> </svg>
Voice command control ("Undo", "Change to blue", "Export PDF")

Screen reader compatibility

High contrast mode

👥 Collaboration
<svg width="600" height="120"> <rect width="600" height="120" fill="#f0f8ff" rx="10" /> <circle cx="60" cy="60" r="20" fill="#4A90E2" /> <circle cx="110" cy="60" r="20" fill="#50E3C2" /> <circle cx="160" cy="60" r="20" fill="#B8E986" /> <line x1="60" y1="60" x2="110" y2="60" stroke="#333" stroke-width="2" /> <line x1="110" y1="60" x2="160" y2="60" stroke="#333" stroke-width="2" /> <path d="M200 40 L240 40 L220 20 Z" fill="#FF4081" /> <path d="M200 80 L240 80 L220 100 Z" fill="#9013FE" /> <text x="280" y="65" font-family="Arial" font-size="14" fill="#333">Real-time collaboration</text> </svg>
Live cursor tracking

Follow Mode (shadow another user's view)

Built-in chat and emoji reactions

Version history timeline

🚀 Getting Started
Prerequisites
Docker (for Keycloak and PostgreSQL)

Yarn/NPM

Installation
bash
# Clone repository
git clone https://github.com/anshumeshsaini/Collaborative-Whiteboard.git
cd collaboard

# Install dependencies
yarn install

# Set up environment variables
cp .env.example .env
Running Locally
bash
# Start development server
yarn dev

# Start Keycloak and PostgreSQL (in separate terminal)
docker-compose up -d
Access the app at http://localhost:5713

🛠️ Tech Stack
Frontend
<svg width="600" height="150"> <rect width="600" height="150" fill="#f0f8ff" rx="10" /> <rect x="30" y="30" width="80" height="40" rx="5" fill="#61DAFB" /> <text x="35" y="55" font-family="Arial" font-size="12" fill="white">React</text> <rect x="130" y="30" width="80" height="40" rx="5" fill="#3178C6" /> <text x="135" y="55" font-family="Arial" font-size="12" fill="white">TypeScript</text> <rect x="230" y="30" width="80" height="40" rx="5" fill="#7952B3" /> <text x="235" y="55" font-family="Arial" font-size="12" fill="white">Bootstrap</text> <rect x="330" y="30" width="80" height="40" rx="5" fill="#764ABC" /> <text x="335" y="55" font-family="Arial" font-size="12" fill="white">Redux</text> <rect x="430" y="30" width="80" height="40" rx="5" fill="#FF6D00" /> <text x="435" y="55" font-family="Arial" font-size="12" fill="white">Fabric.js</text> <rect x="30" y="90" width="80" height="40" rx="5" fill="#FF4081" /> <text x="35" y="115" font-family="Arial" font-size="12" fill="white">Socket.io</text> <rect x="130" y="90" width="80" height="40" rx="5" fill="#FFCA28" /> <text x="135" y="115" font-family="Arial" font-size="12" fill="white">TensorFlow.js</text> </svg>
React 18 (TypeScript)

Bootstrap 5.2 + Custom SCSS

Fabric.js (Canvas rendering)

Redux Toolkit (State management)

WebSocket (Real-time updates)

Backend
<svg width="600" height="100"> <rect width="600" height="100" fill="#f0f8ff" rx="10" /> <rect x="30" y="30" width="80" height="40" rx="5" fill="#339933" /> <text x="35" y="55" font-family="Arial" font-size="12" fill="white">Node.js</text> <rect x="130" y="30" width="80" height="40" rx="5" fill="#4479A1" /> <text x="135" y="55" font-family="Arial" font-size="12" fill="white">PostgreSQL</text> <rect x="230" y="30" width="80" height="40" rx="5" fill="#000000" /> <text x="235" y="55" font-family="Arial" font-size="12" fill="white">Express</text> <rect x="330" y="30" width="80" height="40" rx="5" fill="#FF6D00" /> <text x="335" y="55" font-family="Arial" font-size="12" fill="white">Socket.io</text> </svg>
Node.js with Express

PostgreSQL with Prisma ORM

Socket.IO for real-time communication

JWT authentication

AI Services
<svg width="600" height="100"> <rect width="600" height="100" fill="#f0f8ff" rx="10" /> <rect x="30" y="30" width="80" height="40" rx="5" fill="#FF6F00" /> <text x="35" y="55" font-family="Arial" font-size="10" fill="white">TensorFlow.js</text> <rect x="130" y="30" width="80" height="40" rx="5" fill="#00599C" /> <text x="135" y="55" font-family="Arial" font-size="10" fill="white">ONNX Runtime</text> <rect x="230" y="30" width="80" height="40" rx="5" fill="#008080" /> <text x="235" y="55" font-family="Arial" font-size="10" fill="white">Web Speech API</text> </svg>
TensorFlow.js (Client-side models)

ONNX Runtime (Shape recognition)

Web Speech API (Voice commands)

🧪 Testing
Run test suites:

bash
# Unit tests
yarn test

# E2E tests (requires running app)
yarn test:e2e

# Performance audit
yarn test:perf
📊 Performance Metrics
<svg width="600" height="300"> <rect width="600" height="300" fill="#f0f8ff" rx="10" /> <!-- Y-axis --> <line x1="50" y1="50" x2="50" y2="250" stroke="#333" stroke-width="2" /> <!-- X-axis --> <line x1="50" y1="250" x2="550" y2="250" stroke="#333" stroke-width="2" /> <!-- Data points --> <circle cx="100" cy="200" r="5" fill="#4A90E2" /> <circle cx="200" cy="180" r="5" fill="#50E3C2" /> <circle cx="300" cy="150" r="5" fill="#B8E986" /> <circle cx="400" cy="100" r="5" fill="#FF4081" /> <circle cx="500" cy="70" r="5" fill="#9013FE" /> <!-- Line connecting points --> <path d="M100 200 L200 180 L300 150 L400 100 L500 70" stroke="#4A90E2" stroke-width="2" fill="none" /> <!-- Labels -->
<text x="100" y="270" font-family="Arial" font-size="12" fill="#333">Base Canvas</text>
<text x="200" y="270" font-family="Arial" font-size="12" fill="#333">AI Tools</text>
<text x="300" y="270" font-family="Arial" font-size="12" fill="#333">Voice</text>
<text x="400" y="270" font-family="Arial" font-size="12" fill="#333">AR Mode</text>
<text x="500" y="270" font-family="Arial" font-size="12" fill="#333">Full App</text>

<!-- Title -->
<text x="300" y="30" font-family="Arial" font-size="16" fill="#333" text-anchor="middle">Performance Metrics (Lower is Better)</text>
</svg>

Feature	Target Latency	Bundle Impact
Base Canvas	<50ms	120KB
AI Tools	<300ms	2.1MB
Voice Commands	<150ms	0KB (Web API)
AR Mode	<500ms	1.8MB
Full App (production)	<2s load	4.2MB
🚢 Deployment
Vercel/Netlify
<svg width="600" height="100"> <rect width="600" height="100" fill="#f0f8ff" rx="10" /> <rect x="150" y="30" width="120" height="40" rx="5" fill="#000000" /> <text x="155" y="55" font-family="Arial" font-size="12" fill="white">Vercel</text> <rect x="330" y="30" width="120" height="40" rx="5" fill="#00C7B7" /> <text x="335" y="55" font-family="Arial" font-size="12" fill="white">Netlify</text> </svg>
Configure these environment variables:

VITE_WS_URL: Your WebSocket server URL

VITE_API_URL: Your backend API URL

VITE_KEYCLOAK_URL: Keycloak authentication URL

👥 Contributing
<svg width="600" height="100"> <rect width="600" height="100" fill="#f0f8ff" rx="10" /> <circle cx="100" cy="50" r="20" fill="#4A90E2" /> <circle cx="160" cy="50" r="20" fill="#50E3C2" /> <circle cx="220" cy="50" r="20" fill="#B8E986" /> <circle cx="280" cy="50" r="20" fill="#FF4081" /> <circle cx="340" cy="50" r="20" fill="#9013FE" /> <circle cx="400" cy="50" r="20" fill="#F5A623" /> <circle cx="460" cy="50" r="20" fill="#4A90E2" /> <text x="300" y="90" font-family="Arial" font-size="14" fill="#333" text-anchor="middle">Join our community!</text> </svg>
We welcome contributions! Please see our Contributing Guidelines for details.

📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

✉️ Contact
Anshumesh Saini - anshumesh.saini@gmail.com

Project Link: https://github.com/anshumeshsaini/Collaborative-Whiteboard
