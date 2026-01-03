import requests

BASE_URL = "http://localhost:5000/api"

# 测试所有API端点
endpoints = [
    "/health",
    "/auth/login",
    "/auth/me", 
    "/auth/logout",
    "/words/",
    "/words/search?q=test",
    "/users/students",
    "/users/teachers",
    "/classes/",
    "/tasks/",
    "/scores/"
]

print("🔍 测试API端点连接性...")
for endpoint in endpoints:
    url = BASE_URL + endpoint
    try:
        if endpoint == "/auth/login":
            # 登录需要POST请求
            response = requests.post(url, json={
                "account": "testadmin", 
                "password": "123456", 
                "user_type": "admin"
            })
        else:
            response = requests.get(url)
        
        print(f"{endpoint}: {response.status_code} - {'✅' if response.status_code == 200 else '❌'}")
        if response.status_code != 200:
            print(f"   错误: {response.text}")
    except Exception as e:
        print(f"{endpoint}: ❌ 连接失败 - {e}")

print("\n📊 测试完成")