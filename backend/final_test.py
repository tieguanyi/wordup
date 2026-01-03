from app import create_app, db
from app.models import Student, Teacher, Word, Task, Class, WrongBook, Score
import requests
import json

app = create_app()

def final_system_test():
    base_url = "http://localhost:5000/api"
    
    print("🎯 WordUp 系统最终测试")
    print("=" * 50)
    
    tests_passed = 0
    tests_failed = 0
    
    # 测试健康检查
    try:
        response = requests.get(f"{base_url}/health")
        if response.status_code == 200:
            print("✅ 健康检查 API: 通过")
            tests_passed += 1
        else:
            print("❌ 健康检查 API: 失败")
            tests_failed += 1
    except Exception as e:
        print(f"❌ 健康检查 API: 错误 - {e}")
        tests_failed += 1
    
    # 测试单词 API
    try:
        response = requests.get(f"{base_url}/words/")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ 单词 API: 通过 (单词数: {len(data.get('data', []))})")
            tests_passed += 1
        else:
            print("❌ 单词 API: 失败")
            tests_failed += 1
    except Exception as e:
        print(f"❌ 单词 API: 错误 - {e}")
        tests_failed += 1
    
    # 测试用户 API
    try:
        response = requests.get(f"{base_url}/users/students")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ 学生 API: 通过 (学生数: {len(data.get('data', []))})")
            tests_passed += 1
        else:
            print("❌ 学生 API: 失败")
            tests_failed += 1
    except Exception as e:
        print(f"❌ 学生 API: 错误 - {e}")
        tests_failed += 1
    
    # 测试添加单词
    try:
        new_word = {
            "content": "final_test",
            "meaning": "最终测试",
            "speech": "n.",
            "is_wrong": False
        }
        response = requests.post(
            f"{base_url}/words/",
            json=new_word,
            headers={"Content-Type": "application/json"}
        )
        if response.status_code == 201:
            print("✅ 添加单词 API: 通过")
            tests_passed += 1
        else:
            print("❌ 添加单词 API: 失败")
            tests_failed += 1
    except Exception as e:
        print(f"❌ 添加单词 API: 错误 - {e}")
        tests_failed += 1
    
    print("=" * 50)
    print(f"测试结果: {tests_passed} 通过, {tests_failed} 失败")
    
    if tests_failed == 0:
        print("🎉 所有测试通过！WordUp 系统运行正常！")
        return True
    else:
        print("⚠️ 部分测试失败，请检查系统配置")
        return False

if __name__ == "__main__":
    with app.app_context():
        final_system_test()