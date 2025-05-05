import requests
import os
import datetime

def send_heartbeat():
    # Get the API URL from environment variable or use default
    api_url = os.environ.get("HEARTBEAT_URL", "https://budgetbuddybackend-64v6.onrender.com/api/health")
    
    try:
        print(f"{datetime.datetime.now()} - Sending heartbeat to {api_url}")
        response = requests.get(api_url)
        
        if response.status_code == 200:
            print(f"{datetime.datetime.now()} - Heartbeat sent successfully")
            print(f"Response: {response.json()}")
            return True
        else:
            print(f"{datetime.datetime.now()} - Failed to send heartbeat, status code: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"{datetime.datetime.now()} - Error sending heartbeat: {e}")
        return False

if __name__ == "__main__":
    send_heartbeat()    