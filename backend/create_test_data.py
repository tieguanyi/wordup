from app import create_app, db
from app.models import Student, Teacher, Word, Task, Class,Admin
from datetime import datetime, timedelta

app = create_app()

def create_test_data():
    with app.app_context():
        print("📝 创建测试数据...")
        
        try:
            # 创建测试班级
            if Class.query.count() == 0:
                test_class = Class(
                    class_id="class001",
                    class_name="测试班级",
                    student_count=0,
                    head_teacher_id=None
                )
                db.session.add(test_class)
                print("✅ 创建测试班级")
            
            # 创建测试教师
            if Teacher.query.count() == 0:
                test_teacher = Teacher(
                    teacher_id="teacher001",
                    name="测试教师",
                    account="testteacher",
                    password="123456"
                )
                test_teacher.set_password("123456")
                db.session.add(test_teacher)
                print("✅ 创建测试教师")
            
            # 创建测试学生
            if Student.query.count() == 0:
                test_student = Student(
                    student_id="student001",
                    name="测试学生",
                    account="teststudent", 
                    password="123456",
                    class_id="class001"
                )
                test_student.set_password("123456")
                db.session.add(test_student)
                print("✅ 创建测试学生")
            
            # 创建测试单词
            if Word.query.count() == 0:
                test_words = [
                    Word(content="abandon", meaning="放弃，遗弃", speech="v.", is_wrong=False),
                    Word(content="ability", meaning="能力，才能", speech="n.", is_wrong=False),
                    Word(content="abnormal", meaning="反常的，异常的", speech="adj.", is_wrong=False),
                ]
                for word in test_words:
                    db.session.add(word)
                print("✅ 创建测试单词")
            
            # 创建测试任务
            if Task.query.count() == 0:
                start_time = datetime.now()
                end_time = start_time + timedelta(days=7)
                test_task = Task(
                    task_name="第一周单词测试",
                    description="测试四级核心词汇掌握情况",
                    start_time=start_time,
                    end_time=end_time
                )
                db.session.add(test_task)
                print("✅ 创建测试任务")
            if Admin.query.count() == 0:
                test_admin = Admin(
                admin_id="admin001",
                name="系统管理员",
                account="admin",
                email="admin@wordup.com",
                phone="13800138000"
                )
                test_admin.set_password("123456")
                db.session.add(test_admin)
            print("✅ 创建测试管理员")
            
            db.session.commit()
            print("🎉 测试数据创建完成！")
            
        except Exception as e:
            db.session.rollback()
            print(f"❌ 创建测试数据失败: {e}")

if __name__ == '__main__':
    create_test_data()