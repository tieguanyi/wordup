from app import create_app

app = create_app()

if __name__ == '__main__':
    print("启动 WordUp 后端服务...")
    print("API地址: http://localhost:5000")
    print("API文档:")
    print("  - 认证: http://localhost:5000/api/auth/")
    print("  - 单词: http://localhost:5000/api/words/")
    print("  - 用户: http://localhost:5000/api/users/")
    print("  - 班级: http://localhost:5000/api/classes/")
    print("  - 任务: http://localhost:5000/api/tasks/")
    print("  - 成绩: http://localhost:5000/api/scores/")
    
    app.run(debug=True, host='0.0.0.0', port=5000)