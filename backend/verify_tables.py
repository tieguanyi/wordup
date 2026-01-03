from app import create_app, db
from app.models import Student, Teacher, Word, Task, Class, WrongBook, Score

app = create_app()

def verify_table_compatibility():
    with app.app_context():
        print("🔍 验证表结构兼容性...")
        
        models = [
            ('Student', Student),
            ('Teacher', Teacher), 
            ('Word', Word),
            ('Task', Task),
            ('Class', Class),
            ('WrongBook', WrongBook),
            ('Score', Score)
        ]
        
        all_passed = True
        
        for name, model in models:
            try:
                # 尝试查询
                count = model.query.count()
                print(f"✅ {name}: 兼容 (记录数: {count})")
            except Exception as e:
                print(f"❌ {name}: 不兼容 - {e}")
                all_passed = False
        
        if all_passed:
            print("\n🎉 所有表结构兼容性验证通过！")
        else:
            print("\n⚠️ 部分表结构不兼容，需要调整模型")
        
        return all_passed

if __name__ == '__main__':
    verify_table_compatibility()