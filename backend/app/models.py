from app import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

class Student(db.Model):
    __tablename__ = 'student'
    
    student_id = db.Column(db.String(20), primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    account = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    class_id = db.Column(db.String(20), db.ForeignKey('class.class_id'))
    
    # 关系
    scores = db.relationship('Score', backref='student', lazy=True)
    wrong_books = db.relationship('WrongBook', backref='student', lazy=True)
    
    def set_password(self, password):
        self.password = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password, password)

class Teacher(db.Model):
    __tablename__ = 'teacher'
    
    teacher_id = db.Column(db.String(20), primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    account = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    
    # 关系
    classes = db.relationship('Class', backref='head_teacher', lazy=True)
    
    def set_password(self, password):
        self.password = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password, password)

class Word(db.Model):
    __tablename__ = 'word'
    
    word_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    content = db.Column(db.String(100), nullable=False)
    meaning = db.Column(db.Text, nullable=False)
    speech = db.Column(db.String(20))
    is_wrong = db.Column(db.Boolean)  # 注意：MySQL中的tinyint(1)映射为Boolean

class Task(db.Model):
    __tablename__ = 'task'
    
    task_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    task_name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=False)
    
    # 关系
    scores = db.relationship('Score', backref='task', lazy=True)

class Class(db.Model):
    __tablename__ = 'class'
    
    class_id = db.Column(db.String(20), primary_key=True)
    class_name = db.Column(db.String(100), nullable=False)
    student_count = db.Column(db.Integer)
    head_teacher_id = db.Column(db.String(20), db.ForeignKey('teacher.teacher_id'))
    
    # 关系
    students = db.relationship('Student', backref='class_info', lazy=True)

class WrongBook(db.Model):
    __tablename__ = 'wrong_book'
    
    book_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    student_id = db.Column(db.String(20), db.ForeignKey('student.student_id'), nullable=False)
    word_count = db.Column(db.Integer)
    create_time = db.Column(db.DateTime)

class Score(db.Model):
    __tablename__ = 'score'
    
    score_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    student_id = db.Column(db.String(20), db.ForeignKey('student.student_id'), nullable=False)
    task_id = db.Column(db.Integer, db.ForeignKey('task.task_id'), nullable=False)
    score = db.Column(db.Numeric(5, 2))
    comment = db.Column(db.String(255))
class Admin(db.Model):
    __tablename__ = 'admin'
    
    admin_id = db.Column(db.String(20), primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    account = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(100))
    phone = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())
    
    def set_password(self, password):
        self.password = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password, password)