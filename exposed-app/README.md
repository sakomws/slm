# AWS EC2 Dashboard

A full-stack application for monitoring and managing AWS EC2 instances using IAM user credentials.

## 🏗️ Architecture

- **Frontend**: Next.js 14 with TypeScript and Tailwind CSS
- **Backend**: FastAPI with Python
- **AWS Integration**: Boto3 for EC2 API calls
- **Authentication**: IAM user credentials

## 🚀 Features

- **EC2 Instance Listing**: View all EC2 instances in any AWS region
- **Instance Details**: Comprehensive instance information including:
  - Instance ID, type, and state
  - Public and private IP addresses
  - Launch time and availability zone
  - Security groups and VPC information
  - Tags and metadata
- **Real-time Status**: Live instance state monitoring
- **Multi-region Support**: Switch between AWS regions
- **Secure Credentials**: IAM user authentication with minimal permissions

## 📁 Project Structure

```
exposed-app/
├── backend/                 # FastAPI backend
│   ├── main.py             # Main application file
│   └── requirements.txt    # Python dependencies
├── frontend/               # Next.js frontend
│   ├── app/               # Next.js app directory
│   │   ├── components/    # React components
│   │   ├── types/         # TypeScript types
│   │   └── page.tsx       # Main page
│   ├── package.json       # Node.js dependencies
│   └── tailwind.config.js # Tailwind configuration
├── start_backend.sh        # Backend startup script
├── start_frontend.sh       # Frontend startup script
├── start_all.sh           # Start both services
└── README.md              # This file
```

## 🛠️ Setup and Installation

### Prerequisites

- Node.js 18+ and npm
- Python 3.8+
- AWS IAM user with EC2 read permissions

### Environment Setup

1. **Create a `.env` file in the backend directory:**
   ```bash
   cd backend
   cp .env.example .env
   ```

2. **Edit the `.env` file with your AWS credentials:**
   ```env
   AWS_ACCESS_KEY_ID=your_actual_access_key_here
   AWS_SECRET_ACCESS_KEY=your_actual_secret_key_here
   AWS_DEFAULT_REGION=us-east-1
   ```

### Quick Start

1. **Clone and navigate to the project:**
   ```bash
   cd exposed-app
   ```

2. **Start all services:**
   ```bash
   chmod +x start_all.sh
   ./start_all.sh
   ```

3. **Access the application:**
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:8001
   - API Documentation: http://localhost:8001/docs

### Manual Setup

#### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev -- --port 3001
```

## 🔐 AWS Credentials Setup

### IAM User Permissions

Create an IAM user with the following policy:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "ec2:DescribeInstances",
                "ec2:DescribeRegions"
            ],
            "Resource": "*"
        }
    ]
}
```

### Using Credentials

1. **Access Key ID**: Your IAM user's access key
2. **Secret Access Key**: Your IAM user's secret key
3. **Region**: Choose the AWS region to query

## 📡 API Endpoints

### Backend API (Port 8001)

- `GET /` - Health check
- `GET /health` - Detailed health status
- `POST /ec2/instances` - List EC2 instances
- `GET /ec2/regions` - List available AWS regions

### Example API Usage

```bash
# List EC2 instances
curl -X POST http://localhost:8001/ec2/instances \
  -H "Content-Type: application/json" \
  -d '{
    "access_key_id": "AKIAIOSFODNN7EXAMPLE",
    "secret_access_key": "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
    "region": "us-east-1"
  }'
```

## 🎨 Frontend Features

### Components

- **AWSCredentialsForm**: Secure credential input with password visibility toggle
- **EC2InstanceCard**: Detailed instance information display
- **EC2InstancesList**: Grid layout with summary statistics

### UI Features

- **AWS-themed Design**: Orange and blue color scheme
- **Responsive Layout**: Mobile and desktop optimized
- **Real-time Updates**: Live instance status
- **Error Handling**: Comprehensive error messages
- **Security Indicators**: Visual feedback for connection status

## 🔒 Security Considerations

- **Credential Handling**: Credentials are only used for API calls and not stored
- **Minimal Permissions**: IAM user should have only EC2 read permissions
- **HTTPS**: Use HTTPS in production environments
- **Environment Variables**: Store credentials securely in production

## 🚀 Production Deployment

### Environment Variables

```bash
# Backend
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_DEFAULT_REGION=us-east-1
```

### Docker Deployment

```dockerfile
# Backend Dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]
```

## 📊 Monitoring and Logging

- **Backend Logs**: FastAPI automatic logging
- **Error Tracking**: Comprehensive error handling
- **Performance**: Optimized API calls with boto3
- **Health Checks**: Built-in health monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

1. **Credentials Error**: Ensure IAM user has EC2 permissions
2. **Region Issues**: Verify the region is correct and accessible
3. **Network Issues**: Check firewall and network connectivity
4. **Port Conflicts**: Ensure ports 3001 and 8001 are available

### Debug Mode

```bash
# Backend with debug logging
python -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload --log-level debug

# Frontend with debug mode
npm run dev -- --port 3001 --debug
```

## 📞 Support

For issues and questions:
- Check the API documentation at http://localhost:8001/docs
- Review the browser console for frontend errors
- Check backend logs for API errors
