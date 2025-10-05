# GitHub Security Alerts Dashboard

A real-time dashboard for monitoring GitHub security alerts with a clean separation between frontend and backend.

## 📁 Project Structure

```
admin-ui/
├── frontend/                 # Next.js Frontend
│   ├── app/                 # Next.js App Router
│   │   ├── components/      # React Components
│   │   ├── types/          # TypeScript Types
│   │   ├── globals.css     # Global Styles
│   │   ├── layout.tsx      # Root Layout
│   │   └── page.tsx        # Main Dashboard Page
│   ├── package.json        # Frontend Dependencies
│   ├── next.config.js      # Next.js Configuration
│   ├── tailwind.config.js   # Tailwind CSS Configuration
│   ├── tsconfig.json       # TypeScript Configuration
│   └── postcss.config.js    # PostCSS Configuration
├── backend/                 # FastAPI Backend
│   ├── main.py             # FastAPI Application
│   └── requirements.txt    # Python Dependencies
├── start_frontend.sh       # Start Frontend Only
├── start_backend.sh        # Start Backend Only
├── start_all.sh           # Start Both Services
└── README.md              # This File
```

## 🚀 Quick Start

### Start Everything
```bash
./start_all.sh
```

### Start Individual Services
```bash
# Frontend only (Next.js on port 3000)
./start_frontend.sh

# Backend only (FastAPI on port 8000)
./start_backend.sh
```

## 🌐 Access Points

- **Frontend Dashboard**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **WebSocket**: ws://localhost:8000/ws

## 🛠️ Development

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

### Backend Development
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## 📦 Dependencies

### Frontend
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS

### Backend
- FastAPI
- WebSocket support
- GitHub API integration
- Real-time alert processing

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the backend directory:
```env
GITHUB_WEBHOOK_SECRET=your_webhook_secret
```

### GitHub Webhook Setup
1. Go to your GitHub repository settings
2. Navigate to Webhooks
3. Add webhook URL: `https://your-domain.com/webhook/github`
4. Select "Security alerts" events
5. Set the secret from your `.env` file

## 📊 Features

- **Real-time Alerts**: WebSocket-based live updates
- **Repository Management**: Subscribe to GitHub repositories
- **Alert Filtering**: Filter by severity, repository, and time
- **Metrics Dashboard**: Overview of alert statistics
- **Responsive Design**: Works on all device sizes

## 🎨 UI Components

- **DashboardHeader**: Main navigation and status
- **MetricsCard**: Key performance indicators
- **AlertCard**: Individual security alert display
- **RepositorySubscription**: Manage repository subscriptions
- **AlertTimeline**: Chronological alert view
- **ConnectionStatus**: WebSocket connection indicator

## 🔒 Security

- WebSocket authentication
- GitHub webhook signature verification
- CORS configuration
- Environment variable protection

## 📝 License

MIT License - see LICENSE file for details.