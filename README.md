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
│   └── web/                  # Next.js 15 web application
│       ├── src/
│       │   ├── app/         # App router pages
│       │   ├── components/  # React components
│       │   ├── contexts/    # React contexts
│       │   └── hooks/       # Custom hooks
│       ├── pages/api/       # Vercel API Functions
│       │   ├── auth/        # Authentication endpoints
│       │   └── agents/      # AI agent endpoints
│       ├── lib/api/         # API utilities and services
│       │   ├── services/    # Business logic
│       │   ├── utils/       # Utilities
│       │   └── types.ts     # TypeScript types
│       ├── prisma/          # Database schema
│       └── public/          # Static assets
└── vercel.json              # Vercel deployment configuration
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
- **Vercel Functions** for serverless API
- **Prisma** with PostgreSQL database
- **OpenAI API** for AI agent responses
- **TypeScript** for type safety



## 🔧 Environment Variables

### Web App (.env.local)
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
NEXT_PUBLIC_PRIVY_APP_ID="your_privy_app_id"

# JWT Secret
JWT_SECRET="your_jwt_secret_key"

# API Configuration (optional - defaults to same port as Next.js app)
NEXT_PUBLIC_API_URL="http://localhost:3000/api"

# LiveKit (optional)
LIVEKIT_API_KEY="your_livekit_api_key"
LIVEKIT_API_SECRET="your_livekit_api_secret"
LIVEKIT_WS_URL="wss://your-livekit-server.livekit.cloud"
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
cd apps/web
npx prisma migrate dev
npx prisma db seed
```

5. **Start the application**
```bash
# Start the web app (includes API functions)
npm run dev

# Web app and API available at http://localhost:3000
```

## ☁️ Vercel Deployment

The platform is designed for Vercel deployment:

### Automatic Deployment

1. **Configure Vercel Project** and environment variables
2. **Connect GitHub repository** to Vercel
3. **Push to main branch** → Automatic production deployment
4. **Push to other branches** → Automatic preview deployments

### Manual Deployment

```bash
# Deploy to Vercel
npm run deploy

# Deploy preview
npm run deploy:preview
```

### Deployment Architecture

- **Full-stack App**: Vercel (Static + Serverless Functions)
- **API**: Vercel Functions (TypeScript)
- **Database**: PostgreSQL (Neon, Supabase, etc.)
- **CDN**: Vercel Global Edge Network

Environment variables are managed through the Vercel dashboard or CLI.

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
cd apps/web
npx prisma generate

# Apply database migrations
npx prisma migrate deploy

# Open Prisma Studio
npx prisma studio

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
