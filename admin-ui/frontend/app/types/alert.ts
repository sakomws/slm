export interface SecurityAlert {
  alert_id: string
  repository: string
  package_name: string
  package_version: string
  severity: string
  summary: string
  description: string
  timestamp: string
  state: string
  html_url: string
  action: string
  alert_type: string
  package_info: {
    name: string
    ecosystem: string
  }
  sender: {
    login: string
    id: number
    type: string
  }
  organization: {
    login: string
    id: number
    type: string
  }
  full_alert: any
}