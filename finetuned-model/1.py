import requests

# Your API endpoint
API_URL = "http://44.248.185.227:8000/scan"

def scan_code(code_snippet):
    response = requests.post(API_URL, json={'code': code_snippet})
    return response.json()['analysis']

# Test it
result = scan_code('aws_key = "AKIAIOSFODNN7EXAMPLE"')
print(result)