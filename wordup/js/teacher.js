// 老师页面功能逻辑 - 使用后端API
document.addEventListener('DOMContentLoaded', async function() {
    // 页面元素
    const logoutBtn = document.getElementById('logoutBtn');
    const teacherName = document.getElementById('teacherName');
    
    // 统计元素
    const activeTasks = document.getElementById('activeTasks');
    const totalTasks = document.getElementById('totalTasks');
    const studentParticipation = document.getElementById('studentParticipation');
    const averageCompletion = document.getElementById('averageCompletion');
    
    // 列表元素
    const recentTasks = document.getElementById('recentTasks');
    const classesOverview = document.getElementById('classesOverview');
    const activityList = document.getElementById('activityList');

    // 初始化应用
    async function initializeApp() {
        try {
            console.log('初始化教师页面...');
            
            // 检查认证
            if (!authManager.isLoggedIn()) {
                window.location.href = 'index.html';
                return;
            }

            // 检查用户角色
            if (!authManager.isTeacher()) {
                alert('无权访问教师页面');
                window.location.href = authManager.isStudent() ? 'student.html' : 'admin.html';
                return;
            }

            initEventListeners();
            await initDisplay();
            
            console.log('教师页面初始化完成');
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

        // 页面加载时更新数据
        window.addEventListener('load', updateDashboard);
    }

    // 初始化显示
    async function initDisplay() {
        // 显示教师姓名
        const currentUser = authManager.getCurrentUser();
        if (currentUser && teacherName) {
            teacherName.textContent = `欢迎，${currentUser.name}老师`;
        }

        await updateDashboard();
    }

    // 更新仪表板
    async function updateDashboard() {
        await updateStatistics();
        await updateRecentTasks();
        await updateClassesOverview();
        updateActivityList(); // 活动列表暂时使用模拟数据
    }

    // 更新统计信息
    async function updateStatistics() {
        try {
            const tasks = await apiService.getTasks();
            const now = new Date();
            
            // 进行中任务
            const activeTasksCount = tasks.filter(task => {
                const startTime = new Date(task.start_time);
                const endTime = new Date(task.end_time);
                return startTime <= now && endTime >= now;
            }).length;
            
            // 总任务数
            const totalTasksCount = tasks.length;
            
            // 计算学生参与率和平均完成率（模拟数据）
            // 注意：这些数据需要后端提供专门的统计API
            const participationRate = calculateParticipationRate(tasks);
            const avgCompletionRate = calculateAverageCompletionRate(tasks);
            
            // 更新显示
            if (activeTasks) activeTasks.textContent = activeTasksCount;
            if (totalTasks) totalTasks.textContent = totalTasksCount;
            if (studentParticipation) studentParticipation.textContent = `${participationRate}%`;
            if (averageCompletion) averageCompletion.textContent = `${avgCompletionRate}%`;
        } catch (error) {
            console.error('更新统计信息失败:', error);
        }
    }

    // 计算学生参与率（模拟）
    function calculateParticipationRate(tasks) {
        if (tasks.length === 0) return 0;
        
        // 模拟计算 - 实际项目中应该从服务器获取真实数据
        let totalParticipation = 0;
        tasks.forEach(task => {
            // 基于任务状态和时间模拟参与率
            const now = new Date();
            const endTime = new Date(task.end_time);
            const startTime = new Date(task.start_time);
            let timePassed = (now - startTime) / (endTime - startTime);
            
            if (timePassed < 0) timePassed = 0;
            if (timePassed > 1) timePassed = 1;
            
            const baseRate = 70; // 基础参与率
            const randomFactor = Math.random() * 20 - 10; // -10 到 +10 的随机变化
            const taskParticipation = Math.min(100, Math.max(0, baseRate + randomFactor));
            
            totalParticipation += taskParticipation;
        });
        
        return Math.round(totalParticipation / tasks.length);
    }

    // 计算平均完成率（模拟）
    function calculateAverageCompletionRate(tasks) {
        if (tasks.length === 0) return 0;
        
        // 模拟计算 - 实际项目中应该从服务器获取真实数据
        let totalCompletion = 0;
        tasks.forEach(task => {
            // 基于任务难度和类型模拟完成率
            let baseRate = 70; // 默认完成率
            
            const randomFactor = Math.random() * 20 - 10; // -10 到 +10 的随机变化
            const taskCompletion = Math.min(100, Math.max(0, baseRate + randomFactor));
            
            totalCompletion += taskCompletion;
        });
        
        return Math.round(totalCompletion / tasks.length);
    }

    // 更新近期任务列表
    async function updateRecentTasks() {
        try {
            const tasks = await apiService.getTasks();
            
            // 按发布时间排序，取最近5个
            const recentTasksList = tasks
                .sort((a, b) => new Date(b.start_time) - new Date(a.start_time))
                .slice(0, 5);
            
            if (!recentTasks) return;

            if (recentTasksList.length === 0) {
                recentTasks.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">📋</div>
                        <p>暂无任务</p>
                        <button onclick="location.href='task-publish.html'" class="primary-btn">发布第一个任务</button>
                    </div>
                `;
                return;
            }
            
            recentTasks.innerHTML = recentTasksList.map(task => {
                const status = getTaskStatus(task);
                const progress = calculateTaskProgress(task);
                
                return `
                    <div class="task-item">
                        <div class="task-header">
                            <div>
                                <div class="task-name">${task.task_name}</div>
                                <div class="task-classes">${task.description || '无描述'}</div>
                            </div>
                            <span class="status-badge status-${status}">${getStatusText(status)}</span>
                        </div>
                        <div class="task-time">
                            ${formatTaskTime(task.start_time, task.end_time)}
                        </div>
                        <div class="task-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${progress}%"></div>
                            </div>
                            <div class="progress-text">完成率: ${progress}%</div>
                        </div>
                    </div>
                `;
            }).join('');
        } catch (error) {
            console.error('更新近期任务失败:', error);
        }
    }

    // 更新班级概览
    async function updateClassesOverview() {
        try {
            const classes = await apiService.getClasses();
            
            if (!classesOverview) return;

            if (classes.length === 0) {
                classesOverview.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">👥</div>
                        <p>暂无班级</p>
                        <button onclick="location.href='class-management.html'" class="primary-btn">创建班级</button>
                    </div>
                `;
                return;
            }
            
            classesOverview.innerHTML = classes.map(cls => {
                // 模拟完成率，实际应该从后端获取
                const completionRate = Math.floor(Math.random() * 30) + 70; // 70-100%的随机完成率
                
                return `
                    <div class="task-item">
                        <div class="task-header">
                            <div class="task-name">${cls.class_name}</div>
                            <span class="task-classes">${cls.student_count || 0}人</span>
                        </div>
                        <div class="task-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${completionRate}%"></div>
                            </div>
                            <div class="progress-text">平均完成率: ${completionRate}%</div>
                        </div>
                    </div>
                `;
            }).join('');
        } catch (error) {
            console.error('更新班级概览失败:', error);
        }
    }

    // 更新活动列表（暂时使用模拟数据）
    function updateActivityList() {
        const activityData = [
            {
                type: 'task_published',
                text: '发布了新任务',
                time: '2小时前',
                icon: '📝'
            },
            {
                type: 'task_completed',
                text: '学生完成了单词背诵任务',
                time: '5小时前',
                icon: '✅'
            },
            {
                type: 'system_updated',
                text: '系统数据已更新',
                time: '昨天',
                icon: '🔄'
            }
        ];

        if (!activityList) return;

        if (activityData.length === 0) {
            activityList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📝</div>
                    <p>暂无活动记录</p>
                </div>
            `;
            return;
        }
        
        activityList.innerHTML = activityData.map(activity => {
            return `
                <div class="activity-item">
                    <div class="activity-icon">${activity.icon}</div>
                    <div class="activity-content">
                        <div class="activity-text">${activity.text}</div>
                        <div class="activity-time">${activity.time}</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // 工具函数
    function getTaskStatus(task) {
        const now = new Date();
        const startTime = new Date(task.start_time);
        const endTime = new Date(task.end_time);
        
        if (now < startTime) {
            return 'scheduled';
        } else if (now > endTime) {
            return 'ended';
        } else {
            return 'published';
        }
    }

    function getStatusText(status) {
        const statusMap = {
            'scheduled': '未开始',
            'published': '进行中',
            'ended': '已结束'
        };
        return statusMap[status] || status;
    }

    function calculateTaskProgress(task) {
        // 模拟任务进度 - 实际项目中应该从服务器获取真实数据
        const now = new Date();
        const startTime = new Date(task.start_time);
        const endTime = new Date(task.end_time);
        
        // 时间进度
        const totalTime = endTime - startTime;
        const elapsedTime = now - startTime;
        const timeProgress = Math.min(100, Math.max(0, (elapsedTime / totalTime) * 100));
        
        // 基于时间进度和随机因素计算完成率
        const randomFactor = Math.random() * 20 - 10; // -10 到 +10 的随机变化
        let completionRate = timeProgress + randomFactor;
        
        // 确保在合理范围内
        completionRate = Math.min(100, Math.max(0, completionRate));
        
        return Math.round(completionRate);
    }

    function formatTaskTime(startTime, endTime) {
        if (!startTime || !endTime) return '时间未设置';
        
        const start = new Date(startTime);
        const end = new Date(endTime);
        
        const startStr = start.toLocaleDateString('zh-CN');
        const endStr = end.toLocaleDateString('zh-CN');
        
        return `${startStr} - ${endStr}`;
    }

    // 启动应用
    await initializeApp();
    
    // 定期更新数据（每2分钟）
    setInterval(async () => {
        await updateDashboard();
    }, 120000);
});