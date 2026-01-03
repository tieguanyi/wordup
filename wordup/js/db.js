// 数据库管理 - 使用IndexedDB
class WordUpDB {
    constructor() {
        this.dbName = 'WordUpDB';
        this.version = 1;
        this.db = null;
    }

    // 初始化数据库
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // 创建用户表
                if (!db.objectStoreNames.contains('users')) {
                    const userStore = db.createObjectStore('users', { keyPath: 'id', autoIncrement: true });
                    userStore.createIndex('username', 'username', { unique: true });
                    userStore.createIndex('role', 'role', { unique: false });
                }

                // 创建词库表
                if (!db.objectStoreNames.contains('wordbooks')) {
                    const wordbookStore = db.createObjectStore('wordbooks', { keyPath: 'id', autoIncrement: true });
                    wordbookStore.createIndex('name', 'name', { unique: true });
                }

                // 创建单词表
                if (!db.objectStoreNames.contains('words')) {
                    const wordStore = db.createObjectStore('words', { keyPath: 'id', autoIncrement: true });
                    wordStore.createIndex('wordbookId', 'wordbookId', { unique: false });
                    wordStore.createIndex('word', 'word', { unique: false });
                    wordStore.createIndex('difficulty', 'difficulty', { unique: false });
                }

                // 创建任务表
                if (!db.objectStoreNames.contains('tasks')) {
                    const taskStore = db.createObjectStore('tasks', { keyPath: 'id', autoIncrement: true });
                    taskStore.createIndex('teacherId', 'teacherId', { unique: false });
                    taskStore.createIndex('status', 'status', { unique: false });
                }

                // 创建学生进度表
                if (!db.objectStoreNames.contains('studentProgress')) {
                    const progressStore = db.createObjectStore('studentProgress', { keyPath: 'id', autoIncrement: true });
                    progressStore.createIndex('studentId', 'studentId', { unique: false });
                    progressStore.createIndex('taskId', 'taskId', { unique: false });
                    progressStore.createIndex('student_task', ['studentId', 'taskId'], { unique: true });
                }

