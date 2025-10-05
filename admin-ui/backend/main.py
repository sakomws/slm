from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import json
import asyncio
from datetime import datetime
import logging
import httpx
import boto3
from botocore.exceptions import ClientError, NoCredentialsError

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="GitHub Security Alerts API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store active WebSocket connections
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket connected. Total connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        logger.info(f"WebSocket disconnected. Total connections: {len(self.active_connections)}")

    async def send_personal_message(self, message: str, websocket: WebSocket):
        try:
            await websocket.send_text(message)
        except Exception as e:
            logger.error(f"Error sending message: {e}")
            self.disconnect(websocket)

    async def broadcast(self, message: str):
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception as e:
                logger.error(f"Error broadcasting to connection: {e}")
                disconnected.append(connection)
        
        # Remove disconnected connections
        for connection in disconnected:
            self.disconnect(connection)

manager = ConnectionManager()

# Pydantic models for GitHub webhook payloads
class SecurityAlert(BaseModel):
    action: str
    alert: Dict[str, Any]
    repository: Dict[str, Any]
    organization: Dict[str, Any] = None
    sender: Dict[str, Any]

class SecurityAlertResponse(BaseModel):
    message: str
    alert_id: str
    repository: str
    severity: str
    timestamp: str

@app.get("/")
async def root():
    return {"message": "GitHub Security Alerts API", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "connections": len(manager.active_connections)}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.post("/webhook/github/security-alert")
async def github_security_webhook(alert: SecurityAlert):
    """
    GitHub webhook endpoint for security alerts
    """
    try:
        # Extract relevant information from the alert
        alert_data = {
            "id": alert.alert.get("number", "unknown"),
            "repository": alert.repository.get("full_name", "unknown"),
            "severity": alert.alert.get("severity", "unknown"),
            "state": alert.alert.get("state", "unknown"),
            "created_at": alert.alert.get("created_at", datetime.now().isoformat()),
            "html_url": alert.alert.get("html_url", ""),
            "dismissed_at": alert.alert.get("dismissed_at"),
            "dismissed_by": alert.alert.get("dismissed_by"),
            "dismissed_reason": alert.alert.get("dismissed_reason"),
            "dismissed_comment": alert.alert.get("dismissed_comment"),
            "fixed_at": alert.alert.get("fixed_at"),
            "action": alert.action
        }
        
        # Create response for WebSocket broadcast
        response = SecurityAlertResponse(
            message=f"Security alert {alert.action} in {alert_data['repository']}",
            alert_id=str(alert_data["id"]),
            repository=alert_data["repository"],
            severity=alert_data["severity"],
            timestamp=alert_data["created_at"]
        )
        
        # Broadcast to all connected clients
        await manager.broadcast(response.json())
        
        logger.info(f"Security alert processed: {alert.action} for {alert_data['repository']}")
        
        return {"status": "success", "message": "Alert processed and broadcasted"}
        
    except Exception as e:
        logger.error(f"Error processing security alert: {e}")
        raise HTTPException(status_code=500, detail="Error processing alert")

@app.post("/webhook/github/test")
async def test_webhook():
    """
    Test endpoint to simulate a security alert
    """
    test_alert = {
        "message": "Test security alert",
        "alert_id": "test-123",
        "repository": "test/repository",
        "severity": "high",
        "timestamp": datetime.now().isoformat()
    }
    
    await manager.broadcast(json.dumps(test_alert))
    return {"status": "success", "message": "Test alert sent"}

