# EN.W Backend API

Google OAuth authentication backend for EN.W platform.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Google Cloud Console project with OAuth 2.0 credentials

### Installation

1. Clone and install dependencies:
\`\`\`bash
cd en_w_backend
npm install
\`\`\`

2. Setup environment variables:
\`\`\`bash
cp .env.example .env
\`\`\`

3. Edit `.env` with your credentials:
\`\`\`env
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
SESSION_SECRET=your_random_secret
\`\`\`

4. Run development server:
\`\`\`bash
npm run dev
\`\`\`

## 📁 Project Structure

\`\`\`
src/
├── config/          # Configuration files
├── db/              # User Database
├── routes/          # API routes
├── types/           # TypeScript types
└── server.ts        # Entry point
\`\`\`

## 🔌 API Endpoints

### Authentication
- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - OAuth callback
- `POST /api/auth/logout` - Logout user

### User
- `GET /api/user` - Get current user

### System
- `GET /` - API info

## 🛠️ Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Run production server

## 📝 Environment Variables

See `.env.example` for all required variables.

## 🔒 Security

- Sessions stored server-side
- HTTP-only cookies
- CORS enabled for frontend only
- Environment-based security settings
\`\`\`

---

## 📌 **STEP 12: ทดสอบ Backend**

### **12.1 รัน Development Server**

```bash
npm run dev
