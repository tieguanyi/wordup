// 单词背诵功能逻辑
document.addEventListener('DOMContentLoaded', async function() {
    // 页面元素
    const bookSelection = document.getElementById('bookSelection');
    const recitingMode = document.getElementById('recitingMode');
    const completionMessage = document.getElementById('completionMessage');
    const backBtn = document.getElementById('backBtn');
    
    // 单词显示元素
    const wordText = document.getElementById('wordText');
    const phonetic = document.getElementById('phonetic');
    const meaningSection = document.getElementById('meaningSection');
    const wordMeaning = document.getElementById('wordMeaning');
    const wordExample = document.getElementById('wordExample');
    
    // 按钮元素
    const showMeaningBtn = document.getElementById('showMeaningBtn');
    const feedbackButtons = document.getElementById('feedbackButtons');
    const knowBtn = document.getElementById('knowBtn');
    const dontKnowBtn = document.getElementById('dontKnowBtn');
    const soundBtn = document.getElementById('soundBtn');
    
    // 进度元素
    const progress = document.getElementById('progress');
    const progressFill = document.getElementById('progressFill');
    const todayLearned = document.getElementById('todayLearned');
    const accuracyRate = document.getElementById('accuracyRate');
    
    // 完成统计元素
    const completedWords = document.getElementById('completedWords');
    const finalAccuracy = document.getElementById('finalAccuracy');
    const newWrongWords = document.getElementById('newWrongWords');
    const reviewWrongBtn = document.getElementById('reviewWrongBtn');
    const continueBtn = document.getElementById('continueBtn');

    // 获取URL参数
    function getUrlParams() {
        const params = new URLSearchParams(window.location.search);
        return {
            task: params.get('task')
        };
    }

    const urlParams = getUrlParams();
    
    // 获取单词列表
    async function getWordList(bookType) {
        try {
            const wordbooks = await wordUpDB.getAllWordbooks();
            let targetWordbook;
            
            if (bookType === 'task') {
                // 任务模式使用默认词库
                targetWordbook = wordbooks.find(wb => wb.type === 'cet4');
            } else {
                targetWordbook = wordbooks.find(wb => wb.type === bookType);
            }
            
            if (targetWordbook) {
                const words = await wordUpDB.getWordsByWordbook(targetWordbook.id);
                // 随机打乱单词顺序
                return shuffleArray(words).slice(0, 20); // 限制为20个单词
            } else {
                return getDefaultWordList(bookType);
            }
        } catch (error) {
            console.error('获取单词列表失败:', error);
            return getDefaultWordList(bookType);
        }
    }

    // 默认单词列表（备用）
    function getDefaultWordList(bookType) {
        const defaultLists = {
            cet4: [
                {
                    word: "abandon",
                    phonetic: "/əˈbændən/",
                    meanings: [
                        {
                            partOfSpeech: "v.",
                            meaning: "放弃，遗弃",
                            examples: [
                                "He abandoned his car and ran away.",
                                "他弃车逃跑了。"
                            ]
                        }
                    ],
                    difficulty: "medium"
                },
                {
                    word: "ability",
                    phonetic: "/əˈbɪləti/",
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
                    difficulty: "easy"
                },
                {
                    word: "abnormal",
                    phonetic: "/æbˈnɔːrml/",
                    meanings: [
                        {
                            partOfSpeech: "adj.",
                            meaning: "反常的，异常的",
                            examples: [
                                "Such cold weather is abnormal for June.",
                                "这样冷的天气在六月份是不正常的。"
                            ]
                        }
                    ],
                    difficulty: "medium"
                },
                {
                    word: "abolish",
                    phonetic: "/əˈbɑːlɪʃ/",
                    meanings: [
                        {
                            partOfSpeech: "v.",
                            meaning: "废除，取消",
                            examples: [
                                "Slavery was abolished in the 19th century.",
                                "奴隶制在19世纪被废除。"
                            ]
                        }
                    ],
                    difficulty: "hard"
                },
                {
                    word: "abroad",
                    phonetic: "/əˈbrɔːd/",
                    meanings: [
                        {
                            partOfSpeech: "adv.",
                            meaning: "在国外，到国外",
                            examples: [
                                "She plans to study abroad next year.",
                                "她计划明年出国留学。"
                            ]
                        }
                    ],
                    difficulty: "easy"
                }
            ],
            cet6: [
                {
                    word: "abbreviation",
                    phonetic: "/əˌbriːviˈeɪʃn/",
                    meanings: [
                        {
                            partOfSpeech: "n.",
                            meaning: "缩写，缩写词",
                            examples: [
                                "UN is the abbreviation for United Nations.",
                                "UN是联合国的缩写。"
                            ]
                        }
                    ],
                    difficulty: "hard"
                },
                {
                    word: "abide",
                    phonetic: "/əˈbaɪd/",
                    meanings: [
                        {
                            partOfSpeech: "v.",
                            meaning: "遵守，忍受",
                            examples: [
                                "You must abide by the rules.",
                                "你必须遵守规则。"
                            ]
                        }
                    ],
                    difficulty: "medium"
                }
            ],
            task: [
                {
                    word: "abandon",
                    phonetic: "/əˈbændən/",
                    meanings: [
                        {
                            partOfSpeech: "v.",
                            meaning: "放弃，遗弃",
                            examples: [
                                "He abandoned his car and ran away.",
                                "他弃车逃跑了。"
                            ]
                        }
                    ],
                    difficulty: "medium"
                },
                {
                    word: "ability",
                    phonetic: "/əˈbɪləti/",
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
                    difficulty: "easy"
                }
            ]
        };
        
        return defaultLists[bookType] || defaultLists.cet4;
    }
    
    // 学习状态
    let currentState = {
        currentWordIndex: 0,
        knownWords: 0,
        unknownWords: 0,
        wrongWords: [],
        isMeaningShown: false,
        selectedBook: null,
        wordList: []
    };
    
    // 初始化事件监听
    function initEventListeners() {
        console.log('初始化事件监听...');
        
        // 词书选择
        document.querySelectorAll('.book-card').forEach(card => {
            card.addEventListener('click', () => selectBook(card.dataset.book));
        });
        
        // 返回按钮
        backBtn.addEventListener('click', goBack);
        
        // 显示释义按钮
        showMeaningBtn.addEventListener('click', showMeaning);
        
        // 反馈按钮
        knowBtn.addEventListener('click', () => handleFeedback(true));
        dontKnowBtn.addEventListener('click', () => handleFeedback(false));
        
        // 发音按钮
        soundBtn.addEventListener('click', playSound);
        
        // 完成页面按钮
        reviewWrongBtn.addEventListener('click', reviewWrongWords);
        continueBtn.addEventListener('click', continueLearning);
        
        console.log('事件监听初始化完成');
    }

    // 初始化显示
    function initDisplay() {
        console.log('初始化显示...');
        // 检查是否是任务模式
        if (urlParams.task) {
            console.log('检测到任务模式，任务ID:', urlParams.task);
            loadTaskWords(urlParams.task);
        } else {
            console.log('自由学习模式');
        }
    }
    
    // 选择词书
    async function selectBook(bookType) {
        console.log('选择词书:', bookType);
        currentState.selectedBook = bookType;
        currentState.wordList = await getWordList(bookType);
        bookSelection.classList.add('hidden');
        recitingMode.classList.remove('hidden');
        loadNextWord();
    }
    
    // 返回上一页
    function goBack() {
        if (recitingMode.classList.contains('hidden') === false) {
            if (confirm('确定要退出吗？当前进度将不会保存。')) {
                if (currentState.selectedBook) {
                    // 返回词书选择
                    recitingMode.classList.add('hidden');
                    bookSelection.classList.remove('hidden');
                    resetState();
                } else {
                    // 返回学生主页
                    window.location.href = 'student.html';
                }
            }
        } else {
            window.location.href = 'student.html';
        }
    }
    
    // 重置状态
    function resetState() {
        currentState = {
            currentWordIndex: 0,
            knownWords: 0,
            unknownWords: 0,
            wrongWords: [],
            isMeaningShown: false,
            selectedBook: currentState.selectedBook,
            wordList: currentState.wordList
        };
        console.log('状态已重置');
    }
    
    // 加载下一个单词
    function loadNextWord() {
        console.log('加载下一个单词，当前索引:', currentState.currentWordIndex, '总单词数:', currentState.wordList.length);
        
        if (currentState.currentWordIndex >= currentState.wordList.length) {
            console.log('所有单词学习完成，显示完成页面');
            showCompletion();
            return;
        }
        
        const word = currentState.wordList[currentState.currentWordIndex];
        console.log('显示单词:', word.word);
        displayWord(word);
        updateProgress();
    }
    
    // 显示单词
    function displayWord(word) {
        console.log('显示单词详情:', word.word);
        
        // 重置状态
        meaningSection.classList.add('hidden');
        feedbackButtons.classList.add('hidden');
        showMeaningBtn.classList.remove('hidden');
        currentState.isMeaningShown = false;
        
        // 更新内容
        wordText.textContent = word.word;
        phonetic.textContent = word.phonetic;
        
        // 显示第一个释义作为主要释义
        const primaryMeaning = word.meanings[0];
        wordMeaning.textContent = primaryMeaning.meaning;
        
        // 显示第一个例句（如果有）
        if (primaryMeaning.examples && primaryMeaning.examples.length > 0) {
            wordExample.textContent = primaryMeaning.examples[0];
        } else {
            wordExample.textContent = "暂无例句";
        }
        
        // 更新难度标签
        const difficultyTag = document.querySelector('.difficulty-tag');
        if (difficultyTag) {
            difficultyTag.textContent = getDifficultyText(word.difficulty);
            difficultyTag.className = 'difficulty-tag ' + word.difficulty;
        }
        
        console.log('单词显示完成');
    }
    
    // 显示释义
    function showMeaning() {
        console.log('显示单词释义');
        meaningSection.classList.remove('hidden');
        feedbackButtons.classList.remove('hidden');
        showMeaningBtn.classList.add('hidden');
        currentState.isMeaningShown = true;
    }
    
    // 处理用户反馈
    function handleFeedback(isKnown) {
        console.log('处理用户反馈，是否认识:', isKnown);
        const currentWord = currentState.wordList[currentState.currentWordIndex];
        
        if (isKnown) {
            currentState.knownWords++;
            console.log('认识这个单词，已知单词数:', currentState.knownWords);
        } else {
            currentState.unknownWords++;
            currentState.wrongWords.push(currentWord);
            console.log('不认识这个单词，未知单词数:', currentState.unknownWords, '错题数:', currentState.wrongWords.length);
            
            // 保存到错题本
            saveToWrongWords(currentWord);
        }
        
        currentState.currentWordIndex++;
        
        // 更新任务进度（如果是任务模式）
        if (urlParams.task) {
            const progress = Math.round((currentState.currentWordIndex / currentState.wordList.length) * 100);
            console.log('更新任务进度:', progress + '%');
            updateTaskProgress(urlParams.task, 'in_progress', progress);
        }
        
        loadNextWord();
    }
    
    // 保存到错题本
    function saveToWrongWords(word) {
        console.log('保存到错题本:', word.word);
        // 获取现有的错题数据
        let wrongWords = JSON.parse(localStorage.getItem('wrongWords')) || [];
        
        // 检查单词是否已经在错题本中
        const existingWordIndex = wrongWords.findIndex(w => w.word === word.word);
        
        if (existingWordIndex !== -1) {
            // 更新现有单词的错误次数
            wrongWords[existingWordIndex].wrongCount += 1;
            wrongWords[existingWordIndex].lastWrongTime = new Date().toISOString();
            wrongWords[existingWordIndex].consecutiveCorrect = 0; // 重置连续正确次数
            wrongWords[existingWordIndex].mastered = false; // 重置掌握状态
            console.log('更新现有错题:', word.word);
        } else {
            // 添加新单词到错题本
            wrongWords.push({
                word: word.word,
                phonetic: word.phonetic,
                meanings: word.meanings,
                difficulty: word.difficulty,
                wrongCount: 1,
                lastWrongTime: new Date().toISOString(),
                reviewCount: 0,
                consecutiveCorrect: 0,
                mastered: false
            });
            console.log('添加新错题:', word.word);
        }
        
        // 保存回 localStorage
        localStorage.setItem('wrongWords', JSON.stringify(wrongWords));
        console.log('错题本保存完成');
    }
    
    // 播放发音
    function playSound() {
        console.log('播放单词发音:', wordText.textContent);
        // 简单的发音模拟 - 实际项目中可以使用Web Speech API
        const utterance = new SpeechSynthesisUtterance(wordText.textContent);
        utterance.lang = 'en-US';
        utterance.rate = 0.8;
        speechSynthesis.speak(utterance);
    }
    
    // 更新进度
    function updateProgress() {
        console.log('更新进度...');
        
        // 计算进度百分比
        const progressPercent = (currentState.currentWordIndex / currentState.wordList.length) * 100;
        console.log('进度百分比:', progressPercent + '%');
        
        // 更新进度条
        if (progressFill) {
            progressFill.style.width = `${progressPercent}%`;
            console.log('进度条宽度设置为:', progressFill.style.width);
        } else {
            console.error('进度条元素未找到');
        }
        
        // 更新进度文本
        if (progress) {
            progress.textContent = `进度: ${currentState.currentWordIndex}/${currentState.wordList.length}`;
            console.log('进度文本设置为:', progress.textContent);
        } else {
            console.error('进度文本元素未找到');
        }
        
        // 计算今日已学和正确率
        const totalAnswered = currentState.knownWords + currentState.unknownWords;
        const accuracy = totalAnswered > 0 ? Math.round((currentState.knownWords / totalAnswered) * 100) : 0;
        
        console.log('总答题数:', totalAnswered, '正确率:', accuracy + '%');
        
        // 更新今日已学
        if (todayLearned) {
            todayLearned.textContent = totalAnswered;
            console.log('今日已学设置为:', todayLearned.textContent);
        } else {
            console.error('今日已学元素未找到');
        }
        
        // 更新正确率
        if (accuracyRate) {
            accuracyRate.textContent = `${accuracy}%`;
            console.log('正确率设置为:', accuracyRate.textContent);
        } else {
            console.error('正确率元素未找到');
        }
        
        console.log('进度更新完成');
    }
    
    // 显示完成页面
    function showCompletion() {
        console.log('显示完成页面');
        recitingMode.classList.add('hidden');
        completionMessage.classList.remove('hidden');
        
        const totalWords = currentState.wordList.length;
        const accuracy = Math.round((currentState.knownWords / totalWords) * 100);
        
        if (completedWords) completedWords.textContent = totalWords;
        if (finalAccuracy) finalAccuracy.textContent = `${accuracy}%`;
        if (newWrongWords) newWrongWords.textContent = currentState.wrongWords.length;
        
        console.log('完成统计 - 总单词:', totalWords, '正确率:', accuracy + '%, 错题:', currentState.wrongWords.length);
        
        // 更新任务进度（如果是任务模式）
        if (urlParams.task) {
            console.log('标记任务完成');
            updateTaskProgress(urlParams.task, 'completed', 100, accuracy);
        }
    }
    
    // 复习错题
    function reviewWrongWords() {
        console.log('开始复习错题');
        if (currentState.wrongWords.length === 0) {
            alert('没有错题需要复习！');
            return;
        }
        
        // 用错题列表替换单词列表
        currentState.wordList = [...currentState.wrongWords];
        
        // 重置状态重新开始
        currentState.currentWordIndex = 0;
        currentState.knownWords = 0;
        currentState.unknownWords = 0;
        currentState.wrongWords = [];
        currentState.isMeaningShown = false;
        currentState.selectedBook = 'review';
        
        completionMessage.classList.add('hidden');
        recitingMode.classList.remove('hidden');
        loadNextWord();
    }
    
    // 继续学习
    function continueLearning() {
        console.log('继续学习');
        resetState();
        completionMessage.classList.add('hidden');
        bookSelection.classList.remove('hidden');
    }

    // 加载任务单词
    async function loadTaskWords(taskId) {
        console.log('加载任务单词，任务ID:', taskId);
        const tasks = JSON.parse(localStorage.getItem('teacherTasks')) || [];
        const task = tasks.find(t => t.id === taskId);
        
        if (!task) {
            alert('任务不存在');
            goBack();
            return;
        }
        
        // 使用任务的单词列表
        if (task.words && task.words.length > 0) {
            currentState.wordList = task.words.map(word => ({
                word: word.word,
                phonetic: word.phonetic,
                meanings: word.meanings,
                difficulty: word.difficulty
            }));
            console.log('加载了', currentState.wordList.length, '个任务单词');
        } else {
            // 如果没有指定单词，使用默认词库
            console.log('任务没有单词，使用默认单词列表');
            currentState.wordList = await getWordList('cet4');
        }
        
        // 更新状态
        currentState.selectedBook = 'task';
        
        // 隐藏词书选择，显示背诵模式
        bookSelection.classList.add('hidden');
        recitingMode.classList.remove('hidden');
        
        // 更新进度显示
        if (progress) {
            progress.textContent = `进度: 0/${currentState.wordList.length}`;
        }
        
        // 开始背诵
        loadNextWord();
        
        // 更新任务进度
        updateTaskProgress(taskId, 'in_progress', 0);
    }

    // 更新任务进度
    function updateTaskProgress(taskId, status, progress, score = null) {
        console.log('更新任务进度:', taskId, status, progress, score);
        const studentProgress = JSON.parse(localStorage.getItem('studentTaskProgress')) || {};
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        if (!currentUser) {
            console.error('用户未登录');
            return;
        }
        
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
        console.log('任务进度已保存');
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

    // 工具函数：打乱数组
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    // 初始化
    console.log('开始初始化单词背诵页面...');
    await wordUpDB.init();
    initEventListeners();
    initDisplay();
    console.log('单词背诵页面初始化完成');
});