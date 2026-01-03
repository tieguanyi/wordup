import json
from datetime import datetime

def json_serial(obj):
    """JSON序列化辅助函数"""
    if isinstance(obj, datetime):
        return obj.isoformat()
    raise TypeError(f"Type {type(obj)} not serializable")

def success_response(data=None, message="操作成功"):
    """成功响应格式"""
    return {
        'success': True,
        'message': message,
        'data': data
    }

def error_response(message="操作失败", code=400):
    """错误响应格式"""
    return {
        'success': False,
        'message': message,
        'code': code
    }, code