export interface EC2Instance {
  instance_id: string
  instance_type: string
  state: string
  public_ip?: string
  private_ip?: string
  launch_time?: string
  tags: Record<string, string>
  security_groups: string[]
  vpc_id?: string
  subnet_id?: string
  availability_zone?: string
}

export interface EC2ListResponse {
  instances: EC2Instance[]
  total_count: number
  region: string
  access_key_used: string
  timestamp: string
}

export interface AWSConfig {
  region: string
}

export interface AWSRegion {
  code: string
  name: string
}
