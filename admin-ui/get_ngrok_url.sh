#!/bin/bash

echo "🔍 Getting ngrok public URL..."

# Wait for ngrok to start
sleep 5

# Try to get the URL from ngrok API
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    for tunnel in data.get('tunnels', []):
        if tunnel.get('proto') == 'https':
            print(tunnel.get('public_url', ''))
            break
except:
    pass
" 2>/dev/null)

if [ -n "$NGROK_URL" ]; then
    echo "✅ ngrok URL found: $NGROK_URL"
    echo ""
    echo "🔗 Webhook URL for GitHub:"
    echo "$NGROK_URL/webhook/github/security-alert"
    echo ""
    echo "🧪 Test URL:"
    echo "$NGROK_URL/webhook/github/test"
    echo ""
    echo "📚 API Documentation:"
    echo "$NGROK_URL/docs"
else
    echo "❌ Could not get ngrok URL. Please check if ngrok is running."
    echo "💡 Try running: ngrok http 8000"
fi

