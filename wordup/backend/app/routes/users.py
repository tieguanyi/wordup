from flask import Blueprint, request, jsonify
from app.models import Student, Teacher, Admin
from app.utils.helpers import success_response, error_response
from app import db

users_bp = Blueprint('users', __name__)

@users_bp.route('/all', methods=['GET'])
def get_all_users():
    """获取所有用户（学生、教师、管理员）"""
    try:
        # 获取所有学生
        students = Student.query.all()
        student_list = [{
            'id': f"student_{s.student_id}",
            'user_id': s.student_id,
            'name': s.name,
            'account': s.account,
            'role': 'student',
            'class_id': s.class_id,
            'type': 'student'
        } for s in students]

        # 获取所有教师
        teachers = Teacher.query.all()
        teacher_list = [{
            'id': f"teacher_{t.teacher_id}",
            'user_id': t.teacher_id,
            'name': t.name,
            'account': t.account,
            'role': 'teacher',
            'type': 'teacher'
        } for t in teachers]

        # 获取所有管理员
        admins = Admin.query.all()
        admin_list = [{
            'id': f"admin_{a.admin_id}",
            'user_id': a.admin_id,
            'name': a.name,
            'account': a.account,
            'role': 'admin',
            'email': a.email,
            'phone': a.phone,
            'type': 'admin'
        } for a in admins]

        all_users = student_list + teacher_list + admin_list
        return success_response(all_users)

    except Exception as e:
        return error_response(f'获取用户列表失败: {str(e)}')

@users_bp.route('/create', methods=['POST'])
def create_user():
    """创建新用户"""
    try:
        data = request.json
        
        required_fields = ['user_type', 'account', 'password', 'name']
        for field in required_fields:
            if not data.get(field):
                return error_response(f'缺少必需字段: {field}')

        user_type = data['user_type']
        account = data['account']
        password = data['password']
        name = data['name']

        # 检查账号是否已存在
        if user_type == 'student':
            existing = Student.query.filter_by(account=account).first()
            user_id_field = 'student_id'
        elif user_type == 'teacher':
            existing = Teacher.query.filter_by(account=account).first()
            user_id_field = 'teacher_id'
        elif user_type == 'admin':
            existing = Admin.query.filter_by(account=account).first()
            user_id_field = 'admin_id'
        else:
            return error_response('无效的用户类型')

        if existing:
            return error_response('账号已存在')

        # 生成用户ID
        if user_type == 'student':
            last_student = Student.query.order_by(Student.student_id.desc()).first()
            new_id = f"student{int(last_student.student_id[6:]) + 1:03d}" if last_student else "student001"
            new_user = Student(
                student_id=new_id,
                name=name,
                account=account,
                class_id=data.get('class_id')
            )
        elif user_type == 'teacher':
            last_teacher = Teacher.query.order_by(Teacher.teacher_id.desc()).first()
            new_id = f"teacher{int(last_teacher.teacher_id[6:]) + 1:03d}" if last_teacher else "teacher001"
            new_user = Teacher(
                teacher_id=new_id,
                name=name,
                account=account
            )
        elif user_type == 'admin':
            last_admin = Admin.query.order_by(Admin.admin_id.desc()).first()
            new_id = f"admin{int(last_admin.admin_id[5:]) + 1:03d}" if last_admin else "admin001"
            new_user = Admin(
                admin_id=new_id,
                name=name,
                account=account,
                email=data.get('email'),
                phone=data.get('phone')
            )

        new_user.set_password(password)
        db.session.add(new_user)
        db.session.commit()

        return success_response({'user_id': new_id}, '用户创建成功')

    except Exception as e:
        db.session.rollback()
        return error_response(f'创建用户失败: {str(e)}')

@users_bp.route('/<user_type>/<user_id>', methods=['DELETE'])
def delete_user(user_type, user_id):
    """删除用户"""
    try:
        if user_type == 'student':
            user = Student.query.get(user_id)
        elif user_type == 'teacher':
            user = Teacher.query.get(user_id)
        elif user_type == 'admin':
            user = Admin.query.get(user_id)
        else:
            return error_response('无效的用户类型')

        if not user:
            return error_response('用户不存在')

        db.session.delete(user)
        db.session.commit()

        return success_response(None, '用户删除成功')

    except Exception as e:
        db.session.rollback()
        return error_response(f'删除用户失败: {str(e)}')

@users_bp.route('/<user_type>/<user_id>', methods=['PUT'])
def update_user(user_type, user_id):
    """更新用户信息"""
    try:
        data = request.json
        
        if user_type == 'student':
            user = Student.query.get(user_id)
        elif user_type == 'teacher':
            user = Teacher.query.get(user_id)
        elif user_type == 'admin':
            user = Admin.query.get(user_id)
        else:
            return error_response('无效的用户类型')

        if not user:
            return error_response('用户不存在')

        # 更新字段
        if 'name' in data:
            user.name = data['name']
        if 'email' in data and hasattr(user, 'email'):
            user.email = data['email']
        if 'phone' in data and hasattr(user, 'phone'):
            user.phone = data['phone']
        if 'class_id' in data and hasattr(user, 'class_id'):
            user.class_id = data['class_id']
        if 'password' in data and data['password']:
            user.set_password(data['password'])

        db.session.commit()

        return success_response(None, '用户更新成功')

    except Exception as e:
        db.session.rollback()
        return error_response(f'更新用户失败: {str(e)}')