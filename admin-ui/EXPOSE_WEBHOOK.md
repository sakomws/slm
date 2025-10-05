# Exposing Your Webhook Endpoint for GitHub

To receive GitHub security alerts, you need to expose your local webhook endpoint to the internet. Here are several options:

## Option 1: ngrok (Recommended - Free with Account)

### Setup ngrok:
1. **Sign up for ngrok**: https://dashboard.ngrok.
com/signup
2. **Get your authtoken**: https://dashboard.ngrok.com/get-started/your-authtoken
3. **Configure ngrok**:
   ```bash
   ngrok config add-authtoken YOUR_AUTHTOKEN_HERE
   ```

### Start your application:
```bash
# Terminal 1 - Start FastAPI backend
cd sample-app
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000

# Terminal 2 - Start ngrok tunnel
ngrok http 8000
```

### Get your webhook URL:
- ngrok will display a public URL like: `https://abc123.ngrok.io`
- Your webhook URL will be: `https://abc123.ngrok.io/webhook/github/security-alert`

## Option 2: Cloudflare Tunnel (Free)

### Install cloudflared:
```bash
brew install cloudflared
```

### Start tunnel:
```bash
# Terminal 1 - Start FastAPI backend
cd sample-app
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000

# Terminal 2 - Start Cloudflare tunnel
cloudflared tunnel --url http://localhost:8000
```

## Option 3: localtunnel (Free, No Account Required)

### Install localtunnel:
```bash
npm install -g localtunnel
```

### Start tunnel:
```bash
# Terminal 1 - Start FastAPI backend
cd sample-app
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000

# Terminal 2 - Start localtunnel
lt --port 8000
```

## Option 4: serveo (Free, No Installation)

### Start tunnel:
```bash
# Terminal 1 - Start FastAPI backend
cd sample-app
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000

# Terminal 2 - SSH tunnel (no installation needed)
ssh -R 80:localhost:8000 serveo.net
```

## GitHub Webhook Configuration

Once you have your public URL, configure GitHub:

1. **Go to your GitHub repository**
2. **Navigate to**: Settings → Webhooks
3. **Click**: "Add webhook"
4. **Configure**:
   - **Payload URL**: `https://your-tunnel-url.ngrok.io/webhook/github/security-alert`
   - **Content type**: `application/json`
   - **Events**: Select "Security alerts"
   - **Active**: ✅ Checked

## Testing Your Webhook

### Test with curl:
```bash
curl -X POST https://your-tunnel-url.ngrok.io/webhook/github/test
```

### Test from the UI:
1. Open your frontend: http://localhost:3000
2. Click "Send Test Alert" button
3. You should see the alert appear in real-time

## Security Considerations

⚠️ **Important**: These tunnels expose your local server to the internet. For production:

1. **Add authentication** to your webhook endpoint
2. **Verify GitHub webhook signatures** (implement in backend)
3. **Use HTTPS** (ngrok provides this automatically)
4. **Limit access** to specific IP ranges if possible

## Troubleshooting

### Common Issues:
- **Tunnel not working**: Check if your backend is running on port 8000
- **GitHub webhook failing**: Verify the URL is accessible from GitHub
- **CORS errors**: The backend already has CORS configured for localhost:3000

### Check if your webhook is accessible:
```bash
curl -X GET https://your-tunnel-url.ngrok.io/health
```

### View webhook deliveries in GitHub:
- Go to your repository → Settings → Webhooks
- Click on your webhook
- View "Recent Deliveries" tab

## Quick Start Script

I've created a script to help you get started:

```bash
cd sample-app
./start_with_tunnel.sh
```

This script will:
1. Start the FastAPI backend
2. Start ngrok tunnel
3. Display the webhook URL
4. Open the frontend in your browser

