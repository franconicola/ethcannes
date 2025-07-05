# SparkMind - AI Agent Chat Platform

A modern full-stack application for real-time conversations with AI agents using OpenAI's API, Privy authentication, and LiveKit for WebRTC communication.

## 🚀 Features

- **💬 AI Agent Chat**: Real-time text conversations with intelligent AI agents
- **🤖 Multiple AI Personalities**: Choose from different AI agent personalities and specialties
- **🔐 Secure Authentication**: Privy integration with wallet and social login
- **🌐 Web-focused**: Modern web application with desktop support
- **⚡ Real-time Updates**: Live conversation updates and typing indicators
- **🎨 Modern UI**: Beautiful, responsive design with dark mode support
- **🔊 Audio Support**: Voice integration with LiveKit for future audio features
- **📈 Usage Analytics**: Track conversations and usage patterns
- **🌐 Multi-tenant**: Support for both authenticated and anonymous users
- **☁️ Cloud-native**: Built for Cloudflare Workers and Pages

## 🏗️ Architecture

```
sparkmind/
├── apps/
│   ├── web/                  # Next.js 15 web application
│   │   ├── src/
│   │   │   ├── app/         # App router pages
│   │   │   ├── components/  # React components
│   │   │   ├── contexts/    # React contexts
│   │   │   └── hooks/       # Custom hooks
│   │   └── public/          # Static assets
│   └── api/                 # Cloudflare Workers API
│       ├── src/
│       │   ├── routes/      # API endpoints (auth, users, agents)
│       │   ├── services/    # Business logic
│       │   └── utils/       # Utilities
│       └── prisma/          # Database schema
├── scripts/                 # Deployment and utility scripts
└── packages/                # Shared packages
    └── ui/                  # Shared UI components
```

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Next.js 15** (App Router)
- **React Native** with Expo SDK 53
- **TailwindCSS** for styling
- **Privy** for authentication
- **LiveKit** for WebRTC communication

### Backend
- **Cloudflare Workers** for serverless API
- **Prisma** with PostgreSQL database
- **OpenAI API** for AI agent responses
- **Cloudflare D1** for edge database



## 🔧 Environment Variables

### API (.env)
```bash
# Database
DATABASE_URL="your_postgresql_connection_string"

# OpenAI API
OPENAI_API_KEY="your_openai_api_key"
OPENAI_MODEL="gpt-4o-mini"
OPENAI_MAX_TOKENS="1000"
OPENAI_TEMPERATURE="0.7"

# Privy Authentication
PRIVY_APP_ID="your_privy_app_id"
PRIVY_APP_SECRET="your_privy_app_secret"

# LiveKit (optional)
LIVEKIT_API_KEY="your_livekit_api_key"
LIVEKIT_API_SECRET="your_livekit_api_secret"
LIVEKIT_WS_URL="wss://your-livekit-server.livekit.cloud"
```

### Web (.env.local)
```bash
NEXT_PUBLIC_PRIVY_APP_ID="your_privy_app_id"
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
```



## 🚀 Getting Started

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/sparkmind.git
cd sparkmind
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Set up the database**
```bash
cd apps/api
npx prisma migrate dev
npx prisma db seed
```

5. **Start all applications**
```bash
# Start all apps concurrently
npm run dev

# Or start individually:
npm run dev:web    # Web app at http://localhost:3000
npm run dev:api    # API at http://localhost:3001
```

## ☁️ Cloudflare Deployment

The platform is designed for Cloudflare infrastructure deployment:

### Quick Deployment Check

Before deploying, run our validation script:

```bash
./scripts/deploy-check.sh
```

This will check all prerequisites and validate your environment configuration.

### Automatic Deployment

1. **Configure GitHub Secrets** (see [DEPLOYMENT.md](DEPLOYMENT.md))
2. **Push to main branch** → Automatic production deployment
3. **Push to develop branch** → Automatic development deployment

### Manual Deployment

```bash
# Deploy API to Cloudflare Workers
cd apps/api
npm run deploy

# Deploy Web App to Cloudflare Pages
cd apps/web
npm run build:cf
npm run deploy
```

### Deployment Architecture

- **API**: Cloudflare Workers (Serverless)
- **Web App**: Cloudflare Pages (Static + Edge functions)
- **Database**: PostgreSQL (Neon, Supabase, etc.)
- **CDN**: Cloudflare Global Network

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

## 📚 API Documentation

### Authentication
- `POST /api/auth/verify` - Verify Privy token
- `GET /api/auth/me` - Get current user

### AI Agents
- `GET /api/agents/public` - Get available AI agents
- `POST /api/agents/sessions` - Create AI agent session
- `POST /api/agents/sessions/:id/chat` - Send message to AI agent
- `POST /api/agents/sessions/:id/stop` - Stop AI agent session
- `GET /api/agents/sessions/:id/conversation` - Get conversation history

### Users
- `GET /api/users/me` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/sessions` - Get user sessions

## 🏃‍♂️ Development

### Running Tests
```bash
npm run test
```

### Building for Production
```bash
npm run build
```

### Database Management
```bash
# Generate Prisma client
npx prisma generate

# Reset database
npx prisma migrate reset

# View database
npx prisma studio
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **OpenAI** for AI agent capabilities
- **Privy** for authentication infrastructure
- **LiveKit** for WebRTC communication
- **Cloudflare** for edge computing platform

## 🆘 Support

- 📚 **Documentation**: [DEPLOYMENT.md](DEPLOYMENT.md) for deployment
- 🐛 **Issues**: Use GitHub Issues for bug reports
- 💬 **Discussions**: Use GitHub Discussions for questions
- 🔧 **Development**: Check the troubleshooting section in docs
