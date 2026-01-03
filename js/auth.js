// 认证逻辑 - 使用后端API
document.addEventListener('DOMContentLoaded', async function() {
    const loginForm = document.getElementById('loginForm');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // 检查登录状态并更新UI
    updateAuthUI();
    
    // 添加环境提示
    console.log('当前访问环境:', {
        hostname: window.location.hostname,
        protocol: window.location.protocol,
        href: window.location.href
    });
    
    if (loginForm && !loginForm.hasAttribute('data-login-bound')) {
        loginForm.setAttribute('data-login-bound', 'true');
        
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const role = document.getElementById('role').value;
            
            try {
                // 显示加载状态
                const submitBtn = loginForm.querySelector('button[type="submit"]');
                const originalText = submitBtn.textContent;
                submitBtn.textContent = '登录中...';
                submitBtn.disabled = true;
                
                console.log('开始登录流程...', { username, role });
                
                // 使用后端API登录
                const result = await authManager.login(username, password, role);
                console.log('登录结果:', result);
                
                if (result.success) {
                    console.log('登录成功，准备跳转...');
                    // 登录成功，跳转到对应页面
                    switch(role) {
                        case 'student':
                            window.location.href = 'student.html';
                            break;
                        case 'teacher':
                            window.location.href = 'teacher.html';
                            break;
                        case 'admin':
                            window.location.href = 'admin.html';
                            break;
                        default:
                            window.location.href = 'student.html';
                    }
                } else {
                    console.log('登录失败:', result.message);
                    alert(result.message || '账号或密码错误！');
                    // 恢复按钮状态
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                }
            } catch (error) {
                console.error('登录过程出错:', error);
                let errorMessage = '登录过程中发生错误，请重试。';
                
                // 提供更具体的错误信息
                if (error.message.includes('Failed to fetch') || error.message.includes('Network request failed')) {
                    errorMessage = `网络连接失败！\n\n当前环境: ${window.location.hostname}\n请检查：\n1. 后端服务是否运行在 localhost:5000\n2. 如果使用cpolar，请确认隧道已建立`;
                } else if (error.message.includes('HTTP error')) {
                    errorMessage = `服务器错误: ${error.message}`;
                }
                
                alert(errorMessage);
                // 恢复按钮状态
                const submitBtn = loginForm.querySelector('button[type="submit"]');
                submitBtn.textContent = '登录';
                submitBtn.disabled = false;
            }
        });
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            authManager.logout();
            window.location.href = 'index.html';
        });
    }
    
    // 检查登录状态，保护需要登录的页面
    const currentPath = window.location.pathname;
    const isLoginPage = currentPath.includes('index.html') || currentPath.endsWith('/');
    
    if (!authManager.isLoggedIn() && !isLoginPage) {
        console.log('未登录，跳转到登录页');
        window.location.href = 'index.html';
        return;
    }
    
    // 如果已登录且在登录页，重定向到对应角色页面
    if (authManager.isLoggedIn() && isLoginPage) {
        const user = authManager.getCurrentUser();
        console.log('已登录用户尝试访问登录页，跳转到:', user.user_type);
        switch(user.user_type) {
            case 'student':
                window.location.href = 'student.html';
                break;
            case 'teacher':
                window.location.href = 'teacher.html';
                break;
            case 'admin':
                window.location.href = 'admin.html';
                break;
        }
    }
});

// 更新认证相关的UI
function updateAuthUI() {
    const currentUser = authManager.getCurrentUser();
    const userInfoElements = document.querySelectorAll('.user-info');
    const logoutButtons = document.querySelectorAll('.logout-btn');
    
    if (currentUser) {
        // 显示用户信息
        userInfoElements.forEach(element => {
            element.textContent = `${currentUser.name} (${currentUser.user_type === 'student' ? '学生' : currentUser.user_type === 'teacher' ? '教师' : '管理员'})`;
        });
        
        // 显示登出按钮
        logoutButtons.forEach(button => {
            button.style.display = 'inline-block';
        });
        
        // 根据用户角色显示/隐藏菜单项
        updateMenuByRole(currentUser.user_type);
    } else {
        // 隐藏用户信息和登出按钮
        userInfoElements.forEach(element => {
            element.textContent = '';
        });
        
        logoutButtons.forEach(button => {
            button.style.display = 'none';
        });
    }
}

// 根据用户角色更新菜单
function updateMenuByRole(userType) {
    // 隐藏所有角色特定的菜单项
    const studentMenus = document.querySelectorAll('.student-menu');
    const teacherMenus = document.querySelectorAll('.teacher-menu');
    const adminMenus = document.querySelectorAll('.admin-menu');
    
    studentMenus.forEach(menu => menu.style.display = 'none');
    teacherMenus.forEach(menu => menu.style.display = 'none');
    adminMenus.forEach(menu => menu.style.display = 'none');
    
    // 显示对应角色的菜单
    switch(userType) {
        case 'student':
            studentMenus.forEach(menu => menu.style.display = 'block');
            break;
        case 'teacher':
            teacherMenus.forEach(menu => menu.style.display = 'block');
            break;
        case 'admin':
            adminMenus.forEach(menu => menu.style.display = 'block');
            break;
    }
}

// 路由保护中间件
function requireAuth(roles = []) {
    return function() {
        if (!authManager.isLoggedIn()) {
            window.location.href = 'index.html';
            return false;
        }
        
        const user = authManager.getCurrentUser();
        if (roles.length > 0 && !roles.includes(user.user_type)) {
            alert('无权访问此页面');
            window.location.href = getDefaultPageByRole(user.user_type);
            return false;
        }
        
        return true;
    };
}

// 根据角色获取默认页面
function getDefaultPageByRole(userType) {
    switch(userType) {
        case 'student': return 'student.html';
        case 'teacher': return 'teacher.html';
        case 'admin': return 'admin.html';
        default: return 'index.html';
    }
}