# GitHub API functions
async def fetch_github_repositories(username: str) -> List[Dict[str, Any]]:
    """
    Fetch public repositories for a GitHub user
    """
    try:
        async with httpx.AsyncClient() as client:
            # Fetch public repositories
            response = await client.get(
                f"https://api.github.com/users/{username}/repos",
                params={
                    "type": "public",
                    "sort": "updated",
                    "per_page": 100
                },
                headers={
                    "Accept": "application/vnd.github.v3+json",
                    "User-Agent": "GitHub-Security-Alerts-Dashboard"
                }
            )
            
            logger.info(f"GitHub API response status: {response.status_code}")
            
            if response.status_code == 404:
                raise HTTPException(status_code=404, detail="GitHub user not found")
            elif response.status_code != 200:
                logger.error(f"GitHub API error: {response.status_code} - {response.text}")
                raise HTTPException(status_code=response.status_code, detail=f"GitHub API error: {response.status_code}")
            
            repos_data = response.json()
            logger.info(f"Found {len(repos_data)} repositories from GitHub API")
            
            repositories = []
            
            for repo in repos_data:
                if not repo.get("private", True):  # Only public repositories
                    repository = {
                        "id": repo["id"],
                        "name": repo["name"],
                        "full_name": repo["full_name"],
                        "description": repo.get("description"),
                        "private": repo.get("private", False),
                        "html_url": repo["html_url"],
                        "created_at": repo["created_at"],
                        "updated_at": repo["updated_at"],
                        "language": repo.get("language"),
                        "stargazers_count": repo.get("stargazers_count", 0),
                        "forks_count": repo.get("forks_count", 0)
                    }
                    repositories.append(repository)
            
            logger.info(f"Filtered to {len(repositories)} public repositories")
            return repositories
            
    except httpx.RequestError as e:
        logger.error(f"HTTP error fetching GitHub repositories: {e}")
        raise HTTPException(status_code=500, detail="Failed to connect to GitHub API")
    except Exception as e:
        logger.error(f"Unexpected error fetching repositories: {e}")
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

@app.get("/test")
async def test_endpoint():
    """
    Test endpoint to verify backend is working
    """
    return {"message": "Backend is working", "timestamp": datetime.now().isoformat()}

@app.get("/github/repositories/{username}")
async def get_github_repositories(username: str):
    """
    Fetch public repositories from GitHub for a user
    """
    try:
        logger.info(f"Fetching repositories for user: {username}")
        repositories = await fetch_github_repositories(username)
        logger.info(f"Successfully fetched {len(repositories)} repositories")
        return {
            "repositories": repositories,
            "total_count": len(repositories)
        }
    except HTTPException as e:
        logger.error(f"HTTPException for {username}: {e}")
        raise
    except Exception as e:
        logger.error(f"Error fetching GitHub repositories for {username}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch repositories: {str(e)}")

# Repository subscription models
class RepositorySubscription(BaseModel):
    username: str
    repository: str
    full_name: str

class SubscriptionRequest(BaseModel):
    username: str
    repositories: List[str]

# Store subscribed repositories
subscribed_repos: List[RepositorySubscription] = []

@app.get("/repositories")
async def get_subscribed_repositories():
    """
    Get all subscribed repositories
    """
    return {"repositories": subscribed_repos}

@app.post("/repositories/subscribe")
async def subscribe_to_repositories(request: SubscriptionRequest):
    """
    Subscribe to GitHub repositories for security alerts
    """
    try:
        new_repos = []
        for repo_name in request.repositories:
            full_name = f"{request.username}/{repo_name}"
            subscription = RepositorySubscription(
                username=request.username,
                repository=repo_name,
                full_name=full_name
            )
            if not any(r.full_name == full_name for r in subscribed_repos):
                subscribed_repos.append(subscription)
                new_repos.append(subscription)
        
        logger.info(f"Subscribed to {len(new_repos)} repositories for user {request.username}")
        return {
            "status": "success", 
            "message": f"Subscribed to {len(new_repos)} repositories",
            "repositories": [repo.dict() for repo in new_repos]
        }
    except Exception as e:
        logger.error(f"Error subscribing to repositories: {e}")
        raise HTTPException(status_code=500, detail="Error subscribing to repositories")

@app.delete("/repositories/{username}/{repository}")
async def unsubscribe_from_repository(username: str, repository: str):
    """
    Unsubscribe from a specific repository
    """
    try:
        full_name = f"{username}/{repository}"
        global subscribed_repos
        subscribed_repos = [repo for repo in subscribed_repos if repo.full_name != full_name]
        
        logger.info(f"Unsubscribed from {full_name}")
        return {"status": "success", "message": f"Unsubscribed from {full_name}"}
    except Exception as e:
        logger.error(f"Error unsubscribing from repository: {e}")
        raise HTTPException(status_code=500, detail="Error unsubscribing from repository")

@app.get("/repositories/{username}")
async def get_user_repositories(username: str):
    """
    Get repositories for a specific user
    """
    user_repos = [repo for repo in subscribed_repos if repo.username == username]
    return {"repositories": user_repos}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

