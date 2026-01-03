from app import create_app, db
from app.models import Student, Teacher, Word, Task, Class, WrongBook, Score
from datetime import datetime

app = create_app()

def get_system_status():
    with app.app_context():
        status = {
            'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'database': {
                'students': Student.query.count(),
                'teachers': Teacher.query.count(),
                'words': Word.query.count(),
                'tasks': Task.query.count(),
                'classes': Class.query.count(),
                'wrong_books': WrongBook.query.count(),
                'scores': Score.query.count()
            },
            'system': {
                'status': 'healthy',
                'uptime': 'running',
                'version': '1.0.0'
            }
        }
        return status

def print_status_report():
    status = get_system_status()
    
    print("📊 WordUp 系统状态报告")
    print("=" * 50)
    print(f"时间: {status['timestamp']}")
    print(f"系统状态: {status['system']['status']}")
    print(f"版本: {status['system']['version']}")
    print("\n📈 数据统计:")
    print(f"  学生: {status['database']['students']} 人")
    print(f"  教师: {status['database']['teachers']} 人")
    print(f"  单词: {status['database']['words']} 个")
    print(f"  任务: {status['database']['tasks']} 个")
    print(f"  班级: {status['database']['classes']} 个")
    print(f"  错题本: {status['database']['wrong_books']} 个")
    print(f"  成绩记录: {status['database']['scores']} 条")
    print("=" * 50)
    
    # 检查系统健康状态
    if status['database']['words'] > 0 and status['database']['students'] > 0:
        print("🎉 系统运行正常，数据完整")
    else:
        print("⚠️ 系统数据不完整，请检查")

if __name__ == '__main__':
    print_status_report()