# SparkMind Web App 🌐

Next.js web application for the SparkMind AI chat platform.

## Features

- **6 AI Agents** with unique personalities and animated AI tutors
- **Interactive UI** with hover effects and smooth animations
- **Privy Authentication** supporting Web3 wallets and email
- **Anonymous Chat** for unauthenticated users
- **Real-time Sessions** with automatic cleanup
- **0G Storage Integration** for custom prompt management

## Quick Start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000

## Tech Stack

- **Next.js 14** with App Router
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Privy** for authentication
- **Prisma** for database
- **0G Storage SDK** for decentralized storage

## Project Structure

```
src/
├── app/                  # Next.js App Router
├── components/           # UI components
│   ├── avatar/          # AI Tutor grid & chat components
│   ├── ui/              # Base UI components
│   └── navigation.tsx   # Navigation
├── contexts/            # React contexts
├── hooks/               # Custom hooks
└── lib/                 # Utilities & services
```

## Key Components

- **AI Tutor Grid**: Interactive agent selection with hover animations
- **ChatInterface**: Real-time messaging with AI agents
- **AuthContext**: Privy authentication management
- **SessionContext**: Chat session management

## Environment Variables

```bash
OPENAI_API_KEY=your_openai_key
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
PRIVY_APP_SECRET=your_privy_secret
DATABASE_URL=your_postgres_url
```

## Available Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## AI Agents

1. **Professional Advisor** 💼
2. **Creative Mentor** 🎨
3. **Technical Expert** 🔧
4. **Wellness Coach** 🧘
5. **Learning Companion** 📚
6. **Mindfulness Guide** 🌱

---

Part of the SparkMind AI chat platform built for ETHGlobal. 