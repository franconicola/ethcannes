# SparkMind - Web Application

A Next.js web application that allows users to interact with AI agents in real-time conversations powered by OpenAI.

## Features

- **Avatar Selection**: Choose from multiple AI avatars (Santa, Kristin, Wayne, Tyler)
- **Real-time Video Chat**: Stream video conversations with AI avatars
- **Text-to-Speech**: Send text messages that avatars speak aloud
- **Authentication**: Secure login with Privy (Web3/email authentication)
- **User Management**: Track sessions, subscription tiers, and usage
- **Dark/Light Mode**: Full theme support
- **Responsive Design**: Works on desktop and tablet devices

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI primitives with custom styling
- **Authentication**: Privy for Web3/email authentication
- **Video Streaming**: LiveKit for WebRTC
- **AI Agents**: OpenAI API integration
- **TypeScript**: Full type safety

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

Add your environment variables:
```env
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
NEXT_PUBLIC_PRIVY_CLIENT_ID=your_privy_client_id
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Home page with avatar selection
│   ├── settings/          # Settings page
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components (Button, Card, etc.)
│   ├── navigation.tsx    # Navigation component
│   └── theme-provider.tsx # Theme provider
├── contexts/             # React contexts
│   └── AuthContext.tsx   # Authentication context
├── hooks/                # Custom React hooks
│   └── useAIAgentAPI.ts   # AI Agent API integration
└── lib/                  # Utility functions
    └── utils.ts          # Common utilities
```

## Key Components

### Avatar Selection
- Grid layout showing available avatars
- Click to start a conversation session
- Loading states and error handling

### Video Chat Interface
- Real-time video streaming with LiveKit
- Text input for sending messages to avatars
- Session management (start/stop)

### Authentication
- Privy integration for Web3 and email authentication
- User profile management
- Subscription tier tracking

### Settings
- User profile information
- Session history and usage statistics
- Account management options

## API Integration

### AI Agent API
The app integrates with OpenAI's API for intelligent chat conversations:

1. **Session Creation**: Creates a new avatar session
2. **Video Streaming**: Establishes WebRTC connection
3. **Text-to-Speech**: Sends text for avatar to speak
4. **Session Management**: Handles session lifecycle

### Backend API
Connects to the backend API for:
- User authentication and management
- Session tracking and analytics
- Subscription management

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### Code Style

- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting
- Tailwind CSS for styling

## Deployment

The app can be deployed to any platform that supports Next.js:

- **Vercel** (recommended)
- **Netlify**
- **AWS Amplify**
- **Docker containers**

## Environment Variables

Required environment variables:

- `NEXT_PUBLIC_PRIVY_APP_ID` - Privy application ID
- `NEXT_PUBLIC_PRIVY_CLIENT_ID` - Privy client ID  
- `NEXT_PUBLIC_API_URL` - Backend API URL

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is part of the SparkMind application suite. 