from flask_sqlalchemy import SQLAlchemy
from app import db

def init_db(app):
    """初始化数据库"""
    with app.app_context():
        db.create_all()