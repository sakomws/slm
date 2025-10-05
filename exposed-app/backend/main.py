from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import boto3
from botocore.exceptions import ClientError, NoCredentialsError
import logging
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="AWS EC2 Instances API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class EC2Instance(BaseModel):
    instance_id: str
    instance_type: str
    state: str
    public_ip: Optional[str] = None
    private_ip: Optional[str] = None
    launch_time: Optional[str] = None
    tags: Dict[str, str] = {}
    security_groups: List[str] = []
    vpc_id: Optional[str] = None
    subnet_id: Optional[str] = None
    availability_zone: Optional[str] = None

class EC2Response(BaseModel):
    instances: List[EC2Instance]
    total_count: int
    region: str

class AWSConfig(BaseModel):
    region: str = "us-east-1"

class EC2ListResponse(BaseModel):
    instances: List[EC2Instance]
    total_count: int
    region: str
    access_key_used: str
    timestamp: str

# Global variable to store AWS session
aws_session = None

def get_ec2_client_from_env(region: str = "us-west-2"):
    """Create and return an EC2 client using environment variables"""
    try:
        access_key_id = os.getenv('AWS_ACCESS_KEY_ID')
        secret_access_key = os.getenv('AWS_SECRET_ACCESS_KEY')
        
        if not access_key_id or not secret_access_key:
            raise HTTPException(
                status_code=400, 
                detail="AWS credentials not found in environment variables. Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in .env file"
            )
        
        session = boto3.Session(
            aws_access_key_id=access_key_id,
            aws_secret_access_key=secret_access_key,
            region_name=region
        )
        return session.client('ec2'), access_key_id
    except Exception as e:
        logger.error(f"Error creating EC2 client: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create AWS session: {str(e)}")

@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "AWS EC2 Instances API", "status": "running"}

@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/ec2/instances")
async def list_ec2_instances(config: AWSConfig):
    """
    List EC2 instances using AWS credentials from environment variables
    """
    try:
        logger.info(f"Listing EC2 instances in region: {config.region}")
        
        # Create EC2 client using environment variables
        ec2_client, access_key_used = get_ec2_client_from_env(config.region)
        
        # Describe instances
        response = ec2_client.describe_instances()
        
        instances = []
        
        for reservation in response['Reservations']:
            for instance in reservation['Instances']:
                # Extract tags
                tags = {}
                if 'Tags' in instance:
                    for tag in instance['Tags']:
                        tags[tag['Key']] = tag['Value']
                
                # Extract security groups
                security_groups = []
                if 'SecurityGroups' in instance:
                    for sg in instance['SecurityGroups']:
                        security_groups.append(sg['GroupName'])
                
                # Create instance object
                ec2_instance = EC2Instance(
                    instance_id=instance['InstanceId'],
                    instance_type=instance['InstanceType'],
                    state=instance['State']['Name'],
                    public_ip=instance.get('PublicIpAddress'),
                    private_ip=instance.get('PrivateIpAddress'),
                    launch_time=instance.get('LaunchTime').isoformat() if instance.get('LaunchTime') else None,
                    tags=tags,
                    security_groups=security_groups,
                    vpc_id=instance.get('VpcId'),
                    subnet_id=instance.get('SubnetId'),
                    availability_zone=instance.get('Placement', {}).get('AvailabilityZone')
                )
                instances.append(ec2_instance)
        
        logger.info(f"Found {len(instances)} EC2 instances using access key: {access_key_used[:10]}...")
        
        return EC2ListResponse(
            instances=instances,
            total_count=len(instances),
            region=config.region,
            access_key_used=access_key_used,
            timestamp=datetime.now().isoformat()
        )
        
    except NoCredentialsError:
        logger.error("AWS credentials not found")
        raise HTTPException(status_code=401, detail="AWS credentials not found or invalid")
    except ClientError as e:
        error_code = e.response['Error']['Code']
        error_message = e.response['Error']['Message']
        logger.error(f"AWS ClientError: {error_code} - {error_message}")
        
        if error_code == 'InvalidUserID.NotFound':
            raise HTTPException(status_code=401, detail="Invalid AWS credentials")
        elif error_code == 'UnauthorizedOperation':
            raise HTTPException(status_code=403, detail="Insufficient permissions to access EC2")
        else:
            raise HTTPException(status_code=500, detail=f"AWS Error: {error_message}")
    except Exception as e:
        logger.error(f"Unexpected error listing EC2 instances: {e}")
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

