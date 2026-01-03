from app.models import Word, WrongBook
from app import db

class WordService:
    @staticmethod
    def get_all_words():
        return Word.query.all()
    
    @staticmethod
    def get_word_by_id(word_id):
        return Word.query.get(word_id)
    
    @staticmethod
    def add_word(word_data):
        word = Word(
            content=word_data['content'],
            meaning=word_data['meaning'],
            speech=word_data.get('speech'),
            is_wrong=word_data.get('is_wrong', False)
        )
        db.session.add(word)
        db.session.commit()
        return word
    
    @staticmethod
    def batch_import_words(words_data):
        imported_words = []
        for word_data in words_data:
            word = Word(
                content=word_data['content'],
                meaning=word_data['meaning'],
                speech=word_data.get('speech'),
                is_wrong=word_data.get('is_wrong', False)
            )
            db.session.add(word)
            imported_words.append(word)
        
        db.session.commit()
        return imported_words
    
    @staticmethod
    def update_word(word_id, word_data):
        word = Word.query.get(word_id)
        if not word:
            return None
        
        word.content = word_data.get('content', word.content)
        word.meaning = word_data.get('meaning', word.meaning)
        word.speech = word_data.get('speech', word.speech)
        word.is_wrong = word_data.get('is_wrong', word.is_wrong)
        
        db.session.commit()
        return word
    
    @staticmethod
    def delete_word(word_id):
        word = Word.query.get(word_id)
        if not word:
            return False
        
        db.session.delete(word)
        db.session.commit()
        return True