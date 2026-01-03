// 认证管理器 - 处理用户登录状态
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        // 从localStorage恢复用户状态
        const userData = localStorage.getItem('currentUser');
        if (userData) {
            try {
                this.currentUser = JSON.parse(userData);
            } catch (e) {
                console.error('解析用户数据失败:', e);
                localStorage.removeItem('currentUser');
            }
        }
    }

    // 登录 - 修复登录逻辑
    async login(account, password, userType) {
        try {
            console.log('开始登录:', { account, userType });
        
            // 调用API服务
            const result = await apiService.login(account, password, userType);
            console.log('登录API返回:', result);
        
            if (result.success && result.data) {
                this.currentUser = result.data;
                localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                console.log('登录成功，用户信息:', this.currentUser);
                return { success: true, user: this.currentUser };
            } else {
                console.log('登录失败:', result.message);
                return { 
                    success: false, 
                    message: result.message || '登录失败，请检查账号密码' 
                };
            }
        } catch (error) {
            console.error('登录过程出错:', error);
            return { 
                success: false, 
                message: error.message || '网络错误，请检查后端服务是否运行' 
            };
        }
    }

    // 登出
    async logout() {
        try {
            // 尝试调用后端登出API
            await apiService.logout();
        } catch (error) {
            console.error('登出API调用失败:', error);
            // 即使API调用失败，也要清除本地状态
        } finally {
            this.currentUser = null;
            localStorage.removeItem('currentUser');
            localStorage.removeItem('authToken');
            console.log('用户已登出');
        }
    }

    // 检查登录状态
    isLoggedIn() {
        return this.currentUser !== null;
    }

    // 获取当前用户
    getCurrentUser() {
        return this.currentUser;
    }

    // 检查用户角色
    isStudent() {
        return this.currentUser && this.currentUser.user_type === 'student';
    }

    isTeacher() {
        return this.currentUser && this.currentUser.user_type === 'teacher';
    }

    isAdmin() {
        return this.currentUser && this.currentUser.user_type === 'admin';
    }

    // 需要登录的页面检查
    requireAuth(redirectUrl = 'index.html') {
        if (!this.isLoggedIn()) {
            window.location.href = redirectUrl;
            return false;
        }
        return true;
    }

    // 需要特定角色的检查
    requireRole(role, redirectUrl = 'index.html') {
        if (!this.isLoggedIn()) {
            window.location.href = redirectUrl;
            return false;
        }

        const hasRole = {
            'student': this.isStudent(),
            'teacher': this.isTeacher(),
            'admin': this.isAdmin()
        }[role];

        if (!hasRole) {
            alert('无权访问此页面');
            window.location.href = redirectUrl;
            return false;
        }

        return true;
    }
}

// 创建全局认证管理器实例
const authManager = new AuthManager();