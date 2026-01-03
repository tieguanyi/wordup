from flask import Blueprint, request, jsonify
from app.models import Task
from app.utils.helpers import success_response, error_response

tasks_bp = Blueprint('tasks', __name__)

@tasks_bp.route('/', methods=['GET'])
def get_tasks():
    """获取所有任务"""
    try:
        tasks = Task.query.all()
        tasks_data = [{
            'task_id': task.task_id,
            'task_name': task.task_name,
            'description': task.description,
            'start_time': task.start_time.isoformat() if task.start_time else None,
            'end_time': task.end_time.isoformat() if task.end_time else None
        } for task in tasks]
        
        return success_response(tasks_data)
        
    except Exception as e:
        return error_response(f'获取任务列表失败: {str(e)}')