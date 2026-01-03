// 单词库管理功能逻辑 - 使用后端API
document.addEventListener('DOMContentLoaded', async function() {
    // 安全检查：确保关键依赖已加载
    if (typeof authManager === 'undefined') {
        console.error('authManager 未定义，正在重载页面...');
        // 尝试重新加载关键脚本
        await loadScript('js/auth-manager.js');
        // 如果仍然未定义，重定向到登录页
        if (typeof authManager === 'undefined') {
            alert('页面加载失败，正在跳转到登录页面...');
            window.location.href = 'index.html';
            return;
        }
    }

    if (typeof apiService === 'undefined') {
        console.error('apiService 未定义，正在重载页面...');
        await loadScript('js/api-service.js');
        if (typeof apiService === 'undefined') {
            alert('页面加载失败，正在跳转到登录页面...');
            window.location.href = 'index.html';
            return;
        }
    }

    // 动态加载脚本的函数
    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // 页面元素
    const backBtn = document.getElementById('backBtn');
    const wordbookSelect = document.getElementById('wordbookSelect');
    const addWordbookBtn = document.getElementById('addWordbook');
    const addWordBtn = document.getElementById('addWord');
    const importWordsBtn = document.getElementById('importWords');
    const exportWordsBtn = document.getElementById('exportWords');
    const searchInput = document.getElementById('searchWord');
    const searchBtn = document.getElementById('searchBtn');
    const wordsContainer = document.getElementById('wordsContainer');
    const emptyState = document.getElementById('emptyState');
    const addFirstWordBtn = document.getElementById('addFirstWord');

    // 统计元素
    const totalWordCount = document.getElementById('totalWordCount');
    const easyWordCount = document.getElementById('easyWordCount');
    const mediumWordCount = document.getElementById('mediumWordCount');
    const hardWordCount = document.getElementById('hardWordCount');
    const listCount = document.getElementById('listCount');

    // 模态框元素
    const wordModal = document.getElementById('wordModal');
    const importModal = document.getElementById('importModal');
    const modalTitle = document.getElementById('modalTitle');
    const wordForm = document.getElementById('wordForm');
    const closeModalBtn = document.getElementById('closeModal');
    const cancelEditBtn = document.getElementById('cancelEdit');
    const saveWordBtn = document.getElementById('saveWord');
    const closeImportModalBtn = document.getElementById('closeImportModal');
    const cancelImportBtn = document.getElementById('cancelImport');
    const confirmImportBtn = document.getElementById('confirmImport');
    const importData = document.getElementById('importData');
    const detectedCount = document.getElementById('detectedCount');

    // 表单元素
    const wordInput = document.getElementById('wordInput');
    const phoneticInput = document.getElementById('phoneticInput');
    const difficultySelect = document.getElementById('difficultySelect');
    const meaningsInput = document.getElementById('meaningsInput');
    const examplesInput = document.getElementById('examplesInput');
    const relatedWordsInput = document.getElementById('relatedWordsInput');

    // 当前状态
    let currentState = {
        words: [],
        filteredWords: [],
        editingWord: null,
        isSaving: false, // 添加保存状态标志
        isImporting: false // 添加导入状态标志
    };

    // 模态框状态管理
    let modalState = {
        wordModalOpen: false,
        importModalOpen: false
    };

    // 初始化应用
    async function initializeApp() {
        try {
            console.log('初始化单词管理页面...');
            
            // 检查认证
            if (!authManager.isLoggedIn()) {
                window.location.href = 'index.html';
                return;
            }
            
            // 初始化事件监听
            initGlobalEventListeners();
            initEventListeners();
            
            // 加载数据
            await loadWords();
            updateStatistics();
            
            console.log('单词管理页面初始化完成');
        } catch (error) {
            console.error('初始化失败:', error);
            alert('页面初始化失败: ' + error.message);
        }
    }

    // 修复：全局ESC键监听器
    function initGlobalEventListeners() {
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                if (modalState.wordModalOpen) {
                    closeWordModal();
                }
                if (modalState.importModalOpen) {
                    closeImportModal();
                }
            }
        });

        // 修复：模态框外部点击关闭
        document.addEventListener('click', function(e) {
            if (modalState.wordModalOpen && e.target === wordModal) {
                closeWordModal();
            }
            if (modalState.importModalOpen && e.target === importModal) {
                closeImportModal();
            }
        });
    }

    // 初始化事件监听
    function initEventListeners() {
        // 导航
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                window.location.href = 'admin.html';
            });
        }

        // 词库操作
        if (addWordbookBtn) {
            addWordbookBtn.addEventListener('click', addNewWordbook);
        }

        // 单词操作
        if (addWordBtn) {
            addWordBtn.addEventListener('click', showAddWordModal);
        }
        if (importWordsBtn) {
            importWordsBtn.addEventListener('click', showImportModal);
        }
        if (exportWordsBtn) {
            exportWordsBtn.addEventListener('click', exportWordbook);
        }
        if (searchBtn) {
            searchBtn.addEventListener('click', performSearch);
        }
        if (searchInput) {
            searchInput.addEventListener('input', handleSearchInput);
        }
        if (addFirstWordBtn) {
            addFirstWordBtn.addEventListener('click', showAddWordModal);
        }

        // 修复：确保模态框操作事件绑定正确
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', closeWordModal);
        }
        if (cancelEditBtn) {
            cancelEditBtn.addEventListener('click', closeWordModal);
        }
        if (saveWordBtn) {
            saveWordBtn.addEventListener('click', saveWord);
        }
        if (closeImportModalBtn) {
            closeImportModalBtn.addEventListener('click', closeImportModal);
        }
        if (cancelImportBtn) {
            cancelImportBtn.addEventListener('click', closeImportModal);
        }
        if (confirmImportBtn) {
            confirmImportBtn.addEventListener('click', confirmImport);
        }

        // 导入数据实时检测
        if (importData) {
            importData.addEventListener('input', detectImportWords);
        }
    }

    // 修复：改进的关闭模态框函数
    function closeWordModal() {
        if (wordModal) {
            wordModal.classList.add('hidden');
        }
        modalState.wordModalOpen = false;
        currentState.editingWord = null;
        currentState.isSaving = false; // 重置保存状态
        // 确保body滚动恢复
        document.body.style.overflow = 'auto';
        document.body.style.pointerEvents = 'auto';
        
        // 恢复保存按钮状态
        if (saveWordBtn) {
            saveWordBtn.disabled = false;
            saveWordBtn.textContent = '保存';
        }
    }

    function closeImportModal() {
        if (importModal) {
            importModal.classList.add('hidden');
        }
        modalState.importModalOpen = false;
        currentState.isImporting = false; // 重置导入状态
        if (importData) {
            importData.value = '';
        }
        if (detectedCount) {
            detectedCount.textContent = '0';
        }
        // 确保body滚动恢复
        document.body.style.overflow = 'auto';
        document.body.style.pointerEvents = 'auto';
        
        // 恢复导入按钮状态
        if (confirmImportBtn) {
            confirmImportBtn.disabled = false;
            confirmImportBtn.textContent = '确认导入';
        }
    }

    // 修复：改进的显示模态框函数
    function showAddWordModal() {
        currentState.editingWord = null;
        if (modalTitle) {
            modalTitle.textContent = '添加单词';
        }
        clearWordForm();
        if (wordModal) {
            wordModal.classList.remove('hidden');
            // 防止背景滚动
            document.body.style.overflow = 'hidden';
        }
        modalState.wordModalOpen = true;
        
        // 确保保存按钮可用
        if (saveWordBtn) {
            saveWordBtn.disabled = false;
            saveWordBtn.textContent = '保存';
        }
    }

    function showImportModal() {
        if (importModal) {
            importModal.classList.remove('hidden');
            // 防止背景滚动
            document.body.style.overflow = 'hidden';
        }
        modalState.importModalOpen = true;
        if (importData) {
            importData.value = '';
        }
        if (detectedCount) {
            detectedCount.textContent = '0';
        }
        
        // 确保导入按钮可用
        if (confirmImportBtn) {
            confirmImportBtn.disabled = false;
            confirmImportBtn.textContent = '确认导入';
        }
    }

    // 加载单词
    async function loadWords() {
        try {
            console.log('开始从后端加载单词...');
            const words = await apiService.getWords();
            console.log('从后端获取到的单词:', words);
            
            // 转换后端数据为前端格式
            currentState.words = words.map(word => ({
                id: word.word_id,
                word: word.content,
                phonetic: '', // 后端暂无音标字段
                difficulty: 'medium', // 默认难度
                meanings: parseMeanings(word.meaning, word.speech),
                examples: [],
                related: []
            }));
            
            currentState.filteredWords = [...currentState.words];
            displayWords();
            updateStatistics();
            
            console.log('单词加载完成，共', currentState.words.length, '个单词');
        } catch (error) {
            console.error('加载单词失败:', error);
            alert('加载单词失败: ' + error.message);
        }
    }

    // 解析后端释义为前端格式
    function parseMeanings(meaning, speech) {
        // 简单解析，如果后端返回的是复合字符串，可以进一步处理
        return [{
            partOfSpeech: speech || 'n.',
            meaning: meaning
        }];
    }

    // 显示单词列表
    function displayWords() {
        if (listCount) {
            listCount.textContent = currentState.filteredWords.length;
        }

        if (currentState.filteredWords.length === 0) {
            if (wordsContainer) wordsContainer.classList.add('hidden');
            if (emptyState) emptyState.classList.remove('hidden');
            return;
        }

        if (wordsContainer) wordsContainer.classList.remove('hidden');
        if (emptyState) emptyState.classList.add('hidden');

        if (wordsContainer) {
            wordsContainer.innerHTML = currentState.filteredWords.map((word, index) => `
                <div class="word-item" data-word="${word.word}">
                    <div class="word-main">
                        <div class="word-header">
                            <span class="word-text">${word.word}</span>
                            <span class="word-phonetic">${word.phonetic}</span>
                            <span class="difficulty-tag ${word.difficulty}">${getDifficultyText(word.difficulty)}</span>
                        </div>
                        <div class="word-meanings">
                            ${word.meanings ? word.meanings.map(meaning => `
                                <div class="meaning-line">
                                    <span class="part-of-speech">${meaning.partOfSpeech}</span>
                                    <span>${meaning.meaning}</span>
                                </div>
                            `).join('') : ''}
                        </div>
                    </div>
                    <div class="word-actions">
                        <button class="small-btn primary edit-word" data-index="${index}">编辑</button>
                        <button class="small-btn danger delete-word" data-index="${index}">删除</button>
                    </div>
                </div>
            `).join('');

            // 添加事件监听
            document.querySelectorAll('.edit-word').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const index = parseInt(btn.dataset.index);
                    editWord(index);
                });
            });

            document.querySelectorAll('.delete-word').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const index = parseInt(btn.dataset.index);
                    deleteWord(index);
                });
            });
        }
    }

    // 更新统计信息
    function updateStatistics() {
        const words = currentState.words;
        const easyCount = words.filter(word => word.difficulty === 'easy').length;
        const mediumCount = words.filter(word => word.difficulty === 'medium').length;
        const hardCount = words.filter(word => word.difficulty === 'hard').length;

        if (totalWordCount) totalWordCount.textContent = words.length;
        if (easyWordCount) easyWordCount.textContent = easyCount;
        if (mediumWordCount) mediumWordCount.textContent = mediumCount;
        if (hardWordCount) hardWordCount.textContent = hardCount;
    }

    // 编辑单词
    function editWord(index) {
        const word = currentState.words[index];
        currentState.editingWord = { ...word, index };
        
        if (modalTitle) {
            modalTitle.textContent = '编辑单词';
        }
        fillWordForm(word);
        if (wordModal) {
            wordModal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
        modalState.wordModalOpen = true;
        
        // 确保保存按钮可用
        if (saveWordBtn) {
            saveWordBtn.disabled = false;
            saveWordBtn.textContent = '保存';
        }
    }

    // 填充单词表单
    function fillWordForm(word) {
        if (wordInput) wordInput.value = word.word;
        if (phoneticInput) phoneticInput.value = word.phonetic || '';
        if (difficultySelect) difficultySelect.value = word.difficulty || 'medium';
        
        // 格式化释义
        if (meaningsInput) {
            if (word.meanings) {
                meaningsInput.value = word.meanings.map(meaning => 
                    `${meaning.partOfSpeech}. ${meaning.meaning}`
                ).join('\n');
            } else {
                meaningsInput.value = '';
            }
        }
        
        // 格式化例句
        if (examplesInput) {
            if (word.examples) {
                examplesInput.value = word.examples.map(example => 
                    `${example.english}|${example.chinese}`
                ).join('\n');
            } else {
                examplesInput.value = '';
            }
        }
        
        // 格式化相关词汇
        if (relatedWordsInput) {
            if (word.related) {
                relatedWordsInput.value = word.related.join(', ');
            } else {
                relatedWordsInput.value = '';
            }
        }
    }

    // 清空单词表单
    function clearWordForm() {
        if (wordForm) wordForm.reset();
        if (meaningsInput) meaningsInput.value = '';
        if (examplesInput) examplesInput.value = '';
        if (relatedWordsInput) relatedWordsInput.value = '';
    }

    // 保存单词 - 添加防重复提交
    async function saveWord() {
        // 防止重复提交
        if (currentState.isSaving) {
            console.log('保存操作正在进行中，请等待...');
            return;
        }
        
        const wordData = collectWordData();
        
        if (!validateWordData(wordData)) {
            return;
        }

        try {
            // 设置保存状态
            currentState.isSaving = true;
            if (saveWordBtn) {
                saveWordBtn.disabled = true;
                saveWordBtn.textContent = '保存中...';
            }

            if (currentState.editingWord) {
                // 编辑现有单词
                console.log('更新单词:', currentState.editingWord.id, wordData);
                await apiService.updateWord(currentState.editingWord.id, wordData);
            } else {
                // 添加新单词
                console.log('添加新单词:', wordData);
                await apiService.addWord(wordData);
            }
            
            // 更新显示
            await loadWords();
            closeWordModal();
            
            alert('单词保存成功！');
        } catch (error) {
            console.error('保存单词失败:', error);
            alert('保存单词失败: ' + error.message);
            
            // 保存失败时恢复按钮状态
            if (saveWordBtn) {
                saveWordBtn.disabled = false;
                saveWordBtn.textContent = '保存';
            }
        } finally {
            // 无论成功失败，都重置保存状态
            currentState.isSaving = false;
        }
    }

    // 收集单词数据
    function collectWordData() {
        const word = wordInput ? wordInput.value.trim() : '';
        const phonetic = phoneticInput ? phoneticInput.value.trim() : '';
        const difficulty = difficultySelect ? difficultySelect.value : 'medium';
        
        // 解析释义
        const meanings = meaningsInput ? meaningsInput.value.split('\n')
            .filter(line => line.trim())
            .map(line => {
                const match = line.match(/^(\w+)\.\s*(.+)$/);
                if (match) {
                    return {
                        partOfSpeech: match[1],
                        meaning: match[2].trim()
                    };
                }
                return {
                    partOfSpeech: 'v.',
                    meaning: line.trim()
                };
            }) : [];
        
        // 解析例句
        const examples = examplesInput ? examplesInput.value.split('\n')
            .filter(line => line.trim())
            .map(line => {
                const [english, chinese] = line.split('|').map(s => s.trim());
                return {
                    english: english || '',
                    chinese: chinese || ''
                };
            }) : [];
        
        // 解析相关词汇
        const related = relatedWordsInput ? relatedWordsInput.value.split(',')
            .map(word => word.trim())
            .filter(word => word) : [];

        return {
            word,
            phonetic,
            difficulty,
            meanings,
            examples: examples.length > 0 ? examples : undefined,
            related: related.length > 0 ? related : undefined
        };
    }

    // 验证单词数据
    function validateWordData(wordData) {
        if (!wordData.word) {
            alert('请输入单词');
            return false;
        }

        if (wordData.meanings.length === 0) {
            alert('请输入至少一个释义');
            return false;
        }

        return true;
    }

    // 删除单词
    async function deleteWord(index) {
        const word = currentState.words[index];
        
        if (!confirm(`确定要删除单词 "${word.word}" 吗？此操作不可撤销。`)) {
            return;
        }

        try {
            await apiService.deleteWord(word.id);
            
            // 更新显示
            await loadWords();
            alert('单词删除成功！');
        } catch (error) {
            console.error('删除单词失败:', error);
            alert('删除单词失败: ' + error.message);
        }
    }

    // 检测导入的单词
    function detectImportWords() {
        const text = importData ? importData.value.trim() : '';
        if (!text) {
            if (detectedCount) detectedCount.textContent = '0';
            return;
        }

        const lines = text.split('\n').filter(line => line.trim());
        if (detectedCount) detectedCount.textContent = lines.length;
    }

    // 确认导入 - 添加防重复提交
    async function confirmImport() {
        // 防止重复提交
        if (currentState.isImporting) {
            console.log('导入操作正在进行中，请等待...');
            return;
        }

        const text = importData ? importData.value.trim() : '';
        if (!text) {
            alert('请输入要导入的数据');
            return;
        }

        const format = document.getElementById('importFormat') ? document.getElementById('importFormat').value : 'text';
        let importedWords = [];

        try {
            // 设置导入状态
            currentState.isImporting = true;
            if (confirmImportBtn) {
                confirmImportBtn.disabled = true;
                confirmImportBtn.textContent = '导入中...';
            }

            switch (format) {
                case 'text':
                    importedWords = parseTextFormat(text);
                    break;
                case 'json':
                    importedWords = JSON.parse(text);
                    break;
                case 'csv':
                    importedWords = parseCSVFormat(text);
                    break;
            }

            if (importedWords.length === 0) {
                alert('未检测到有效的单词数据');
                return;
            }

            let addedCount = 0;
            let errorCount = 0;

            for (const wordData of importedWords) {
                try {
                    // 检查单词是否已存在
                    const existingWords = await apiService.getWords();
                    const exists = existingWords.some(w => 
                        w.content.toLowerCase() === wordData.word.toLowerCase()
                    );
                    
                    if (!exists) {
                        await apiService.addWord(wordData);
                        addedCount++;
                    }
                } catch (error) {
                    console.error(`导入单词失败 ${wordData.word}:`, error);
                    errorCount++;
                }
            }

            // 更新显示
            await loadWords();
            closeImportModal();
            
            let message = `成功导入 ${addedCount} 个单词！`;
            if (errorCount > 0) {
                message += ` ${errorCount} 个单词导入失败。`;
            }
            alert(message);
            
        } catch (error) {
            alert('导入失败：' + error.message);
            
            // 导入失败时恢复按钮状态
            if (confirmImportBtn) {
                confirmImportBtn.disabled = false;
                confirmImportBtn.textContent = '确认导入';
            }
        } finally {
            // 无论成功失败，都重置导入状态
            currentState.isImporting = false;
        }
    }

    // 解析文本格式
    function parseTextFormat(text) {
        const lines = text.split('\n').filter(line => line.trim());
        return lines.map(line => {
            const parts = line.split('|').map(part => part.trim());
            return {
                word: parts[0] || '',
                phonetic: parts[1] || '',
                difficulty: parts[2] || 'medium',
                meanings: parts[3] ? parts[3].split(';').map(meaning => {
                    const match = meaning.match(/^(\w+)\.\s*(.+)$/);
                    return match ? {
                        partOfSpeech: match[1],
                        meaning: match[2]
                    } : {
                        partOfSpeech: 'v.',
                        meaning: meaning
                    };
                }) : [],
                examples: parts[4] && parts[5] ? [{
                    english: parts[4],
                    chinese: parts[5]
                }] : [],
                related: parts[6] ? parts[6].split(',').map(w => w.trim()) : []
            };
        });
    }

    // 解析CSV格式
    function parseCSVFormat(text) {
        // 简化的CSV解析
        const lines = text.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim());
        
        return lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim());
            const word = {};
            headers.forEach((header, index) => {
                word[header] = values[index];
            });
            return word;
        });
    }

    // 导出词库
    async function exportWordbook() {
        const words = currentState.words;
        if (words.length === 0) {
            alert('当前词库为空，无法导出');
            return;
        }

        try {
            const format = 'json';
            let data;

            switch (format) {
                case 'json':
                    data = JSON.stringify(words, null, 2);
                    break;
                case 'csv':
                    data = convertToCSV(words);
                    break;
                case 'text':
                    data = convertToText(words);
                    break;
            }

            // 创建下载链接
            const blob = new Blob([data], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `wordbook_export.${format}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('导出失败:', error);
            alert('导出失败，请重试。');
        }
    }

    // 转换为CSV格式
    function convertToCSV(words) {
        const headers = ['word', 'phonetic', 'difficulty', 'meanings', 'examples', 'related'];
        const csvLines = [headers.join(',')];
        
        words.forEach(word => {
            const row = [
                word.word,
                word.phonetic || '',
                word.difficulty,
                word.meanings ? word.meanings.map(m => `${m.partOfSpeech}.${m.meaning}`).join(';') : '',
                word.examples ? word.examples.map(e => `${e.english}|${e.chinese}`).join(';') : '',
                word.related ? word.related.join(',') : ''
            ];
            csvLines.push(row.map(field => `"${field}"`).join(','));
        });
        
        return csvLines.join('\n');
    }

    // 转换为文本格式
    function convertToText(words) {
        return words.map(word => {
            const parts = [
                word.word,
                word.phonetic || '',
                word.difficulty,
                word.meanings ? word.meanings.map(m => `${m.partOfSpeech}. ${m.meaning}`).join(';') : '',
                word.examples && word.examples[0] ? word.examples[0].english : '',
                word.examples && word.examples[0] ? word.examples[0].chinese : '',
                word.related ? word.related.join(',') : ''
            ];
            return parts.join('|');
        }).join('\n');
    }

    // 添加新词库
    async function addNewWordbook() {
        const name = prompt('请输入新词库名称：');
        if (!name) return;

        alert('词库功能在后端暂未实现，单词将添加到默认词库中');
    }

    // 搜索单词
    async function performSearch() {
        const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
        
        if (!query) {
            currentState.filteredWords = [...currentState.words];
        } else {
            try {
                // 使用后端搜索
                const searchResults = await apiService.searchWords(query);
                // 转换数据格式
                currentState.filteredWords = searchResults.map(word => ({
                    id: word.word_id,
                    word: word.content,
                    phonetic: '',
                    difficulty: 'medium',
                    meanings: parseMeanings(word.meaning, word.speech),
                    examples: [],
                    related: []
                }));
            } catch (error) {
                console.error('搜索失败:', error);
                // 回退到本地搜索
                currentState.filteredWords = currentState.words.filter(word => 
                    word.word.toLowerCase().includes(query) ||
                    word.phonetic?.toLowerCase().includes(query) ||
                    word.meanings?.some(meaning => 
                        meaning.meaning.toLowerCase().includes(query)
                    )
                );
            }
        }
        
        displayWords();
    }

    // 处理搜索输入
    function handleSearchInput() {
        // 防抖搜索
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            performSearch();
        }, 300);
    }

    // 工具函数
    function getDifficultyText(difficulty) {
        const difficultyMap = {
            'easy': '简单',
            'medium': '中等',
            'hard': '困难'
        };
        return difficultyMap[difficulty] || difficulty;
    }

    // 启动应用
    initializeApp();
});