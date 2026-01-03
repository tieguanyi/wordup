from flask import Flask, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from config import config
import os

db = SQLAlchemy()

def create_app(config_name='default'):
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    # 初始化扩展
    db.init_app(app)
    CORS(app)  # 允许前端跨域访问
    
    # 获取前端文件目录的绝对路径（D:\wordup）
    frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
    
    # 服务首页
    @app.route('/')
    def serve_index():
        return send_from_directory(frontend_dir, 'index.html')
    
    # 服务其他HTML页面
    @app.route('/<string:page_name>.html')
    def serve_html_pages(page_name):
        return send_from_directory(frontend_dir, f'{page_name}.html')
    
    # 服务CSS文件
    @app.route('/css/<path:filename>')
    def serve_css(filename):
        return send_from_directory(os.path.join(frontend_dir, 'css'), filename)
    
    # 服务JS文件
    @app.route('/js/<path:filename>')
    def serve_js(filename):
        return send_from_directory(os.path.join(frontend_dir, 'js'), filename)
    
    # 添加健康检查路由
    @app.route('/api/health')
    def health_check():
        return jsonify({'status': 'healthy', 'message': 'WordUp API is running'})
    
    # 注册蓝图
    from .routes.auth import auth_bp
    from .routes.words import words_bp
    from .routes.users import users_bp
    from .routes.classes import classes_bp
    from .routes.tasks import tasks_bp
    from .routes.scores import scores_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(words_bp, url_prefix='/api/words')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(classes_bp, url_prefix='/api/classes')
    app.register_blueprint(tasks_bp, url_prefix='/api/tasks')
    app.register_blueprint(scores_bp, url_prefix='/api/scores')
    
    # 创建数据库表
    with app.app_context():
        db.create_all()
    
    return app