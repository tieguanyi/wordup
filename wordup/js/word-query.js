// 生词查询功能逻辑 - 使用后端API
document.addEventListener('DOMContentLoaded', async function() {
    // 页面元素
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const voiceSearchBtn = document.getElementById('voiceSearchBtn');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    const searchSuggestions = document.getElementById('searchSuggestions');
    const suggestionsList = document.getElementById('suggestionsList');
    const searchResults = document.getElementById('searchResults');
    const noResults = document.getElementById('noResults');
    const searchHistory = document.getElementById('searchHistory');
    const historyList = document.getElementById('historyList');
    const wordBookSection = document.getElementById('wordBookSection');
    const wordBookList = document.getElementById('wordBookList');
    const backBtn = document.getElementById('backBtn');
    
    // 结果展示元素
    const resultWord = document.getElementById('resultWord');
    const wordSoundBtn = document.getElementById('wordSoundBtn');
    const addToWordBook = document.getElementById('addToWordBook');
    const resultPhonetic = document.getElementById('resultPhonetic');
    const resultDifficulty = document.getElementById('resultDifficulty');
    const meaningsList = document.getElementById('meaningsList');
    const examplesList = document.getElementById('examplesList');
    const relatedWords = document.getElementById('relatedWords');
    
    // 切换按钮
    const toggleHistory = document.getElementById('toggleHistory');
    const toggleWordBook = document.getElementById('toggleWordBook');

    // 应用状态
    let currentState = {
        searchHistory: JSON.parse(localStorage.getItem('searchHistory')) || [],
        wordBook: JSON.parse(localStorage.getItem('wordBook')) || [],
        currentWord: null
    };

    // 初始化应用
    async function initializeApp() {
        try {
            console.log('初始化生词查询页面...');
            
            // 检查认证
            if (!authManager.isLoggedIn()) {
                window.location.href = 'index.html';
                return;
            }
            
            initEventListeners();
            initDisplay();
            
            console.log('生词查询页面初始化完成');
        } catch (error) {
            console.error('初始化失败:', error);
            alert('页面初始化失败: ' + error.message);
        }
    }

    // 获取单词数据库（从后端API）
    async function getWordDatabase() {
        try {
            const words = await apiService.getWords();
            console.log('从后端获取单词数据:', words.length, '个单词');
            
            // 转换后端数据为前端格式
            return words.map(word => ({
                word: word.content,
                phonetic: '', // 后端暂无音标
                difficulty: 'medium', // 默认难度
                meanings: [{
                    partOfSpeech: word.speech || 'n.',
                    meaning: word.meaning
                }],
                examples: [],
                related: []
            }));
        } catch (error) {
            console.error('获取单词数据库失败:', error);
            return getDefaultWordDatabase();
        }
    }

    // 默认单词数据库（备用）
    function getDefaultWordDatabase() {
        return [
            {
                word: "abandon",
                phonetic: "/əˈbændən/",
                difficulty: "medium",
                meanings: [
                    {
                        partOfSpeech: "v.",
                        meaning: "放弃，遗弃",
                        examples: [
                            "He abandoned his car and ran away.",
                            "他弃车逃跑了。"
                        ]
                    },
                    {
                        partOfSpeech: "n.",
                        meaning: "放纵，放任",
                        examples: [
                            "They danced with wild abandon.",
                            "他们疯狂地跳舞。"
                        ]
                    }
                ],
                related: ["abandoned", "abandonment", "forsake"]
            },
            {
                word: "ability",
                phonetic: "/əˈbɪləti/",
                difficulty: "easy",
                meanings: [
                    {
                        partOfSpeech: "n.",
                        meaning: "能力，才能",
                        examples: [
                            "She has the ability to speak three languages.",
                            "她有说三种语言的能力。"
                        ]
                    }
                ],
                related: ["able", "capability", "skill"]
            }
        ];
    }

    // 初始化事件监听
    function initEventListeners() {
        // 搜索功能
        if (searchBtn) {
            searchBtn.addEventListener('click', performSearch);
        }
        if (searchInput) {
            searchInput.addEventListener('input', handleInput);
            searchInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    performSearch();
                }
            });
        }

        // 语音搜索（模拟）
        if (voiceSearchBtn) {
            voiceSearchBtn.addEventListener('click', simulateVoiceSearch);
        }

        // 清除历史
        if (clearHistoryBtn) {
            clearHistoryBtn.addEventListener('click', clearSearchHistory);
        }

        // 单词操作
        if (wordSoundBtn) {
            wordSoundBtn.addEventListener('click', playWordSound);
        }
        if (addToWordBook) {
            addToWordBook.addEventListener('click', toggleWordBookStatus);
        }

        // 导航和切换
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                window.location.href = 'student.html';
            });
        }

        if (toggleHistory) {
            toggleHistory.addEventListener('click', () => {
                if (searchHistory) {
                    searchHistory.classList.toggle('collapsed');
                    toggleHistory.textContent = searchHistory.classList.contains('collapsed') ? '展开' : '收起';
                }
            });
        }

        if (toggleWordBook) {
            toggleWordBook.addEventListener('click', () => {
                if (wordBookSection) {
                    wordBookSection.classList.toggle('collapsed');
                    toggleWordBook.textContent = wordBookSection.classList.contains('collapsed') ? '展开' : '收起';
                }
            });
        }
    }

    // 处理输入事件
    function handleInput() {
        const query = searchInput.value.trim();
        
        if (query.length === 0) {
            if (searchSuggestions) searchSuggestions.classList.add('hidden');
            return;
        }

        // 显示搜索建议
        showSearchSuggestions(query);
    }

    // 显示搜索建议
    async function showSearchSuggestions(query) {
        try {
            const wordDatabase = await getWordDatabase();
            const suggestions = wordDatabase.filter(word => 
                word.word.toLowerCase().includes(query.toLowerCase()) ||
                word.meanings.some(meaning => 
                    meaning.meaning.includes(query)
                )
            ).slice(0, 5); // 最多显示5个建议

            if (suggestions.length > 0 && suggestionsList) {
                suggestionsList.innerHTML = suggestions.map(word => `
                    <div class="suggestion-item" data-word="${word.word}">
                        <strong>${word.word}</strong> - ${word.meanings[0].meaning}
                    </div>
                `).join('');

                // 添加建议项点击事件
                document.querySelectorAll('.suggestion-item').forEach(item => {
                    item.addEventListener('click', function() {
                        searchInput.value = this.dataset.word;
                        performSearch();
                    });
                });

                if (searchSuggestions) searchSuggestions.classList.remove('hidden');
            } else {
                if (searchSuggestions) searchSuggestions.classList.add('hidden');
            }
        } catch (error) {
            console.error('显示搜索建议失败:', error);
            if (searchSuggestions) searchSuggestions.classList.add('hidden');
        }
    }

    // 执行搜索
    async function performSearch() {
        const query = searchInput.value.trim();
        
        if (query.length === 0) {
            alert('请输入要查询的单词或释义');
            return;
        }

        // 隐藏建议
        if (searchSuggestions) searchSuggestions.classList.add('hidden');

        try {
            // 搜索单词
            const wordDatabase = await getWordDatabase();
            const result = wordDatabase.find(word => 
                word.word.toLowerCase() === query.toLowerCase() ||
                word.meanings.some(meaning => 
                    meaning.meaning === query
                )
            );

            if (result) {
                displayWordResult(result);
                addToSearchHistory(result.word);
            } else {
                showNoResults();
            }

            updateDisplay();
        } catch (error) {
            console.error('搜索失败:', error);
            showNoResults();
        }
    }

    // 显示单词结果
    function displayWordResult(word) {
        currentState.currentWord = word;
        
        // 更新基本信息
        if (resultWord) resultWord.textContent = word.word;
        if (resultPhonetic) resultPhonetic.textContent = word.phonetic;
        if (resultDifficulty) resultDifficulty.textContent = getDifficultyText(word.difficulty);

        // 更新释义
        if (meaningsList) {
            meaningsList.innerHTML = word.meanings.map(meaning => `
                <div class="meaning-item">
                    <span class="part-of-speech">${meaning.partOfSpeech}</span>
                    <span class="meaning-text">${meaning.meaning}</span>
                </div>
            `).join('');
        }

        // 更新例句
        if (examplesList) {
            examplesList.innerHTML = word.meanings.flatMap(meaning => 
                meaning.examples ? meaning.examples.filter((_, index) => index % 2 === 0).map((example, i) => {
                    const translation = meaning.examples[i * 2 + 1];
                    return `
                        <div class="example-item">
                            <div class="example-english">${example}</div>
                            <div class="example-chinese">${translation}</div>
                        </div>
                    `;
                }) : []
            ).join('');
        }

        // 更新相关词汇
        if (relatedWords) {
            if (word.related && word.related.length > 0) {
                relatedWords.innerHTML = word.related.map(relatedWord => `
                    <div class="related-word" data-word="${relatedWord}">${relatedWord}</div>
                `).join('');

                // 添加相关词汇点击事件
                document.querySelectorAll('.related-word').forEach(item => {
                    item.addEventListener('click', function() {
                        searchInput.value = this.dataset.word;
                        performSearch();
                    });
                });
            } else {
                relatedWords.innerHTML = '<div class="no-related">暂无相关词汇</div>';
            }
        }

        // 更新生词本按钮状态
        updateBookmarkButton();

        // 显示结果
        if (searchResults) searchResults.classList.remove('hidden');
        if (noResults) noResults.classList.add('hidden');
    }

    // 显示无结果
    function showNoResults() {
        if (searchResults) searchResults.classList.add('hidden');
        if (noResults) noResults.classList.remove('hidden');
    }

    // 添加到搜索历史
    function addToSearchHistory(word) {
        // 移除重复项
        currentState.searchHistory = currentState.searchHistory.filter(
            item => item.word !== word
        );
        
        // 添加到历史开头
        currentState.searchHistory.unshift({
            word: word,
            timestamp: new Date().toLocaleString()
        });

        // 限制历史记录数量
        if (currentState.searchHistory.length > 10) {
            currentState.searchHistory = currentState.searchHistory.slice(0, 10);
        }

        // 保存到本地存储
        localStorage.setItem('searchHistory', JSON.stringify(currentState.searchHistory));
    }

    // 更新生词本按钮状态
    function updateBookmarkButton() {
        if (!currentState.currentWord || !addToWordBook) return;

        const isInWordBook = currentState.wordBook.some(
            item => item.word === currentState.currentWord.word
        );

        if (isInWordBook) {
            addToWordBook.textContent = '⭐ 已添加';
            addToWordBook.classList.add('added');
        } else {
            addToWordBook.textContent = '⭐ 加入生词本';
            addToWordBook.classList.remove('added');
        }
    }

    // 切换生词本状态
    function toggleWordBookStatus() {
        if (!currentState.currentWord) return;

        const wordIndex = currentState.wordBook.findIndex(
            item => item.word === currentState.currentWord.word
        );

        if (wordIndex === -1) {
            // 添加到生词本
            currentState.wordBook.push({
                word: currentState.currentWord.word,
                phonetic: currentState.currentWord.phonetic,
                meaning: currentState.currentWord.meanings[0].meaning,
                addedAt: new Date().toLocaleString()
            });
        } else {
            // 从生词本移除
            currentState.wordBook.splice(wordIndex, 1);
        }

        // 保存到本地存储
        localStorage.setItem('wordBook', JSON.stringify(currentState.wordBook));
        
        // 更新显示
        updateBookmarkButton();
        updateDisplay();
    }

    // 播放单词发音
    function playWordSound() {
        if (!currentState.currentWord) return;

        const utterance = new SpeechSynthesisUtterance(currentState.currentWord.word);
        utterance.lang = 'en-US';
        utterance.rate = 0.8;
        speechSynthesis.speak(utterance);
    }

    // 模拟语音搜索
    async function simulateVoiceSearch() {
        try {
            const wordDatabase = await getWordDatabase();
            const sampleWords = wordDatabase.slice(0, 4).map(word => word.word);
            const randomWord = sampleWords[Math.floor(Math.random() * sampleWords.length)];
            
            searchInput.value = randomWord;
            performSearch();
        } catch (error) {
            console.error('语音搜索失败:', error);
            searchInput.value = 'abandon';
            performSearch();
        }
    }

    // 清除搜索历史
    function clearSearchHistory() {
        if (confirm('确定要清除所有搜索历史吗？')) {
            currentState.searchHistory = [];
            localStorage.setItem('searchHistory', JSON.stringify(currentState.searchHistory));
            updateDisplay();
        }
    }

    // 更新显示
    function updateDisplay() {
        // 更新搜索历史
        updateHistoryDisplay();
        
        // 更新生词本
        updateWordBookDisplay();
    }

    // 更新历史显示
    function updateHistoryDisplay() {
        if (!historyList) return;

        if (currentState.searchHistory.length === 0) {
            historyList.innerHTML = '<p style="color: #666; text-align: center;">暂无搜索历史</p>';
            return;
        }

        historyList.innerHTML = currentState.searchHistory.map(item => `
            <div class="history-item">
                <span class="history-word" data-word="${item.word}">${item.word}</span>
                <span class="history-time">${item.timestamp}</span>
            </div>
        `).join('');

        // 添加历史项点击事件
        document.querySelectorAll('.history-word').forEach(item => {
            item.addEventListener('click', function() {
                searchInput.value = this.dataset.word;
                performSearch();
            });
        });
    }

    // 更新生词本显示
    function updateWordBookDisplay() {
        if (!wordBookList) return;

        if (currentState.wordBook.length === 0) {
            wordBookList.innerHTML = '<p style="color: #666; text-align: center;">生词本为空，快去添加单词吧！</p>';
            return;
        }

        wordBookList.innerHTML = currentState.wordBook.map(item => `
            <div class="wordbook-item">
                <div>
                    <span class="wordbook-word" data-word="${item.word}">
                        <strong>${item.word}</strong> 
                        <span style="color: #666; margin-left: 10px;">${item.phonetic}</span>
                    </span>
                    <div style="color: #666; font-size: 14px; margin-top: 5px;">${item.meaning}</div>
                </div>
                <button class="remove-btn" data-word="${item.word}">移除</button>
            </div>
        `).join('');

        // 添加生词本单词点击事件
        document.querySelectorAll('.wordbook-word').forEach(item => {
            item.addEventListener('click', function() {
                searchInput.value = this.dataset.word;
                performSearch();
            });
        });

        // 添加移除按钮点击事件
        document.querySelectorAll('.remove-btn').forEach(button => {
            button.addEventListener('click', function() {
                const wordToRemove = this.dataset.word;
                currentState.wordBook = currentState.wordBook.filter(
                    item => item.word !== wordToRemove
                );
                localStorage.setItem('wordBook', JSON.stringify(currentState.wordBook));
                updateDisplay();
                
                // 如果当前显示的就是被移除的单词，更新按钮状态
                if (currentState.currentWord && currentState.currentWord.word === wordToRemove) {
                    updateBookmarkButton();
                }
            });
        });
    }

    // 工具函数：获取难度文本
    function getDifficultyText(difficulty) {
        const difficultyMap = {
            'easy': '简单',
            'medium': '中等',
            'hard': '困难'
        };
        return difficultyMap[difficulty] || difficulty;
    }

    // 初始化显示
    function initDisplay() {
        updateDisplay();
    }

    // 启动应用
    initializeApp();
});