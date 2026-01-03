// 用户管理页面功能逻辑 - 使用后端API
document.addEventListener('DOMContentLoaded', async function() {
    // 页面元素
    const backBtn = document.getElementById('backBtn');
    const addUserBtn = document.getElementById('addUser');
    const addFirstUserBtn = document.getElementById('addFirstUser');
    const closeModalBtn = document.getElementById('closeModal');
    const cancelEditBtn = document.getElementById('cancelEdit');
    const saveUserBtn = document.getElementById('saveUser');
    const userModal = document.getElementById('userModal');
    const userForm = document.getElementById('userForm');
    const userTypeSelect = document.getElementById('userTypeSelect');
    const classField = document.getElementById('classField');
    const userIdField = document.getElementById('userIdField');
    
    // 搜索和过滤元素
    const searchUser = document.getElementById('searchUser');
    const searchBtn = document.getElementById('searchBtn');
    const roleFilter = document.getElementById('roleFilter');
    
    // 统计元素
    const totalUsers = document.getElementById('totalUsers');
    const adminCount = document.getElementById('adminCount');
    const teacherCount = document.getElementById('teacherCount');
    const studentCount = document.getElementById('studentCount');
    const listCount = document.getElementById('listCount');
    
    // 容器
    const usersContainer = document.getElementById('usersContainer');
    const emptyState = document.getElementById('emptyState');

    // 状态变量
    let currentEditingUser = null;
    let allUsers = [];

    // 初始化应用
    async function initializeApp() {
        try {
            console.log('初始化用户管理页面...');
            
            // 检查认证
            if (!authManager.isLoggedIn()) {
                window.location.href = 'index.html';
                return;
            }

            // 检查用户角色
            if (!authManager.isAdmin()) {
                alert('无权访问用户管理页面');
                window.location.href = authManager.isStudent() ? 'student.html' : 'teacher.html';
                return;
            }

            initEventListeners();
            await loadUsers();
            
            console.log('用户管理页面初始化完成');
        } catch (error) {
            console.error('初始化失败:', error);
            alert('页面初始化失败: ' + error.message);
        }
    }

    // 初始化事件监听 - 添加防重复绑定
    function initEventListeners() {
        // 返回按钮
        if (backBtn && !backBtn.hasAttribute('data-bound')) {
            backBtn.setAttribute('data-bound', 'true');
            backBtn.addEventListener('click', function() {
                window.location.href = 'admin.html';
            });
        }

        // 添加用户按钮
        if (addUserBtn && !addUserBtn.hasAttribute('data-bound')) {
            addUserBtn.setAttribute('data-bound', 'true');
            addUserBtn.addEventListener('click', showAddUserModal);
        }

        // 添加第一个用户按钮
        if (addFirstUserBtn && !addFirstUserBtn.hasAttribute('data-bound')) {
            addFirstUserBtn.setAttribute('data-bound', 'true');
            addFirstUserBtn.addEventListener('click', showAddUserModal);
        }

        // 模态框关闭按钮
        if (closeModalBtn && !closeModalBtn.hasAttribute('data-bound')) {
            closeModalBtn.setAttribute('data-bound', 'true');
            closeModalBtn.addEventListener('click', hideUserModal);
        }

        // 取消按钮
        if (cancelEditBtn && !cancelEditBtn.hasAttribute('data-bound')) {
            cancelEditBtn.setAttribute('data-bound', 'true');
            cancelEditBtn.addEventListener('click', hideUserModal);
        }

        // 保存用户按钮
        if (saveUserBtn && !saveUserBtn.hasAttribute('data-bound')) {
            saveUserBtn.setAttribute('data-bound', 'true');
            saveUserBtn.addEventListener('click', saveUser);
        }

        // 用户类型选择变化
        if (userTypeSelect && !userTypeSelect.hasAttribute('data-bound')) {
            userTypeSelect.setAttribute('data-bound', 'true');
            userTypeSelect.addEventListener('change', toggleFieldsByUserType);
        }

        // 搜索功能
        if (searchBtn && !searchBtn.hasAttribute('data-bound')) {
            searchBtn.setAttribute('data-bound', 'true');
            searchBtn.addEventListener('click', performSearch);
        }

        if (searchUser && !searchUser.hasAttribute('data-bound')) {
            searchUser.setAttribute('data-bound', 'true');
            searchUser.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') performSearch();
            });
        }

        // 角色过滤
        if (roleFilter && !roleFilter.hasAttribute('data-bound')) {
            roleFilter.setAttribute('data-bound', 'true');
            roleFilter.addEventListener('change', filterUsers);
        }

        // 点击模态框背景关闭
        if (userModal && !userModal.hasAttribute('data-bound')) {
            userModal.setAttribute('data-bound', 'true');
            userModal.addEventListener('click', function(e) {
                if (e.target === userModal) {
                    hideUserModal();
                }
            });
        }
    }

    // 显示添加用户模态框
    function showAddUserModal() {
        console.log('显示添加用户模态框');
        currentEditingUser = null;
        document.getElementById('modalTitle').textContent = '添加用户';
        
        // 重置表单
        userForm.reset();
        userIdField.style.display = 'none';
        document.getElementById('passwordInput').required = true;
        document.getElementById('passwordHint').textContent = '设置用户登录密码';
        
        toggleFieldsByUserType();
        showModal();
    }

    // 显示编辑用户模态框
    function showEditUserModal(user) {
        console.log('显示编辑用户模态框:', user);
        currentEditingUser = user;
        document.getElementById('modalTitle').textContent = '编辑用户';
        
        // 填充表单
        document.getElementById('userIdInput').value = user.user_id || '';
        document.getElementById('userTypeSelect').value = user.type || user.role;
        document.getElementById('accountInput').value = user.account || '';
        document.getElementById('nameInput').value = user.name || '';
        document.getElementById('emailInput').value = user.email || '';
        document.getElementById('phoneInput').value = user.phone || '';
        
        // 对于学生，显示班级
        if ((user.type === 'student' || user.role === 'student') && user.class_id) {
            document.getElementById('classInput').value = user.class_id;
        }
        
        // 编辑模式下显示用户ID字段，密码可选
        userIdField.style.display = 'block';
        document.getElementById('passwordInput').required = false;
        document.getElementById('passwordHint').textContent = '留空则不修改密码';
        
        toggleFieldsByUserType();
        showModal();
    }

    // 根据用户类型切换字段显示
    function toggleFieldsByUserType() {
        const userType = document.getElementById('userTypeSelect').value;
        
        if (classField) {
            classField.style.display = userType === 'student' ? 'block' : 'none';
        }
    }

    // 显示模态框
    function showModal() {
        console.log('显示模态框');
        if (userModal) {
            userModal.classList.remove('hidden');
            userModal.style.display = 'flex';
        }
    }

    // 隐藏模态框
    function hideUserModal() {
        console.log('隐藏模态框');
        if (userModal) {
            userModal.classList.add('hidden');
            userModal.style.display = 'none';
            currentEditingUser = null;
            userForm.reset();
        }
    }

    // 保存用户
    async function saveUser() {
        try {
            const formData = {
                user_type: document.getElementById('userTypeSelect').value,
                account: document.getElementById('accountInput').value.trim(),
                password: document.getElementById('passwordInput').value,
                name: document.getElementById('nameInput').value.trim(),
                email: document.getElementById('emailInput').value.trim(),
                phone: document.getElementById('phoneInput').value.trim(),
                class_id: document.getElementById('classInput').value.trim()
            };

            // 验证必填字段
            if (!formData.account || !formData.name) {
                alert('账号和姓名为必填项');
                return;
            }

            // 如果是创建用户，密码是必需的
            if (!currentEditingUser && !formData.password) {
                alert('创建用户时密码为必填项');
                return;
            }

            let result;
            if (currentEditingUser) {
                // 编辑现有用户
                const userType = currentEditingUser.type || currentEditingUser.role;
                const userId = currentEditingUser.user_id;
                
                // 构建更新数据
                const updateData = {
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone
                };
                
                // 只有学生有班级字段
                if (userType === 'student') {
                    updateData.class_id = formData.class_id;
                }
                
                // 如果密码不为空，则更新密码
                if (formData.password) {
                    updateData.password = formData.password;
                }

                result = await apiService.request(`/users/${userType}/${userId}`, {
                    method: 'PUT',
                    body: JSON.stringify(updateData)
                });
            } else {
                // 创建新用户
                result = await apiService.request('/users/create', {
                    method: 'POST',
                    body: JSON.stringify(formData)
                });
            }

            if (result.success) {
                alert(currentEditingUser ? '用户更新成功' : '用户创建成功');
                hideUserModal();
                await loadUsers(); // 重新加载用户列表
            } else {
                alert('操作失败: ' + result.message);
            }

        } catch (error) {
            console.error('保存用户失败:', error);
            alert('保存用户时发生错误: ' + error.message);
        }
    }

    // 加载用户数据 - 使用真实API
    async function loadUsers() {
        try {
            console.log('从后端加载用户数据...');
            
            // 调用后端API获取所有用户
            const response = await apiService.request('/users/all');
            
            if (response.success) {
                allUsers = response.data || [];
                console.log('获取到的用户数据:', allUsers);
                displayUsers(allUsers);
                updateStatistics(allUsers);
            } else {
                throw new Error(response.message || '获取用户数据失败');
            }

        } catch (error) {
            console.error('加载用户数据失败:', error);
            alert('加载用户数据失败: ' + error.message);
            // 降级方案：使用空数组
            allUsers = [];
            displayUsers(allUsers);
            updateStatistics(allUsers);
        }
    }

    // 显示用户列表
    function displayUsers(users) {
        if (!usersContainer) return;

        if (users.length === 0) {
            usersContainer.innerHTML = '';
            if (emptyState) emptyState.classList.remove('hidden');
            return;
        }

        if (emptyState) emptyState.classList.add('hidden');

        usersContainer.innerHTML = users.map(user => `
            <div class="user-item" data-user-id="${user.id}">
                <div class="user-info">
                    <div class="user-name">
                        ${user.name}
                        <span class="user-role role-${user.role}">
                            ${user.role === 'admin' ? '管理员' : user.role === 'teacher' ? '教师' : '学生'}
                        </span>
                    </div>
                    <div class="user-details">
                        <span>账号: ${user.account}</span>
                        <span>用户ID: ${user.user_id}</span>
                        ${user.email ? `<span>邮箱: ${user.email}</span>` : ''}
                        ${user.phone ? `<span>电话: ${user.phone}</span>` : ''}
                        ${user.class_id ? `<span>班级: ${user.class_id}</span>` : ''}
                    </div>
                </div>
                <div class="user-actions">
                    <button class="small-btn edit-user" data-user-id="${user.id}">编辑</button>
                    <button class="small-btn danger-btn delete-user" data-user-id="${user.id}">删除</button>
                </div>
            </div>
        `).join('');

        // 绑定编辑和删除按钮事件
        bindUserActionEvents();
    }

    // 绑定用户操作事件
    function bindUserActionEvents() {
        // 编辑按钮
        document.querySelectorAll('.edit-user').forEach(btn => {
            if (!btn.hasAttribute('data-bound')) {
                btn.setAttribute('data-bound', 'true');
                btn.addEventListener('click', function() {
                    const userId = this.getAttribute('data-user-id');
                    const user = allUsers.find(u => u.id == userId);
                    if (user) {
                        showEditUserModal(user);
                    }
                });
            }
        });

        // 删除按钮
        document.querySelectorAll('.delete-user').forEach(btn => {
            if (!btn.hasAttribute('data-bound')) {
                btn.setAttribute('data-bound', 'true');
                btn.addEventListener('click', function() {
                    const userId = this.getAttribute('data-user-id');
                    const user = allUsers.find(u => u.id == userId);
                    if (user) {
                        deleteUser(user);
                    }
                });
            }
        });
    }

    // 删除用户
    async function deleteUser(user) {
        try {
            const userType = user.type || user.role;
            const userRealId = user.user_id;

            if (confirm(`确定要删除用户 "${user.name}" 吗？此操作不可恢复！`)) {
                const result = await apiService.request(`/users/${userType}/${userRealId}`, {
                    method: 'DELETE'
                });

                if (result.success) {
                    alert('用户删除成功');
                    await loadUsers(); // 重新加载用户列表
                } else {
                    alert('删除失败: ' + result.message);
                }
            }
        } catch (error) {
            console.error('删除用户失败:', error);
            alert('删除用户失败: ' + error.message);
        }
    }

    // 更新统计信息
    function updateStatistics(users) {
        if (!users) return;

        const total = users.length;
        const admins = users.filter(u => u.role === 'admin').length;
        const teachers = users.filter(u => u.role === 'teacher').length;
        const students = users.filter(u => u.role === 'student').length;

        if (totalUsers) totalUsers.textContent = total;
        if (adminCount) adminCount.textContent = admins;
        if (teacherCount) teacherCount.textContent = teachers;
        if (studentCount) studentCount.textContent = students;
        if (listCount) listCount.textContent = total;
    }

    // 执行搜索
    function performSearch() {
        const searchTerm = searchUser.value.toLowerCase().trim();
        if (!searchTerm) {
            displayUsers(allUsers);
            return;
        }

        const filteredUsers = allUsers.filter(user => 
            user.name.toLowerCase().includes(searchTerm) ||
            user.account.toLowerCase().includes(searchTerm) ||
            user.user_id.toLowerCase().includes(searchTerm) ||
            (user.email && user.email.toLowerCase().includes(searchTerm)) ||
            (user.class_id && user.class_id.toLowerCase().includes(searchTerm))
        );

        displayUsers(filteredUsers);
    }

    // 过滤用户
    function filterUsers() {
        const role = roleFilter.value;
        if (role === 'all') {
            displayUsers(allUsers);
        } else {
            const filteredUsers = allUsers.filter(user => user.role === role);
            displayUsers(filteredUsers);
        }
    }

    // 启动应用
    await initializeApp();
});