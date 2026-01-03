from app.models import Student, Teacher, Admin  # 添加 Admin 导入
from app.utils.helpers import error_response

class AuthService:
    @staticmethod
    def authenticate_student(account, password):
        student = Student.query.filter_by(account=account).first()
        if student and student.check_password(password):
            return student
        return None
    
    @staticmethod
    def authenticate_teacher(account, password):
        teacher = Teacher.query.filter_by(account=account).first()
        if teacher and teacher.check_password(password):
            return teacher
        return None
    
    @staticmethod
    def register_student(student_data):
        # 检查账号是否已存在
        if Student.query.filter_by(account=student_data['account']).first():
            return None, "账号已存在"
        
        student = Student(
            student_id=student_data['student_id'],
            name=student_data['name'],
            account=student_data['account'],
            class_id=student_data.get('class_id')
        )
        student.set_password(student_data['password'])
        
        return student, None
    
    @staticmethod
    def register_teacher(teacher_data):
        # 检查账号是否已存在
        if Teacher.query.filter_by(account=teacher_data['account']).first():
            return None, "账号已存在"
        
        teacher = Teacher(
            teacher_id=teacher_data['teacher_id'],
            name=teacher_data['name'],
            account=teacher_data['account']
        )
        teacher.set_password(teacher_data['password'])
        
        return teacher, None
    @staticmethod
    def authenticate_admin(account, password):
        admin = Admin.query.filter_by(account=account).first()
        if admin and admin.check_password(password):
            return admin
        return None
    
    @staticmethod
    def register_admin(admin_data):
        # 检查账号是否已存在
        if Admin.query.filter_by(account=admin_data['account']).first():
            return None, "管理员账号已存在"
        
        admin = Admin(
            admin_id=admin_data['admin_id'],
            name=admin_data['name'],
            account=admin_data['account'],
            email=admin_data.get('email'),
            phone=admin_data.get('phone')
        )
        admin.set_password(admin_data['password'])
        
        return admin, None