from flask import Blueprint, request, jsonify, session
from app.models import Student, Teacher, Admin
from app.services.auth_service import AuthService
from app.utils.helpers import success_response, error_response
from app import db

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    """用户登录"""
    data = request.json
    
    if not data or not data.get('account') or not data.get('password'):
        return error_response('账号和密码不能为空')
    
    account = data['account']
    password = data['password']
    user_type = data.get('user_type', 'student')  # student, teacher 或 admin
    
    try:
        if user_type == 'student':
            user = AuthService.authenticate_student(account, password)
            user_info = {
                'user_id': user.student_id,
                'name': user.name,
                'account': user.account,
                'user_type': 'student',
                'class_id': user.class_id
            } if user else None
        elif user_type == 'teacher':
            user = AuthService.authenticate_teacher(account, password)
            user_info = {
                'user_id': user.teacher_id,
                'name': user.name,
                'account': user.account,
                'user_type': 'teacher'
            } if user else None
        elif user_type == 'admin':
            user = AuthService.authenticate_admin(account, password)
            user_info = {
                'user_id': user.admin_id,
                'name': user.name,
                'account': user.account,
                'user_type': 'admin',
                'email': user.email,
                'phone': user.phone
            } if user else None
        else:
            return error_response('无效的用户类型')
        
        if user:
            # 存储用户信息到session
            session['user_id'] = user_info['user_id']
            session['user_type'] = user_type
            session['user_name'] = user_info['name']
            
            return success_response(user_info, '登录成功')
        else:
            return error_response('账号或密码错误', 401)
            
    except Exception as e:
        return error_response(f'登录失败: {str(e)}')

@auth_bp.route('/register/student', methods=['POST'])
def register_student():
    """学生注册"""
    data = request.json
    
    required_fields = ['student_id', 'name', 'account', 'password']
    for field in required_fields:
        if not data.get(field):
            return error_response(f'缺少必需字段: {field}')
    
    try:
        student, error_msg = AuthService.register_student(data)
        if error_msg:
            return error_response(error_msg)
        
        db.session.add(student)
        db.session.commit()
        
        user_info = {
            'user_id': student.student_id,
            'name': student.name,
            'account': student.account,
            'user_type': 'student',
            'class_id': student.class_id
        }
        
        return success_response(user_info, '注册成功')
        
    except Exception as e:
        db.session.rollback()
        return error_response(f'注册失败: {str(e)}')

@auth_bp.route('/register/teacher', methods=['POST'])
def register_teacher():
    """教师注册"""
    data = request.json
    
    required_fields = ['teacher_id', 'name', 'account', 'password']
    for field in required_fields:
        if not data.get(field):
            return error_response(f'缺少必需字段: {field}')
    
    try:
        teacher, error_msg = AuthService.register_teacher(data)
        if error_msg:
            return error_response(error_msg)
        
        db.session.add(teacher)
        db.session.commit()
        
        user_info = {
            'user_id': teacher.teacher_id,
            'name': teacher.name,
            'account': teacher.account,
            'user_type': 'teacher'
        }
        
        return success_response(user_info, '注册成功')
        
    except Exception as e:
        db.session.rollback()
        return error_response(f'注册失败: {str(e)}')

@auth_bp.route('/register/admin', methods=['POST'])
def register_admin():
    """管理员注册"""
    data = request.json
    
    required_fields = ['admin_id', 'name', 'account', 'password']
    for field in required_fields:
        if not data.get(field):
            return error_response(f'缺少必需字段: {field}')
    
    try:
        admin, error_msg = AuthService.register_admin(data)
        if error_msg:
            return error_response(error_msg)
        
        db.session.add(admin)
        db.session.commit()
        
        user_info = {
            'user_id': admin.admin_id,
            'name': admin.name,
            'account': admin.account,
            'user_type': 'admin',
            'email': admin.email,
            'phone': admin.phone
        }
        
        return success_response(user_info, '管理员注册成功')
        
    except Exception as e:
        db.session.rollback()
        return error_response(f'注册失败: {str(e)}')

@auth_bp.route('/logout', methods=['POST'])
def logout():
    """用户登出"""
    session.clear()
    return success_response(None, '登出成功')

@auth_bp.route('/me', methods=['GET'])
def get_current_user():
    """获取当前用户信息"""
    user_id = session.get('user_id')
    user_type = session.get('user_type')
    
    if not user_id or not user_type:
        return error_response('未登录', 401)
    
    try:
        if user_type == 'student':
            user = Student.query.get(user_id)
            if not user:
                return error_response('学生用户不存在', 404)
            user_info = {
                'user_id': user.student_id,
                'name': user.name,
                'account': user.account,
                'user_type': 'student',
                'class_id': user.class_id
            }
        elif user_type == 'teacher':
            user = Teacher.query.get(user_id)
            if not user:
                return error_response('教师用户不存在', 404)
            user_info = {
                'user_id': user.teacher_id,
                'name': user.name,
                'account': user.account,
                'user_type': 'teacher'
            }
        elif user_type == 'admin':
            user = Admin.query.get(user_id)
            if not user:
                return error_response('管理员用户不存在', 404)
            user_info = {
                'user_id': user.admin_id,
                'name': user.name,
                'account': user.account,
                'user_type': 'admin',
                'email': user.email,
                'phone': user.phone
            }
        else:
            return error_response('无效的用户类型', 400)
        
        return success_response(user_info)
    except Exception as e:
        return error_response(f'获取用户信息失败: {str(e)}')