@app.get("/ec2/regions")
async def list_aws_regions():
    """
    List available AWS regions
    """
    regions = [
        {"code": "us-east-1", "name": "US East (N. Virginia)"},
        {"code": "us-east-2", "name": "US East (Ohio)"},
        {"code": "us-west-1", "name": "US West (N. California)"},
        {"code": "us-west-2", "name": "US West (Oregon)"},
        {"code": "eu-west-1", "name": "Europe (Ireland)"},
        {"code": "eu-west-2", "name": "Europe (London)"},
        {"code": "eu-central-1", "name": "Europe (Frankfurt)"},
        {"code": "ap-southeast-1", "name": "Asia Pacific (Singapore)"},
        {"code": "ap-southeast-2", "name": "Asia Pacific (Sydney)"},
        {"code": "ap-northeast-1", "name": "Asia Pacific (Tokyo)"},
        {"code": "ca-central-1", "name": "Canada (Central)"},
        {"code": "sa-east-1", "name": "South America (São Paulo)"}
    ]
    return {"regions": regions}

@app.get("/ec2/test-credentials")
async def test_aws_credentials():
    """
    Test AWS credentials and permissions
    """
    try:
        # Test if credentials are loaded
        access_key_id = os.getenv('AWS_ACCESS_KEY_ID')
        secret_access_key = os.getenv('AWS_SECRET_ACCESS_KEY')
        
        if not access_key_id or not secret_access_key:
            return {
                "status": "error",
                "message": "AWS credentials not found in environment variables",
                "access_key_id": "Not set" if not access_key_id else f"{access_key_id[:10]}...",
                "secret_access_key": "Not set" if not secret_access_key else "Set"
            }
        
        # Test basic AWS connection
        session = boto3.Session(
            aws_access_key_id=access_key_id,
            aws_secret_access_key=secret_access_key,
            region_name='us-east-1'
        )
        
        # Test with STS to get caller identity
        sts_client = session.client('sts')
        identity = sts_client.get_caller_identity()
        
        # Test EC2 permissions
        ec2_client = session.client('ec2', region_name='us-east-1')
        
        # Try to list instances (this will fail if no permissions)
        try:
            response = ec2_client.describe_instances()
            instance_count = sum(len(reservation['Instances']) for reservation in response['Reservations'])
            
            return {
                "status": "success",
                "message": "AWS credentials are valid and have EC2 permissions",
                "access_key_id": f"{access_key_id[:10]}...",
                "user_arn": identity.get('Arn', 'Unknown'),
                "user_id": identity.get('UserId', 'Unknown'),
                "account_id": identity.get('Account', 'Unknown'),
                "ec2_instances_found": instance_count,
                "region": "us-east-1"
            }
        except ClientError as e:
            error_code = e.response['Error']['Code']
            error_message = e.response['Error']['Message']
            
            return {
                "status": "error",
                "message": f"EC2 access denied: {error_message}",
                "error_code": error_code,
                "access_key_id": f"{access_key_id[:10]}...",
                "user_arn": identity.get('Arn', 'Unknown'),
                "user_id": identity.get('UserId', 'Unknown'),
                "account_id": identity.get('Account', 'Unknown'),
                "suggestion": "Add EC2 read permissions to your IAM user"
            }
            
    except Exception as e:
        logger.error(f"Error testing AWS credentials: {e}")
        return {
            "status": "error",
            "message": f"Failed to test credentials: {str(e)}",
            "access_key_id": "Unknown",
            "suggestion": "Check your AWS credentials and IAM permissions"
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
