from flask import Blueprint, request, jsonify
from app.models import Class
from app.utils.helpers import success_response, error_response

classes_bp = Blueprint('classes', __name__)

@classes_bp.route('/', methods=['GET'])
def get_classes():
    """获取所有班级"""
    try:
        classes = Class.query.all()
        classes_data = [{
            'class_id': cls.class_id,
            'class_name': cls.class_name,
            'student_count': cls.student_count,
            'head_teacher_id': cls.head_teacher_id
        } for cls in classes]
        
        return success_response(classes_data)
        
    except Exception as e:
        return error_response(f'获取班级列表失败: {str(e)}')