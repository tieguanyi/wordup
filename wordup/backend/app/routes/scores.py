from flask import Blueprint, request, jsonify
from app.models import Score
from app.utils.helpers import success_response, error_response

scores_bp = Blueprint('scores', __name__)

@ scores_bp.route('/', methods=['GET'])
def get_scores():
    """获取所有成绩"""
    try:
        scores = Score.query.all()
        scores_data = [{
            'score_id': score.score_id,
            'student_id': score.student_id,
            'task_id': score.task_id,
            'score': float(score.score) if score.score else None,
            'comment': score.comment
        } for score in scores]
        
        return success_response(scores_data)
        
    except Exception as e:
        return error_response(f'获取成绩列表失败: {str(e)}')