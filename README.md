# SparkMind 🧠⚡

**AI Agent Chat Platform** - Choose your AI companion and start chatting!

## ✨ Features

- **6 AI Agents**: Professional Advisor, Creative Mentor, Technical Expert, Wellness Coach, Learning Companion, Mindfulness Guide
- **Interactive AI Tutors**: Hover effects with animated GIFs
- **Smart Authentication**: Privy Web3/email login with anonymous chat support
- **Real-time Chat**: Instant AI responses with session management
- **Modern UI**: Beautiful, responsive design with smooth animations
- **0G Storage Integration**: Custom prompt storage and retrieval

## 🚀 Quick Start

1. **Install dependencies**
```bash
npm install
```

2. **Set up environment**
```bash
cp apps/web/.env.example apps/web/.env.local
# Add your API keys (OpenAI, Privy, etc.)
```

3. **Run the app**
```bash
cd apps/web
npm run dev
```

4. **Open http://localhost:3000**

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Authentication**: Privy (Web3 + Email)
- **AI**: OpenAI API (GPT-4o-mini)
- **Database**: Prisma + PostgreSQL
- **Storage**: 0G Storage SDK
- **Deployment**: Vercel

## 📁 Project Structure

```
apps/web/
├── src/
│   ├── app/              # Next.js pages
│   ├── components/       # UI components
│   ├── contexts/         # React contexts
│   ├── hooks/            # Custom hooks
│   └── lib/              # Utils & services
├── public/images/        # AI Tutor images & GIFs
└── prisma/               # Database schema
```

## 🎯 Key Components

- **AI Tutor Grid**: Interactive agent selection with hover animations
- **Chat Interface**: Real-time messaging with AI agents
- **Session Management**: Automatic session creation and cleanup
- **Auth System**: Seamless Web3/email authentication

## 🔧 Environment Variables

```bash
# Core
OPENAI_API_KEY=your_openai_key
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
PRIVY_APP_SECRET=your_privy_secret
DATABASE_URL=your_postgres_url

# Optional
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## 📚 Available AI Agents

1. **Professional Advisor** 💼 - Career and business guidance
2. **Creative Mentor** 🎨 - Artistic inspiration and creativity
3. **Technical Expert** 🔧 - Programming and technical help
4. **Wellness Coach** 🧘 - Health and wellness support
5. **Learning Companion** 📚 - Educational assistance
6. **Mindfulness Guide** 🌱 - Mental health and mindfulness

## 🚀 Deployment

Deploy to Vercel with one click:
```bash
npm run build
vercel deploy
```

## 🤝 Contributing

1. Fork the repo
2. Create feature branch
3. Make changes
4. Submit PR

---

**Built for ETHGlobal** | Modern AI chat platform with Web3 integration