from flask import Blueprint, request, jsonify
from app.models import Word
from app.services.word_service import WordService
from app.utils.helpers import success_response, error_response

words_bp = Blueprint('words', __name__)

@words_bp.route('/', methods=['GET'])
def get_words():
    """获取所有单词"""
    try:
        words = WordService.get_all_words()
        words_data = [{
            'word_id': word.word_id,
            'content': word.content,
            'meaning': word.meaning,
            'speech': word.speech,
            'is_wrong': word.is_wrong
        } for word in words]
        
        return success_response(words_data)
        
    except Exception as e:
        return error_response(f'获取单词列表失败: {str(e)}')

@words_bp.route('/<int:word_id>', methods=['GET'])
def get_word(word_id):
    """获取单个单词详情"""
    try:
        word = WordService.get_word_by_id(word_id)
        if not word:
            return error_response('单词不存在', 404)
        
        word_data = {
            'word_id': word.word_id,
            'content': word.content,
            'meaning': word.meaning,
            'speech': word.speech,
            'is_wrong': word.is_wrong
        }
        
        return success_response(word_data)
        
    except Exception as e:
        return error_response(f'获取单词失败: {str(e)}')

@words_bp.route('/', methods=['POST'])
def add_word():
    """添加新单词"""
    data = request.json
    
    required_fields = ['content', 'meaning']
    for field in required_fields:
        if not data.get(field):
            return error_response(f'缺少必需字段: {field}')
    
    try:
        word = WordService.add_word(data)
        word_data = {
            'word_id': word.word_id,
            'content': word.content,
            'meaning': word.meaning,
            'speech': word.speech,
            'is_wrong': word.is_wrong
        }
        
        return success_response(word_data, '单词添加成功')
        
    except Exception as e:
        return error_response(f'添加单词失败: {str(e)}')

@words_bp.route('/batch', methods=['POST'])
def batch_import():
    """批量导入单词"""
    data = request.json
    
    if not data or not data.get('words'):
        return error_response('缺少单词数据')
    
    try:
        imported_words = WordService.batch_import_words(data['words'])
        
        return success_response({
            'count': len(imported_words)
        }, f'成功导入 {len(imported_words)} 个单词')
        
    except Exception as e:
        return error_response(f'批量导入失败: {str(e)}')

@words_bp.route('/<int:word_id>', methods=['PUT'])
def update_word(word_id):
    """更新单词"""
    data = request.json
    
    try:
        word = WordService.update_word(word_id, data)
        if not word:
            return error_response('单词不存在', 404)
        
        word_data = {
            'word_id': word.word_id,
            'content': word.content,
            'meaning': word.meaning,
            'speech': word.speech,
            'is_wrong': word.is_wrong
        }
        
        return success_response(word_data, '单词更新成功')
        
    except Exception as e:
        return error_response(f'更新单词失败: {str(e)}')

@words_bp.route('/<int:word_id>', methods=['DELETE'])
def delete_word(word_id):
    """删除单词"""
    try:
        success = WordService.delete_word(word_id)
        if not success:
            return error_response('单词不存在', 404)
        
        return success_response(None, '单词删除成功')
        
    except Exception as e:
        return error_response(f'删除单词失败: {str(e)}')

@words_bp.route('/search', methods=['GET'])
def search_words():
    """搜索单词"""
    keyword = request.args.get('q', '')
    
    if not keyword:
        return error_response('请输入搜索关键词')
    
    try:
        words = Word.query.filter(
            Word.content.contains(keyword) | 
            Word.meaning.contains(keyword)
        ).all()
        
        words_data = [{
            'word_id': word.word_id,
            'content': word.content,
            'meaning': word.meaning,
            'speech': word.speech,
            'is_wrong': word.is_wrong
        } for word in words]
        
        return success_response(words_data)
        
    except Exception as e:
        return error_response(f'搜索失败: {str(e)}')