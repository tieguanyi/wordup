// 任务发布功能逻辑
document.addEventListener('DOMContentLoaded', function() {
    // 页面元素
    const backBtn = document.getElementById('backBtn');
    const taskForm = document.querySelector('.task-publish-container');
    const taskType = document.getElementById('taskType');
    const wordSelection = document.getElementById('wordSelection');
    const testSettings = document.getElementById('testSettings');
    const wordbookSelect = document.getElementById('wordbookSelect');
    const customWordsSection = document.getElementById('customWordsSection');
    const previewWordsBtn = document.getElementById('previewWords');
    const validateWordsBtn = document.getElementById('validateWords');
    const wordPreview = document.getElementById('wordPreview');
    const saveDraftBtn = document.getElementById('saveDraft');
    const previewTaskBtn = document.getElementById('previewTask');
    const publishTaskBtn = document.getElementById('publishTask');
    
    // 模态框元素
    const previewModal = document.getElementById('previewModal');
    const closePreviewBtn = document.getElementById('closePreview');
    const cancelPreviewBtn = document.getElementById('cancelPreview');
    const confirmPublishBtn = document.getElementById('confirmPublish');
    
    // 预览元素
    const previewTaskName = document.getElementById('previewTaskName');
    const previewTaskDescription = document.getElementById('previewTaskDescription');
    const previewTaskType = document.getElementById('previewTaskType');
    const previewTimeRange = document.getElementById('previewTimeRange');
    const previewClasses = document.getElementById('previewClasses');
    const previewWordCount = document.getElementById('previewWordCount');
    const previewTestSettings = document.getElementById('previewTestSettings');
    const previewTestDetails = document.getElementById('previewTestDetails');

    // 模拟数据
    const classesData = [
        { id: 'class1', name: '计算机科学与技术1班', studentCount: 35 },
        { id: 'class2', name: '计算机科学与技术2班', studentCount: 32 },
        { id: 'class3', name: '软件工程1班', studentCount: 40 },
        { id: 'class4', name: '软件工程2班', studentCount: 38 },
        { id: 'class5', name: '人工智能1班', studentCount: 28 }
    ];

    const wordDatabase = {
        cet4: [
            { word: "abandon", difficulty: "medium" },
            { word: "ability", difficulty: "easy" },
            { word: "abnormal", difficulty: "medium" },
            { word: "abolish", difficulty: "hard" },
            { word: "abroad", difficulty: "easy" },
            { word: "abundant", difficulty: "medium" },
            { word: "academy", difficulty: "medium" },
            { word: "accelerate", difficulty: "medium" },
            { word: "accent", difficulty: "easy" },
            { word: "accept", difficulty: "easy" },
            { word: "access", difficulty: "medium" },
            { word: "accident", difficulty: "easy" },
            { word: "accommodate", difficulty: "hard" },
            { word: "accompany", difficulty: "medium" },
            { word: "accomplish", difficulty: "medium" }
        ],
        cet6: [
            { word: "abbreviation", difficulty: "hard" },
            { word: "abide", difficulty: "medium" },
            { word: "abnormal", difficulty: "medium" },
            { word: "abolish", difficulty: "hard" },
            { word: "abortion", difficulty: "hard" },
            { word: "abrupt", difficulty: "hard" },
            { word: "absence", difficulty: "easy" },
            { word: "absolute", difficulty: "medium" },
            { word: "absorb", difficulty: "medium" },
            { word: "abstract", difficulty: "hard" },
            { word: "absurd", difficulty: "hard" },
            { word: "abundance", difficulty: "medium" },
            { word: "abuse", difficulty: "medium" },
            { word: "academic", difficulty: "medium" },
            { word: "academy", difficulty: "medium" }
        ]
    };

    // 应用状态
    let currentState = {
        selectedClasses: [],
        selectedWords: [],
        taskDraft: null
    };

    // 预览模态框状态管理
    let previewModalState = {
        isOpen: false
    };

    // 初始化事件监听
    function initEventListeners() {
        // 导航
        backBtn.addEventListener('click', () => {
            if (confirm('确定要返回吗？未保存的更改将会丢失。')) {
                window.location.href = 'teacher.html';
            }
        });

        // 任务类型变化
        taskType.addEventListener('change', handleTaskTypeChange);
        
        // 词书选择变化
        wordbookSelect.addEventListener('change', handleWordbookChange);
        
        // 预览单词
        previewWordsBtn.addEventListener('click', previewWordList);
        
        // 验证自定义单词
        validateWordsBtn.addEventListener('click', validateCustomWords);
        
        // 表单操作
        saveDraftBtn.addEventListener('click', saveTaskDraft);
        previewTaskBtn.addEventListener('click', previewTask);
        publishTaskBtn.addEventListener('click', showPreviewModal);
        
        // 模态框操作
        closePreviewBtn.addEventListener('click', closePreviewModal);
        cancelPreviewBtn.addEventListener('click', closePreviewModal);
        confirmPublishBtn.addEventListener('click', publishTask);
        
        // 班级全选
        document.getElementById('selectAll').addEventListener('click', toggleSelectAllClasses);
        
        // 设置默认时间
        setDefaultTimes();

        // ESC键关闭预览模态框
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && previewModalState.isOpen) {
                closePreviewModal();
            }
        });

        // 外部点击关闭预览模态框
        previewModal.addEventListener('click', function(e) {
            if (e.target === previewModal && previewModalState.isOpen) {
                closePreviewModal();
            }
        });
    }

    // 初始化显示
    function initDisplay() {
        loadClassesList();
        loadTaskDraft();
    }

    // 处理任务类型变化
    function handleTaskTypeChange() {
        const type = taskType.value;
        
        // 显示/隐藏相关设置
        if (type === 'testing') {
            testSettings.classList.remove('hidden');
        } else {
            testSettings.classList.add('hidden');
        }
        
        // 保存到草稿
        saveToDraft();
    }

    // 处理词书选择变化
    function handleWordbookChange() {
        const wordbook = wordbookSelect.value;
        
        if (wordbook === 'custom') {
            customWordsSection.classList.remove('hidden');
            wordPreview.classList.add('hidden');
        } else {
            customWordsSection.classList.add('hidden');
        }
        
        // 保存到草稿
        saveToDraft();
    }

    // 加载班级列表
    function loadClassesList() {
        const classesList = document.getElementById('classesList');
        
        classesList.innerHTML = classesData.map(cls => `
            <div class="class-item">
                <input type="checkbox" class="class-checkbox" id="class-${cls.id}" value="${cls.id}">
                <div class="class-info">
                    <div class="class-name">${cls.name}</div>
                    <div class="class-details">${cls.studentCount} 名学生</div>
                </div>
            </div>
        `).join('');

        // 添加班级选择事件监听
        document.querySelectorAll('.class-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', updateSelectedClasses);
        });
    }

    // 更新选中的班级
    function updateSelectedClasses() {
        const selectedCheckboxes = document.querySelectorAll('.class-checkbox:checked');
        currentState.selectedClasses = Array.from(selectedCheckboxes).map(cb => cb.value);
        
        document.getElementById('selectedCount').textContent = currentState.selectedClasses.length;
        
        // 保存到草稿
        saveToDraft();
    }

    // 全选/取消全选班级
    function toggleSelectAllClasses() {
        const checkboxes = document.querySelectorAll('.class-checkbox');
        const allSelected = currentState.selectedClasses.length === classesData.length;
        
        checkboxes.forEach(checkbox => {
            checkbox.checked = !allSelected;
        });
        
        updateSelectedClasses();
    }

    // 预览单词列表
    function previewWordList() {
        const wordbook = wordbookSelect.value;
        const wordCount = parseInt(document.getElementById('wordCount').value) || 20;
        const difficultyFilter = document.getElementById('difficultyFilter').value;
        
        if (wordbook === 'custom') {
            alert('请先在自定义单词区域输入单词');
            return;
        }
        
        let words = [...wordDatabase[wordbook]];
        
        // 应用难度筛选
        if (difficultyFilter !== 'all') {
            words = words.filter(word => word.difficulty === difficultyFilter);
        }
        
        // 限制单词数量
        words = words.slice(0, wordCount);
        
        // 显示预览
        displayWordPreview(words);
        
        // 保存到状态
        currentState.selectedWords = words;
        
        // 保存到草稿
        saveToDraft();
    }

    // 显示单词预览
    function displayWordPreview(words) {
        const previewList = document.getElementById('previewList');
        const difficultyCount = {
            easy: 0,
            medium: 0,
            hard: 0
        };
        
        previewList.innerHTML = words.map(word => {
            difficultyCount[word.difficulty]++;
            return `
                <div class="preview-word">
                    <span class="word-difficulty ${word.difficulty}"></span>
                    ${word.word}
                </div>
            `;
        }).join('');
        
        // 更新统计
        document.getElementById('previewCount').textContent = words.length;
        document.getElementById('easyCount').textContent = difficultyCount.easy;
        document.getElementById('mediumCount').textContent = difficultyCount.medium;
        document.getElementById('hardCount').textContent = difficultyCount.hard;
        
        wordPreview.classList.remove('hidden');
    }

    // 验证自定义单词
    function validateCustomWords() {
        const customWordsText = document.getElementById('customWords').value.trim();
        const validationResult = document.getElementById('wordValidationResult');
        
        if (!customWordsText) {
            validationResult.textContent = '请输入单词';
            validationResult.className = 'validation-result invalid';
            return;
        }
        
        const words = customWordsText.split('\n')
            .map(word => word.trim())
            .filter(word => word.length > 0);
        
        if (words.length === 0) {
            validationResult.textContent = '未找到有效的单词';
            validationResult.className = 'validation-result invalid';
            return;
        }
        
        // 简单的单词验证（实际项目中应该调用API验证）
        const validWords = words.map(word => ({
            word: word,
            difficulty: 'medium' // 默认难度
        }));
        
        currentState.selectedWords = validWords;
        displayWordPreview(validWords);
        
        validationResult.textContent = `验证通过，找到 ${words.length} 个单词`;
        validationResult.className = 'validation-result valid';
        
        // 保存到草稿
        saveToDraft();
    }

    // 设置默认时间
    function setDefaultTimes() {
        const now = new Date();
        const startTime = new Date(now.getTime() + 60 * 60 * 1000); // 1小时后
        const endTime = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7天后
        
        document.getElementById('startTime').value = formatDateTimeLocal(startTime);
        document.getElementById('endTime').value = formatDateTimeLocal(endTime);
    }

    // 格式化日期时间为本地格式
    function formatDateTimeLocal(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    // 保存任务草稿
    function saveTaskDraft() {
        const taskData = collectTaskData();
        
        if (validateTaskData(taskData, true)) {
            currentState.taskDraft = taskData;
            localStorage.setItem('taskDraft', JSON.stringify(taskData));
            alert('草稿保存成功！');
        }
    }

    // 加载任务草稿
    function loadTaskDraft() {
        const draft = localStorage.getItem('taskDraft');
        if (draft) {
            currentState.taskDraft = JSON.parse(draft);
            fillFormFromDraft();
        }
    }

    // 从草稿填充表单
    function fillFormFromDraft() {
        const draft = currentState.taskDraft;
        if (!draft) return;
        
        // 填充基本信息
        document.getElementById('taskName').value = draft.name || '';
        document.getElementById('taskType').value = draft.type || '';
        document.getElementById('taskDescription').value = draft.description || '';
        
        if (draft.startTime) {
            document.getElementById('startTime').value = draft.startTime;
        }
        if (draft.endTime) {
            document.getElementById('endTime').value = draft.endTime;
        }
        
        // 填充班级选择
        if (draft.classes) {
            currentState.selectedClasses = draft.classes;
            document.querySelectorAll('.class-checkbox').forEach(checkbox => {
                checkbox.checked = draft.classes.includes(checkbox.value);
            });
            updateSelectedClasses();
        }
        
        // 填充单词设置
        if (draft.wordbook) {
            document.getElementById('wordbookSelect').value = draft.wordbook;
            handleWordbookChange();
        }
        
        if (draft.wordCount) {
            document.getElementById('wordCount').value = draft.wordCount;
        }
        
        if (draft.difficultyFilter) {
            document.getElementById('difficultyFilter').value = draft.difficultyFilter;
        }
        
        if (draft.words && draft.words.length > 0) {
            currentState.selectedWords = draft.words;
            displayWordPreview(draft.words);
        }
        
        // 填充测试设置
        if (draft.testSettings) {
            document.getElementById('questionCount').value = draft.testSettings.questionCount || 20;
            document.getElementById('timeLimit').value = draft.testSettings.timeLimit || 30;
            document.getElementById('passingScore').value = draft.testSettings.passingScore || 60;
            document.getElementById('allowRetake').checked = draft.testSettings.allowRetake || false;
        }
        
        // 更新任务类型相关显示
        handleTaskTypeChange();
    }

    // 收集任务数据
    function collectTaskData() {
        return {
            name: document.getElementById('taskName').value,
            type: document.getElementById('taskType').value,
            description: document.getElementById('taskDescription').value,
            startTime: document.getElementById('startTime').value,
            endTime: document.getElementById('endTime').value,
            classes: currentState.selectedClasses,
            wordbook: document.getElementById('wordbookSelect').value,
            wordCount: parseInt(document.getElementById('wordCount').value) || 20,
            difficultyFilter: document.getElementById('difficultyFilter').value,
            words: currentState.selectedWords,
            testSettings: taskType.value === 'testing' ? {
                questionCount: parseInt(document.getElementById('questionCount').value) || 20,
                timeLimit: parseInt(document.getElementById('timeLimit').value) || 30,
                passingScore: parseInt(document.getElementById('passingScore').value) || 60,
                allowRetake: document.getElementById('allowRetake').checked
            } : null
        };
    }

    // 验证任务数据
    function validateTaskData(taskData, isDraft = false) {
        if (!isDraft) {
            if (!taskData.name.trim()) {
                alert('请输入任务名称');
                return false;
            }
            
            if (!taskData.type) {
                alert('请选择任务类型');
                return false;
            }
            
            if (!taskData.startTime || !taskData.endTime) {
                alert('请设置任务时间');
                return false;
            }
            
            if (new Date(taskData.startTime) >= new Date(taskData.endTime)) {
                alert('开始时间必须早于结束时间');
                return false;
            }
            
            if (taskData.classes.length === 0) {
                alert('请至少选择一个班级');
                return false;
            }
            
            if (taskData.words.length === 0) {
                alert('请选择或输入单词');
                return false;
            }
        }
        
        return true;
    }

    // 保存到草稿
    function saveToDraft() {
        const taskData = collectTaskData();
        if (validateTaskData(taskData, true)) {
            currentState.taskDraft = taskData;
        }
    }

    // 预览任务
    function previewTask() {
        const taskData = collectTaskData();
        
        if (!validateTaskData(taskData)) {
            return;
        }
        
        // 填充预览内容
        previewTaskName.textContent = taskData.name;
        previewTaskDescription.textContent = taskData.description || '无描述';
        previewTaskType.textContent = getTaskTypeText(taskData.type);
        previewTimeRange.textContent = `${formatDisplayTime(taskData.startTime)} - ${formatDisplayTime(taskData.endTime)}`;
        previewClasses.textContent = getSelectedClassNames().join('，');
        previewWordCount.textContent = taskData.words.length;
        
        // 测试设置预览
        if (taskData.type === 'testing' && taskData.testSettings) {
            previewTestSettings.classList.remove('hidden');
            const ts = taskData.testSettings;
            previewTestDetails.textContent = `${ts.questionCount}题，${ts.timeLimit}分钟，及格分${ts.passingScore}分${ts.allowRetake ? '，可重复测试' : ''}`;
        } else {
            previewTestSettings.classList.add('hidden');
        }
        
        showPreviewModal();
    }

    // 显示预览模态框
    function showPreviewModal() {
        previewModal.classList.remove('hidden');
        previewModalState.isOpen = true;
    }

    // 关闭预览模态框
    function closePreviewModal() {
        previewModal.classList.add('hidden');
        previewModalState.isOpen = false;
    }

    // 发布任务
    function publishTask() {
        const taskData = collectTaskData();
        
        if (!validateTaskData(taskData)) {
            return;
        }
        
        // 生成任务ID
        const taskId = 'task_' + Date.now();
        const taskWithId = {
            ...taskData,
            id: taskId,
            status: 'published',
            publishTime: new Date().toISOString(),
            teacher: JSON.parse(localStorage.getItem('currentUser')).username
        };
        
        // 保存到本地存储（实际项目中应该发送到服务器）
        let tasks = JSON.parse(localStorage.getItem('teacherTasks')) || [];
        tasks.push(taskWithId);
        localStorage.setItem('teacherTasks', JSON.stringify(tasks));
        
        // 清除草稿
        localStorage.removeItem('taskDraft');
        currentState.taskDraft = null;
        
        // 显示成功消息
        alert('任务发布成功！');
        
        // 关闭模态框并返回
        closePreviewModal();
        window.location.href = 'teacher.html';
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

    function formatDisplayTime(dateTimeString) {
        const date = new Date(dateTimeString);
        return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function getSelectedClassNames() {
        return classesData
            .filter(cls => currentState.selectedClasses.includes(cls.id))
            .map(cls => cls.name);
    }

    // 初始化应用
    initEventListeners();
    initDisplay();
    
    // 自动保存草稿（每30秒）
    setInterval(() => {
        if (currentState.taskDraft) {
            localStorage.setItem('taskDraft', JSON.stringify(currentState.taskDraft));
        }
    }, 30000);
});