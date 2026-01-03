// API服务 - 连接Flask后端
class ApiService {
    constructor() {
        // 动态设置后端地址 - 支持本地开发和cpolar公网访问
        this.baseURL = this.getApiBaseUrl();
        this.token = localStorage.getItem('authToken');
        console.log('API服务初始化，后端地址:', this.baseURL);
    }

    // 获取API基础地址
    getApiBaseUrl() {
        const hostname = window.location.hostname;
        const isFileProtocol = window.location.protocol === 'file:';
        
        if (isFileProtocol) {
            // 直接打开HTML文件：使用localhost（开发环境）
            console.warn('检测到文件协议，使用localhost:5000作为后端地址');
            return 'http://localhost:5000/api';
        } else {
            // 其他所有情况（包括cpolar）：使用相对路径
            return '/api';
        }
    }

    // 设置认证token
    setToken(token) {
        this.token = token;
        localStorage.setItem('authToken', token);
    }

    // 通用请求方法
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
            },
            ...options
        };

        // 添加认证token
        if (this.token) {
            config.headers['Authorization'] = `Bearer ${this.token}`;
        }

        try {
            console.log(`发起API请求: ${url}`, config);
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('API请求失败:', error);
            console.error('请求URL:', url);
            console.error('错误详情:', error.message);
            
            // 提供更友好的错误信息
            let userMessage = '网络请求失败，请检查：\n';
            userMessage += '1. 后端服务是否运行 (localhost:5000)\n';
            userMessage += '2. 网络连接是否正常\n';
            userMessage += `3. 当前环境: ${window.location.hostname}`;
            
            throw new Error(userMessage);
        }
    }

    // 认证相关API
    async login(account, password, userType) {
        try {
            const data = await this.request('/auth/login', {
                method: 'POST',
                body: JSON.stringify({
                    account: account,
                    password: password,
                    user_type: userType
                })
            });
            
            if (data.success && data.data) {
                this.setToken(data.data.token || 'mock-token');
            }
            
            return data;
        } catch (error) {
            console.error('登录请求失败:', error);
            throw error;
        }
    }

    async logout() {
        const data = await this.request('/auth/logout', {
            method: 'POST'
        });
        localStorage.removeItem('authToken');
        return data;
    }

    async getCurrentUser() {
        return await this.request('/auth/me');
    }

    // 单词相关API
    async getWords() {
        const data = await this.request('/words/');
        return data.data || [];
    }

    async getWord(wordId) {
        const data = await this.request(`/words/${wordId}`);
        return data.data;
    }

    async addWord(wordData) {
        // 转换前端数据结构为后端期望的格式
        const backendWordData = {
            content: wordData.word,
            meaning: wordData.meanings ? wordData.meanings.map(m => `${m.partOfSpeech} ${m.meaning}`).join('; ') : '',
            speech: wordData.meanings && wordData.meanings[0] ? wordData.meanings[0].partOfSpeech : '',
            is_wrong: false
        };

        const data = await this.request('/words/', {
            method: 'POST',
            body: JSON.stringify(backendWordData)
        });
        return data.data;
    }

    async updateWord(wordId, wordData) {
        const backendWordData = {
            content: wordData.word,
            meaning: wordData.meanings ? wordData.meanings.map(m => `${m.partOfSpeech} ${m.meaning}`).join('; ') : '',
            speech: wordData.meanings && wordData.meanings[0] ? wordData.meanings[0].partOfSpeech : ''
        };

        const data = await this.request(`/words/${wordId}`, {
            method: 'PUT',
            body: JSON.stringify(backendWordData)
        });
        return data.data;
    }

    async deleteWord(wordId) {
        const data = await this.request(`/words/${wordId}`, {
            method: 'DELETE'
        });
        return data;
    }

    async searchWords(query) {
        const data = await this.request(`/words/search?q=${encodeURIComponent(query)}`);
        return data.data || [];
    }

    async batchImportWords(words) {
        const backendWords = words.map(word => ({
            content: word.word,
            meaning: word.meanings ? word.meanings.map(m => `${m.partOfSpeech} ${m.meaning}`).join('; ') : '',
            speech: word.meanings && word.meanings[0] ? word.meanings[0].partOfSpeech : '',
            is_wrong: false
        }));

        const data = await this.request('/words/batch', {
            method: 'POST',
            body: JSON.stringify({ words: backendWords })
        });
        return data.data;
    }

    // 用户相关API
    async getStudents() {
        const data = await this.request('/users/students');
        return data.data || [];
    }

    async getTeachers() {
        const data = await this.request('/users/teachers');
        return data.data || [];
    }

    // 班级相关API
    async getClasses() {
        const data = await this.request('/classes/');
        return data.data || [];
    }

    // 任务相关API
    async getTasks() {
        const data = await this.request('/tasks/');
        return data.data || [];
    }

    // 成绩相关API
    async getScores() {
        const data = await this.request('/scores/');
        return data.data || [];
    }
}

// 创建全局API服务实例
const apiService = new ApiService();