                // 创建错题表
                if (!db.objectStoreNames.contains('wrongWords')) {
                    const wrongStore = db.createObjectStore('wrongWords', { keyPath: 'id', autoIncrement: true });
                    wrongStore.createIndex('studentId', 'studentId', { unique: false });
                    wrongStore.createIndex('wordId', 'wordId', { unique: false });
                    wrongStore.createIndex('student_word', ['studentId', 'wordId'], { unique: true });
                }
            };
        });
    }

    // 通用添加方法
    async add(storeName, data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.add(data);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // 通用获取所有方法
    async getAll(storeName, indexName = null, keyRange = null) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const target = indexName ? store.index(indexName) : store;
            const request = target.getAll(keyRange);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // 通用获取单个方法
    async get(storeName, key) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(key);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // 通用更新方法
    async update(storeName, data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(data);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // 通用删除方法
    async delete(storeName, key) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(key);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // 通用查询方法
    async query(storeName, indexName, key) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const index = store.index(indexName);
            const request = index.get(key);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // 用户相关方法
    async addUser(userData) {
        return this.add('users', {
            ...userData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
    }

    async getUserByUsername(username) {
        return this.query('users', 'username', username);
    }

    async getAllUsers() {
        return this.getAll('users');
    }

    async updateUser(userId, userData) {
        const user = await this.get('users', userId);
        return this.update('users', {
            ...user,
            ...userData,
            updatedAt: new Date().toISOString()
        });
    }

    // 词库相关方法
    async addWordbook(wordbookData) {
        return this.add('wordbooks', {
            ...wordbookData,
            createdAt: new Date().toISOString(),
            wordCount: 0
        });
    }

    async getAllWordbooks() {
        return this.getAll('wordbooks');
    }

    async updateWordbook(wordbookId, wordbookData) {
        const wordbook = await this.get('wordbooks', wordbookId);
        return this.update('wordbooks', {
            ...wordbook,
            ...wordbookData,
            updatedAt: new Date().toISOString()
        });
    }

    // 单词相关方法
    async addWord(wordData) {
        const word = await this.add('words', {
            ...wordData,
            createdAt: new Date().toISOString()
        });

        // 更新词库的单词计数
        const wordbook = await this.get('wordbooks', wordData.wordbookId);
        await this.update('wordbooks', {
            ...wordbook,
            wordCount: (wordbook.wordCount || 0) + 1,
            updatedAt: new Date().toISOString()
        });

        return word;
    }

    async getWordsByWordbook(wordbookId) {
        return this.getAll('words', 'wordbookId', wordbookId);
    }

    async updateWord(wordId, wordData) {
        const word = await this.get('words', wordId);
        return this.update('words', {
            ...word,
            ...wordData,
            updatedAt: new Date().toISOString()
        });
    }

    async deleteWord(wordId) {
        const word = await this.get('words', wordId);
        await this.delete('words', wordId);

        // 更新词库的单词计数
        const wordbook = await this.get('wordbooks', word.wordbookId);
        await this.update('wordbooks', {
            ...wordbook,
            wordCount: Math.max(0, (wordbook.wordCount || 0) - 1),
            updatedAt: new Date().toISOString()
        });
    }

    async searchWords(query) {
        const allWords = await this.getAll('words');
        const searchTerm = query.toLowerCase();
        
        return allWords.filter(word => 
            word.word.toLowerCase().includes(searchTerm) ||
            word.phonetic?.toLowerCase().includes(searchTerm) ||
            word.meanings?.some(meaning => 
                meaning.meaning.toLowerCase().includes(searchTerm)
            )
        );
    }

    // 初始化默认数据
    async initDefaultData() {
        // 检查是否已经初始化
        const wordbooks = await this.getAllWordbooks();
        if (wordbooks.length > 0) return;

        // 创建默认词库
        const cet4 = await this.addWordbook({
            name: '四级核心词汇',
            description: '大学英语四级考试核心词汇',
            type: 'cet4'
        });

        const cet6 = await this.addWordbook({
            name: '六级核心词汇', 
            description: '大学英语六级考试核心词汇',
            type: 'cet6'
        });

        // 添加默认单词
        const defaultWords = [
            {
                wordbookId: cet4,
                word: 'abandon',
                phonetic: '/əˈbændən/',
                difficulty: 'medium',
                meanings: [
                    { partOfSpeech: 'v.', meaning: '放弃，遗弃' },
                    { partOfSpeech: 'n.', meaning: '放纵，放任' }
                ],
                examples: [
                    { english: 'He abandoned his car and ran away.', chinese: '他弃车逃跑了。' }
                ],
                related: ['abandoned', 'abandonment', 'forsake']
            },
            {
                wordbookId: cet4,
                word: 'ability',
                phonetic: '/əˈbɪləti/',
                difficulty: 'easy',
                meanings: [
                    { partOfSpeech: 'n.', meaning: '能力，才能' }
                ],
                examples: [
                    { english: 'She has the ability to speak three languages.', chinese: '她有说三种语言的能力。' }
                ],
                related: ['able', 'capability', 'skill']
            },
            {
                wordbookId: cet6,
                word: 'abbreviation',
                phonetic: '/əˌbriːviˈeɪʃn/',
                difficulty: 'hard',
                meanings: [
                    { partOfSpeech: 'n.', meaning: '缩写，缩写词' }
                ],
                examples: [
                    { english: 'UN is the abbreviation for United Nations.', chinese: 'UN是联合国的缩写。' }
                ],
                related: ['abbreviate', 'acronym', 'short form']
            }
        ];

        for (const wordData of defaultWords) {
            await this.addWord(wordData);
        }

        // 创建默认管理员用户
        await this.addUser({
            username: 'admin1',
            password: '123', // 实际应用中应该加密
            role: 'admin',
            email: 'admin@wordup.com',
            fullName: '系统管理员'
        });

        // 创建默认教师用户
        await this.addUser({
            username: 'teacher1',
            password: '123',
            role: 'teacher',
            email: 'teacher@wordup.com',
            fullName: '张老师'
        });

        // 创建默认学生用户
        await this.addUser({
            username: 'student1',
            password: '123',
            role: 'student',
            email: 'student@wordup.com',
            fullName: '李同学',
            class: '计算机1班'
        });
    }
}

// 创建全局数据库实例
const wordUpDB = new WordUpDB();

// 初始化数据库
wordUpDB.init().then(() => {
    console.log('数据库初始化成功');
    return wordUpDB.initDefaultData();
}).then(() => {
    console.log('默认数据初始化成功');
}).catch(error => {
    console.error('数据库初始化失败:', error);
});