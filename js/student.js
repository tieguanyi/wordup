// 学生页面基础逻辑 - 使用后端API
document.addEventListener('DOMContentLoaded', async function() {
    // 页面元素
    const logoutBtn = document.getElementById('logoutBtn');
    const pendingTasksCount = document.getElementById('pendingTasksCount');
    const taskCompletionRate = document.getElementById('taskCompletionRate');
    const recentTasks = document.getElementById('recentTasks');

    // 初始化应用
    async function initializeApp() {
        try {
            console.log('初始化学生页面...');
            
            // 检查认证
            if (!authManager.isLoggedIn()) {
                window.location.href = 'index.html';
                return;
            }

            // 检查用户角色
            if (!authManager.isStudent()) {
                alert('无权访问学生页面');
                window.location.href = authManager.isTeacher() ? 'teacher.html' : 'admin.html';
                return;
            }

            initEventListeners();
            await initDisplay();
            
            console.log('学生页面初始化完成');
        } catch (error) {
            console.error('初始化失败:', error);
            alert('页面初始化失败: ' + error.message);
        }
    }

    // 初始化事件监听
    function initEventListeners() {
        // 退出登录
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function() {
                if (confirm('确定要退出登录吗？')) {
                    authManager.logout();
                    window.location.href = 'index.html';
                }
            });
        }
    }

    // 初始化显示
    async function initDisplay() {
        // 更新任务统计
        await updateTaskStats();
        
        // 更新学习数据
        await updateLearningStats();
    }

    // 更新任务统计
    async function updateTaskStats() {
        try {
            const tasks = await getStudentTasks();
            const pendingTasks = tasks.filter(task => 
                task.status === 'not_started' || task.status === 'in_progress'
            ).length;
            const completedTasks = tasks.filter(task => task.status === 'completed').length;
            const completionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
            
            if (pendingTasksCount) pendingTasksCount.textContent = pendingTasks;
            if (taskCompletionRate) taskCompletionRate.textContent = `${completionRate}%`;
            
            // 更新近期任务列表
            updateRecentTasks(tasks);
        } catch (error) {
            console.error('更新任务统计失败:', error);
        }
    }

    // 获取学生任务 - 从后端API获取
    async function getStudentTasks() {
        try {
            // 从后端获取任务
            const tasks = await apiService.getTasks();
            console.log('从后端获取的任务:', tasks);
            
            // 转换数据格式并添加学生进度信息
            const studentTasks = tasks.map(task => {
                // 这里需要根据实际业务逻辑计算学生进度
                // 目前使用模拟数据
                const progress = Math.floor(Math.random() * 100);
                let status = 'not_started';
                
                if (progress === 0) {
                    status = 'not_started';
                } else if (progress > 0 && progress < 100) {
                    status = 'in_progress';
                } else if (progress === 100) {
                    status = 'completed';
                }

                // 检查任务是否逾期
                const now = new Date();
                const endTime = new Date(task.end_time);
                if (status !== 'completed' && now > endTime) {
                    status = 'overdue';
                }

                return {
                    id: task.task_id,
                    name: task.task_name,
                    description: task.description,
                    startTime: task.start_time,
                    endTime: task.end_time,
                    status: status,
                    progress: progress,
                    score: null,
                    startedAt: null,
                    completedAt: null,
                    isOverdue: now > endTime
                };
            });

            return studentTasks;
        } catch (error) {
            console.error('获取学生任务失败:', error);
            // 返回空数组而不是抛出错误，避免页面完全崩溃
            return [];
        }
    }

    // 更新近期任务列表
    function updateRecentTasks(tasks) {
        if (!recentTasks) return;

        const recentTasksList = tasks
            .sort((a, b) => new Date(a.endTime) - new Date(b.endTime))
            .slice(0, 3); // 只显示最近3个任务
        
        if (recentTasksList.length === 0) {
            recentTasks.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📋</div>
                    <p>暂无任务</p>
                    <p>等待老师发布新任务</p>
                </div>
            `;
            return;
        }
        
        recentTasks.innerHTML = recentTasksList.map(task => {
            const progressPercent = task.progress || 0;
            
            return `
                <div class="task-item" onclick="location.href='tasks.html'">
                    <div class="task-header">
                        <div class="task-name">${task.name}</div>
                        <span class="task-status status-${task.status}">${getStatusText(task.status)}</span>
                    </div>
                    <div class="task-time">截止: ${formatDate(task.endTime)}</div>
                    ${task.status !== 'completed' ? `
                        <div class="task-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${progressPercent}%"></div>
                            </div>
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');
    }

    // 更新学习统计
    async function updateLearningStats() {
        try {
            // 从后端获取学习统计信息
            // 目前使用模拟数据，后续可以添加专门的学习统计API
            const learningStats = {
                weeklyDays: 5,
                weeklyWords: 87,
                streakDays: 12,
                wrongWords: 23
            };
            
            // 更新显示
            document.querySelectorAll('.learning-stats .stat-value').forEach((element, index) => {
                const values = Object.values(learningStats);
                if (values[index] !== undefined) {
                    element.textContent = values[index];
                }
            });
        } catch (error) {
            console.error('更新学习统计失败:', error);
        }
    }

    // 工具函数
    function getStatusText(status) {
        const statusMap = {
            'not_started': '未开始',
            'in_progress': '进行中',
            'completed': '已完成',
            'overdue': '已逾期'
        };
        return statusMap[status] || status;
    }

    function formatDate(dateString) {
        if (!dateString) return '未知时间';
        
        const date = new Date(dateString);
        const now = new Date();
        const timeDiff = date - now;
        const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

        if (daysDiff < 0) {
            return `逾期 ${Math.abs(daysDiff)} 天`;
        } else if (daysDiff === 0) {
            return '今天截止';
        } else if (daysDiff === 1) {
            return '明天截止';
        } else {
            return `${daysDiff} 天后截止`;
        }
    }

    // 启动应用
    await initializeApp();
    
    // 定期更新数据（每5分钟）
    setInterval(async () => {
        await updateTaskStats();
    }, 300000);
});