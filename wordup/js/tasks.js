// 学生任务功能逻辑
document.addEventListener('DOMContentLoaded', function() {
    // 页面元素
    const backBtn = document.getElementById('backBtn');
    const filterStatus = document.getElementById('filterStatus');
    const filterType = document.getElementById('filterType');
    const refreshBtn = document.getElementById('refreshBtn');
    const tasksContainer = document.getElementById('tasksContainer');
    const emptyState = document.getElementById('emptyState');
    
    // 统计元素
    const totalTasks = document.getElementById('totalTasks');
    const completedTasks = document.getElementById('completedTasks');
    const pendingTasks = document.getElementById('pendingTasks');
    const completionRate = document.getElementById('completionRate');
    const listCount = document.getElementById('listCount');

    // 当前用户
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    // 初始化事件监听
    function initEventListeners() {
        // 导航
        backBtn.addEventListener('click', () => {
            window.location.href = 'student.html';
        });

        // 筛选和刷新
        filterStatus.addEventListener('change', updateTasksList);
        filterType.addEventListener('change', updateTasksList);
        refreshBtn.addEventListener('click', updateTasksList);
    }

    // 初始化显示
    function initDisplay() {
        updateStatistics();
        updateTasksList();
    }

    // 更新统计信息
    function updateStatistics() {
        const tasks = getStudentTasks();
        const completed = tasks.filter(task => task.status === 'completed').length;
        const pending = tasks.filter(task => task.status === 'in_progress').length;
        const rate = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;

        totalTasks.textContent = tasks.length;
        completedTasks.textContent = completed;
        pendingTasks.textContent = pending;
        completionRate.textContent = `${rate}%`;
    }

    // 获取学生任务
    function getStudentTasks() {
        // 从 localStorage 获取所有任务
        const allTasks = JSON.parse(localStorage.getItem('teacherTasks')) || [];
        const studentProgress = JSON.parse(localStorage.getItem('studentTaskProgress')) || {};
        
        // 获取当前学生的进度
        const studentId = currentUser.username;
        const progress = studentProgress[studentId] || {};

        // 过滤出分配给当前学生的任务
        // 注意：这里我们假设所有任务都分配给所有学生
        // 实际项目中应该根据学生所在的班级来过滤任务
        const studentTasks = allTasks.map(task => {
            const taskProgress = progress[task.id] || {
                status: 'not_started',
                progress: 0,
                score: null,
                startedAt: null,
                completedAt: null
            };

            // 检查任务是否逾期
            const now = new Date();
            const endTime = new Date(task.endTime);
            let status = taskProgress.status;
            
            if (status !== 'completed' && now > endTime) {
                status = 'overdue';
            }

            return {
                ...task,
                status: status,
                progress: taskProgress.progress,
                score: taskProgress.score,
                startedAt: taskProgress.startedAt,
                completedAt: taskProgress.completedAt,
                isOverdue: now > endTime
            };
        });

        return studentTasks;
    }

    // 更新任务列表
    function updateTasksList() {
        const statusFilter = filterStatus.value;
        const typeFilter = filterType.value;

        const tasks = getStudentTasks();
        const filteredTasks = tasks.filter(task => {
            const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
            const matchesType = typeFilter === 'all' || task.type === typeFilter;
            return matchesStatus && matchesType;
        });

        displayTasks(filteredTasks);
        updateStatistics();
    }

    // 显示任务列表
    function displayTasks(tasks) {
        listCount.textContent = tasks.length;

        if (tasks.length === 0) {
            tasksContainer.classList.add('hidden');
            emptyState.classList.remove('hidden');
            return;
        }

        tasksContainer.classList.remove('hidden');
        emptyState.classList.add('hidden');

        // 按截止时间排序
        tasks.sort((a, b) => new Date(a.endTime) - new Date(b.endTime));

        tasksContainer.innerHTML = tasks.map(task => {
            const progressPercent = task.progress || 0;
            const cardClass = getTaskCardClass(task);
            
            return `
                <div class="task-card ${cardClass}" data-task-id="${task.id}">
                    <div class="task-header">
                        <div>
                            <div class="task-title">${task.name}</div>
                            <div class="task-meta">
                                <span class="task-type">${getTaskTypeText(task.type)}</span>
                                <span class="task-status status-${task.status}">${getStatusText(task.status)}</span>
                                <span class="task-teacher">👨‍🏫 ${task.teacher || '未知老师'}</span>
                                <span class="task-deadline">📅 ${formatDeadline(task.endTime)}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="task-content">
                        <div class="task-description">
                            ${task.description || '暂无任务描述'}
                        </div>
                        
                        <div class="task-details">
                            <div class="detail-item">
                                <span class="detail-icon">📖</span>
                                <span>${getTaskDetails(task)}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-icon">⏰</span>
                                <span>${formatTimeRange(task.startTime, task.endTime)}</span>
                            </div>
                            ${task.score !== null ? `
                                <div class="detail-item">
                                    <span class="detail-icon">🎯</span>
                                    <span>得分: ${task.score}</span>
                                </div>
                            ` : ''}
                        </div>
                        
                        ${task.status !== 'completed' ? `
                            <div class="task-progress">
                                <div class="progress-header">
                                    <span>完成进度</span>
                                    <span>${progressPercent}%</span>
                                </div>
                                <div class="progress-bar">
                                    <div class="progress-fill ${task.isOverdue ? 'overdue' : ''}" 
                                         style="width: ${progressPercent}%"></div>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="task-actions">
                        ${getTaskActions(task)}
                    </div>
                </div>
            `;
        }).join('');

        // 添加任务卡片点击事件
        document.querySelectorAll('.task-card').forEach(card => {
            card.addEventListener('click', function(e) {
                // 防止按钮点击触发卡片点击
                if (!e.target.closest('.task-actions')) {
                    const taskId = this.dataset.taskId;
                    viewTaskDetail(taskId);
                }
            });
        });

        // 添加按钮事件
        addButtonEvents();
    }

    // 获取任务卡片样式类
    function getTaskCardClass(task) {
        if (task.status === 'completed') return 'completed';
        if (task.isOverdue) return 'urgent';
        
        const now = new Date();
        const endTime = new Date(task.endTime);
        const timeLeft = endTime - now;
        const daysLeft = timeLeft / (1000 * 60 * 60 * 24);
        
        if (daysLeft < 1) return 'urgent';
        if (daysLeft < 3) return 'upcoming';
        
        return '';
    }

    // 获取任务详情文本
    function getTaskDetails(task) {
        switch (task.type) {
            case 'reciting':
                return `背诵 ${task.words ? task.words.length : 0} 个单词`;
            case 'testing':
                const settings = task.testSettings || {};
                return `测试 ${settings.questionCount || 0} 题，${settings.timeLimit || 0} 分钟`;
            case 'review':
                return '复习错题本中的单词';
            default:
                return '未知任务类型';
        }
    }

    // 获取任务操作按钮
    function getTaskActions(task) {
        switch (task.status) {
            case 'not_started':
                return `<button class="small-btn primary start-task" data-task-id="${task.id}">开始任务</button>`;
            case 'in_progress':
                return `
                    <button class="small-btn primary continue-task" data-task-id="${task.id}">继续任务</button>
                    <button class="small-btn secondary view-detail" data-task-id="${task.id}">查看详情</button>
                `;
            case 'completed':
                return `
                    <button class="small-btn primary review-task" data-task-id="${task.id}">再次学习</button>
                    <button class="small-btn secondary view-detail" data-task-id="${task.id}">查看结果</button>
                `;
            case 'overdue':
                return `<button class="small-btn secondary view-detail" data-task-id="${task.id}">查看详情</button>`;
            default:
                return '';
        }
    }

    // 添加按钮事件
    function addButtonEvents() {
        // 开始任务
        document.querySelectorAll('.start-task').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const taskId = this.dataset.taskId;
                startTask(taskId);
            });
        });

        // 继续任务
        document.querySelectorAll('.continue-task').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const taskId = this.dataset.taskId;
                continueTask(taskId);
            });
        });

        // 查看详情
        document.querySelectorAll('.view-detail').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const taskId = this.dataset.taskId;
                viewTaskDetail(taskId);
            });
        });

        // 再次学习
        document.querySelectorAll('.review-task').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const taskId = this.dataset.taskId;
                reviewTask(taskId);
            });
        });
    }

    // 开始任务
    function startTask(taskId) {
        const tasks = JSON.parse(localStorage.getItem('teacherTasks')) || [];
        const task = tasks.find(t => t.id === taskId);
        
        if (!task) {
            alert('任务不存在');
            return;
        }

        // 更新任务状态
        updateTaskProgress(taskId, 'in_progress', 0);

        // 根据任务类型跳转
        navigateToTask(task);
    }

    // 继续任务
    function continueTask(taskId) {
        const tasks = JSON.parse(localStorage.getItem('teacherTasks')) || [];
        const task = tasks.find(t => t.id === taskId);
        
        if (!task) {
            alert('任务不存在');
            return;
        }

        // 根据任务类型跳转
        navigateToTask(task);
    }

    // 查看任务详情
    function viewTaskDetail(taskId) {
        // 在实际项目中，这里可以跳转到任务详情页面
        // 现在我们先简单显示任务信息
        const tasks = JSON.parse(localStorage.getItem('teacherTasks')) || [];
        const task = tasks.find(t => t.id === taskId);
        
        if (task) {
            alert(`任务详情：\n\n${task.name}\n\n${task.description || '暂无描述'}\n\n类型：${getTaskTypeText(task.type)}\n截止时间：${formatDisplayTime(task.endTime)}`);
        }
    }

    // 复习任务
    function reviewTask(taskId) {
        const tasks = JSON.parse(localStorage.getItem('teacherTasks')) || [];
        const task = tasks.find(t => t.id === taskId);
        
        if (!task) {
            alert('任务不存在');
            return;
        }

        // 根据任务类型跳转
        navigateToTask(task);
    }

    // 导航到任务执行页面
    function navigateToTask(task) {
        switch (task.type) {
            case 'reciting':
                // 跳转到单词背诵页面，并传递任务ID
                window.location.href = `word-reciting.html?task=${task.id}`;
                break;
            case 'testing':
                alert('单词测试功能开发中...');
                // window.location.href = `word-testing.html?task=${task.id}`;
                break;
            case 'review':
                // 跳转到错题复习页面
                window.location.href = 'wrong-words.html';
                break;
            default:
                alert('未知的任务类型');
        }
    }

    // 更新任务进度
    function updateTaskProgress(taskId, status, progress, score = null) {
        const studentProgress = JSON.parse(localStorage.getItem('studentTaskProgress')) || {};
        const studentId = currentUser.username;
        
        if (!studentProgress[studentId]) {
            studentProgress[studentId] = {};
        }

        studentProgress[studentId][taskId] = {
            status: status,
            progress: progress,
            score: score,
            lastUpdated: new Date().toISOString()
        };

        if (status === 'in_progress' && !studentProgress[studentId][taskId].startedAt) {
            studentProgress[studentId][taskId].startedAt = new Date().toISOString();
        }

        if (status === 'completed') {
            studentProgress[studentId][taskId].completedAt = new Date().toISOString();
        }

        localStorage.setItem('studentTaskProgress', JSON.stringify(studentProgress));
        
        // 更新显示
        updateTasksList();
    }

    // 工具函数
    function getTaskTypeText(type) {
        const typeMap = {
            'reciting': '单词背诵',
            'testing': '单词测试',
            'review': '错题复习'
        };
        return typeMap[type] || type;
    }

    function getStatusText(status) {
        const statusMap = {
            'not_started': '未开始',
            'in_progress': '进行中',
            'completed': '已完成',
            'overdue': '已逾期'
        };
        return statusMap[status] || status;
    }

    function formatDeadline(dateString) {
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

    function formatTimeRange(startTime, endTime) {
        const start = new Date(startTime);
        const end = new Date(endTime);
        
        return `${start.toLocaleDateString('zh-CN')} - ${end.toLocaleDateString('zh-CN')}`;
    }

    function formatDisplayTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // 初始化应用
    initEventListeners();
    initDisplay();
});