// 错题本功能逻辑
document.addEventListener('DOMContentLoaded', function() {
    // 页面元素
    const backBtn = document.getElementById('backBtn');
    const startReview = document.getElementById('startReview');
    const quickTest = document.getElementById('quickTest');
    const filterSelect = document.getElementById('filterSelect');
    const clearAllBtn = document.getElementById('clearAllBtn');
    const wordsContainer = document.getElementById('wordsContainer');
    const emptyState = document.getElementById('emptyState');
    const reviewMode = document.getElementById('reviewMode');
    const completionPage = document.getElementById('completionPage');
    
    // 统计元素
    const totalWrongWords = document.getElementById('totalWrongWords');
    const todayReviewed = document.getElementById('todayReviewed');
    const masteredWords = document.getElementById('masteredWords');
    const accuracyRate = document.getElementById('accuracyRate');
    const listCount = document.getElementById('listCount');
    
    // 复习模式元素
    const exitReview = document.getElementById('exitReview');
    const reviewProgress = document.getElementById('reviewProgress');
    const reviewWord = document.getElementById('reviewWord');
    const reviewSoundBtn = document.getElementById('reviewSoundBtn');
    const meaningOptions = document.getElementById('meaningOptions');
    const reviewFeedback = document.getElementById('reviewFeedback');
    const correctMeaning = document.getElementById('correctMeaning');
    const reviewPhonetic = document.getElementById('reviewPhonetic');
    const reviewExample = document.getElementById('reviewExample');
    const nextWordBtn = document.getElementById('nextWordBtn');
    const correctCount = document.getElementById('correctCount');
    const wrongCount = document.getElementById('wrongCount');
    const reviewAccuracy = document.getElementById('reviewAccuracy');
    
    // 完成页面元素
    const finalCorrect = document.getElementById('finalCorrect');
    const finalWrong = document.getElementById('finalWrong');
    const finalAccuracy = document.getElementById('finalAccuracy');
    const reviewAgainBtn = document.getElementById('reviewAgainBtn');
    const backToListBtn = document.getElementById('backToListBtn');

    // 错题数据
    let wrongWordsData = JSON.parse(localStorage.getItem('wrongWords')) || [];
    let reviewStats = JSON.parse(localStorage.getItem('reviewStats')) || {
        totalReviewed: 0,
        todayReviewed: 0,
        masteredCount: 0,
        totalCorrect: 0,
        totalAttempts: 0
    };

    // 复习状态
    let reviewState = {
        isReviewing: false,
        currentIndex: 0,
        reviewWords: [],
        currentWord: null,
        correctAnswers: 0,
        wrongAnswers: 0,
        selectedOption: null
    };

    // 模拟单词数据库（用于生成干扰选项）
    const wordDatabase = [
        { word: "ability", meaning: "能力，才能" },
        { word: "abnormal", meaning: "反常的，异常的" },
        { word: "abolish", meaning: "废除，取消" },
        { word: "abroad", meaning: "在国外，到国外" },
        { word: "abundant", meaning: "丰富的，充裕的" },
        { word: "academy", meaning: "学院，研究院" },
        { word: "accelerate", meaning: "加速，促进" },
        { word: "accent", meaning: "口音，重音" },
        { word: "accept", meaning: "接受，同意" },
        { word: "access", meaning: "通道，使用权" }
    ];

    // 初始化事件监听
    function initEventListeners() {
        // 导航
        backBtn.addEventListener('click', () => {
            window.location.href = 'student.html';
        });

        // 主要操作
        startReview.addEventListener('click', startReviewSession);
        quickTest.addEventListener('click', startQuickTest);
        clearAllBtn.addEventListener('click', clearAllWrongWords);
        filterSelect.addEventListener('change', updateWordList);

        // 复习模式
        exitReview.addEventListener('click', exitReviewMode);
        reviewSoundBtn.addEventListener('click', playWordSound);
        nextWordBtn.addEventListener('click', loadNextReviewWord);

        // 完成页面
        reviewAgainBtn.addEventListener('click', startReviewSession);
        backToListBtn.addEventListener('click', backToWordList);
    }

    // 初始化显示
    function initDisplay() {
        updateStatistics();
        updateWordList();
    }

    // 更新统计信息
    function updateStatistics() {
        const total = wrongWordsData.length;
        const mastered = wrongWordsData.filter(word => word.mastered).length;
        const accuracy = reviewStats.totalAttempts > 0 ? 
            Math.round((reviewStats.totalCorrect / reviewStats.totalAttempts) * 100) : 0;

        totalWrongWords.textContent = total;
        masteredWords.textContent = mastered;
        accuracyRate.textContent = `${accuracy}%`;
        todayReviewed.textContent = reviewStats.todayReviewed;

        // 更新今日复习数（如果过了一天就重置）
        const today = new Date().toDateString();
        const lastReviewDate = localStorage.getItem('lastReviewDate');
        if (lastReviewDate !== today) {
            reviewStats.todayReviewed = 0;
            localStorage.setItem('reviewStats', JSON.stringify(reviewStats));
            localStorage.setItem('lastReviewDate', today);
        }
    }

    // 更新单词列表
    function updateWordList() {
        const filter = filterSelect.value;
        let filteredWords = [...wrongWordsData];

        switch (filter) {
            case 'today':
                const today = new Date().toDateString();
                filteredWords = wrongWordsData.filter(word => 
                    new Date(word.lastWrongTime).toDateString() === today
                );
                break;
            case 'week':
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                filteredWords = wrongWordsData.filter(word => 
                    new Date(word.lastWrongTime) >= weekAgo
                );
                break;
            case 'difficult':
                filteredWords = wrongWordsData.filter(word => word.wrongCount >= 3);
                break;
            case 'mastered':
                filteredWords = wrongWordsData.filter(word => word.mastered);
                break;
        }

        displayWordList(filteredWords);
    }

    // 显示单词列表
    function displayWordList(words) {
        listCount.textContent = words.length;

        if (words.length === 0) {
            wordsContainer.classList.add('hidden');
            emptyState.classList.remove('hidden');
            return;
        }

        wordsContainer.classList.remove('hidden');
        emptyState.classList.add('hidden');

        wordsContainer.innerHTML = words.map(word => `
            <div class="word-card" data-word="${word.word}">
                <div class="word-header">
                    <div class="word-basic">
                        <span class="word-text">${word.word}</span>
                        <span class="word-phonetic">${word.phonetic}</span>
                        <div class="word-tags">
                            <span class="word-tag difficulty-${word.difficulty}">${getDifficultyText(word.difficulty)}</span>
                            <span class="word-tag">错误 ${word.wrongCount} 次</span>
                            ${word.mastered ? '<span class="word-tag" style="background: #d4edda; color: #155724;">已掌握</span>' : ''}
                        </div>
                    </div>
                    <div class="word-actions">
                        <button class="small-btn primary practice-btn" data-word="${word.word}">练习</button>
                        <button class="small-btn danger remove-btn" data-word="${word.word}">移除</button>
                    </div>
                </div>
                <div class="word-details">
                    <div class="meanings">
                        ${word.meanings.map(meaning => `
                            <div class="meaning-item">
                                <span class="part-of-speech">${meaning.partOfSpeech}</span>
                                <span>${meaning.meaning}</span>
                            </div>
                        `).join('')}
                    </div>
                    <div class="word-stats">
                        <div class="stat-item">最后错误: ${formatDate(word.lastWrongTime)}</div>
                        <div class="stat-item">复习次数: ${word.reviewCount || 0}</div>
                    </div>
                </div>
            </div>
        `).join('');

        // 添加动态事件监听
        document.querySelectorAll('.practice-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const word = this.dataset.word;
                startSingleWordReview(word);
            });
        });

        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const word = this.dataset.word;
                removeWrongWord(word);
            });
        });
    }

    // 开始复习会话
    function startReviewSession() {
        const wordsToReview = wrongWordsData.filter(word => !word.mastered);
        
        if (wordsToReview.length === 0) {
            alert('没有需要复习的错题！');
            return;
        }

        reviewState = {
            isReviewing: true,
            currentIndex: 0,
            reviewWords: [...wordsToReview],
            currentWord: null,
            correctAnswers: 0,
            wrongAnswers: 0,
            selectedOption: null
        };

        showReviewMode();
        loadNextReviewWord();
    }

    // 开始快速测试
    function startQuickTest() {
        const wordsToTest = wrongWordsData
            .filter(word => !word.mastered)
            .sort((a, b) => b.wrongCount - a.wrongCount)
            .slice(0, 10); // 取错误次数最多的10个单词

        if (wordsToTest.length === 0) {
            alert('没有需要测试的错题！');
            return;
        }

        reviewState = {
            isReviewing: true,
            currentIndex: 0,
            reviewWords: wordsToTest,
            currentWord: null,
            correctAnswers: 0,
            wrongAnswers: 0,
            selectedOption: null
        };

        showReviewMode();
        loadNextReviewWord();
    }

    // 开始单个单词复习
    function startSingleWordReview(word) {
        const wordData = wrongWordsData.find(w => w.word === word);
        if (!wordData) return;

        reviewState = {
            isReviewing: true,
            currentIndex: 0,
            reviewWords: [wordData],
            currentWord: null,
            correctAnswers: 0,
            wrongAnswers: 0,
            selectedOption: null
        };

        showReviewMode();
        loadNextReviewWord();
    }

    // 显示复习模式
    function showReviewMode() {
        document.querySelector('.main-content > :not(.review-mode)').classList.add('hidden');
        reviewMode.classList.remove('hidden');
        completionPage.classList.add('hidden');
        
        updateReviewProgress();
        updateReviewStats();
    }

    // 加载下一个复习单词
    function loadNextReviewWord() {
        if (reviewState.currentIndex >= reviewState.reviewWords.length) {
            showCompletionPage();
            return;
        }

        reviewState.currentWord = reviewState.reviewWords[reviewState.currentIndex];
        reviewState.selectedOption = null;
        
        displayReviewWord();
        updateReviewProgress();
        
        // 隐藏反馈，显示选项
        reviewFeedback.classList.add('hidden');
        meaningOptions.classList.remove('hidden');
    }

    // 显示复习单词
    function displayReviewWord() {
        const word = reviewState.currentWord;
        
        reviewWord.textContent = word.word;
        reviewPhonetic.textContent = word.phonetic;
        
        // 生成选项（1个正确答案 + 3个干扰项）
        const options = generateMeaningOptions(word);
        displayMeaningOptions(options);
    }

    // 生成释义选项
    function generateMeaningOptions(correctWord) {
        const correctMeaning = correctWord.meanings[0].meaning;
        const wrongMeanings = [];
        
        // 从数据库中选择3个不同的错误选项
        const availableWords = wordDatabase.filter(w => 
            w.word !== correctWord.word && 
            w.meaning !== correctMeaning
        );
        
        for (let i = 0; i < 3; i++) {
            if (availableWords.length > 0) {
                const randomIndex = Math.floor(Math.random() * availableWords.length);
                wrongMeanings.push(availableWords[randomIndex].meaning);
                availableWords.splice(randomIndex, 1);
            }
        }
        
        // 合并选项并随机排序
        const allOptions = [correctMeaning, ...wrongMeanings];
        return shuffleArray(allOptions);
    }

    // 显示释义选项
    function displayMeaningOptions(options) {
        meaningOptions.innerHTML = options.map((option, index) => `
            <div class="option-item" data-index="${index}" data-meaning="${option}">
                ${option}
            </div>
        `).join('');

        // 添加选项点击事件
        document.querySelectorAll('.option-item').forEach(item => {
            item.addEventListener('click', function() {
                if (reviewState.selectedOption !== null) return; // 防止重复选择
                
                const selectedMeaning = this.dataset.meaning;
                reviewState.selectedOption = selectedMeaning;
                
                // 标记选中的选项
                document.querySelectorAll('.option-item').forEach(opt => {
                    opt.classList.remove('selected');
                });
                this.classList.add('selected');
                
                // 检查答案
                checkAnswer(selectedMeaning);
            });
        });
    }

    // 检查答案
    function checkAnswer(selectedMeaning) {
        const correctMeaning = reviewState.currentWord.meanings[0].meaning;
        const isCorrect = selectedMeaning === correctMeaning;
        
        // 更新统计数据
        if (isCorrect) {
            reviewState.correctAnswers++;
            reviewStats.totalCorrect++;
        } else {
            reviewState.wrongAnswers++;
        }
        reviewStats.totalAttempts++;
        reviewStats.todayReviewed++;
        
        // 更新单词的复习次数
        const wordIndex = wrongWordsData.findIndex(w => w.word === reviewState.currentWord.word);
        if (wordIndex !== -1) {
            wrongWordsData[wordIndex].reviewCount = (wrongWordsData[wordIndex].reviewCount || 0) + 1;
            
            // 如果连续正确3次，标记为已掌握
            if (isCorrect) {
                wrongWordsData[wordIndex].consecutiveCorrect = (wrongWordsData[wordIndex].consecutiveCorrect || 0) + 1;
                if (wrongWordsData[wordIndex].consecutiveCorrect >= 3) {
                    wrongWordsData[wordIndex].mastered = true;
                    reviewStats.masteredCount++;
                }
            } else {
                wrongWordsData[wordIndex].consecutiveCorrect = 0;
            }
        }
        
        // 保存数据
        localStorage.setItem('wrongWords', JSON.stringify(wrongWordsData));
        localStorage.setItem('reviewStats', JSON.stringify(reviewStats));
        
        // 显示反馈
        showAnswerFeedback(isCorrect, correctMeaning);
    }

    // 显示答案反馈
    function showAnswerFeedback(isCorrect, correctMeaning) {
        const word = reviewState.currentWord;
        
        // 标记正确和错误选项
        document.querySelectorAll('.option-item').forEach(item => {
            const meaning = item.dataset.meaning;
            if (meaning === correctMeaning) {
                item.classList.add('correct');
            } else if (meaning === reviewState.selectedOption && !isCorrect) {
                item.classList.add('incorrect');
            }
        });
        
        // 显示详细信息
        correctMeaning.textContent = correctMeaning;
        reviewPhonetic.textContent = word.phonetic;
        reviewExample.textContent = word.meanings[0].examples[0];
        
        // 更新统计
        updateReviewStats();
        
        // 显示反馈区域
        reviewFeedback.classList.remove('hidden');
        meaningOptions.classList.add('hidden');
        
        // 移动到下一个单词
        reviewState.currentIndex++;
    }

    // 播放单词发音
    function playWordSound() {
        if (!reviewState.currentWord) return;
        
        const utterance = new SpeechSynthesisUtterance(reviewState.currentWord.word);
        utterance.lang = 'en-US';
        utterance.rate = 0.8;
        speechSynthesis.speak(utterance);
    }

    // 更新复习进度
    function updateReviewProgress() {
        reviewProgress.textContent = `${reviewState.currentIndex + 1}/${reviewState.reviewWords.length}`;
    }

    // 更新复习统计
    function updateReviewStats() {
        correctCount.textContent = reviewState.correctAnswers;
        wrongCount.textContent = reviewState.wrongAnswers;
        
        const total = reviewState.correctAnswers + reviewState.wrongAnswers;
        const accuracy = total > 0 ? Math.round((reviewState.correctAnswers / total) * 100) : 0;
        reviewAccuracy.textContent = `${accuracy}%`;
    }

    // 显示完成页面
    function showCompletionPage() {
        reviewMode.classList.add('hidden');
        completionPage.classList.remove('hidden');
        
        finalCorrect.textContent = reviewState.correctAnswers;
        finalWrong.textContent = reviewState.wrongAnswers;
        
        const total = reviewState.correctAnswers + reviewState.wrongAnswers;
        const accuracy = total > 0 ? Math.round((reviewState.correctAnswers / total) * 100) : 0;
        finalAccuracy.textContent = `${accuracy}%`;
        
        // 更新主统计信息
        updateStatistics();
    }

    // 退出复习模式
    function exitReviewMode() {
        if (confirm('确定要退出复习吗？当前进度将不会保存。')) {
            backToWordList();
        }
    }

    // 返回单词列表
    function backToWordList() {
        reviewMode.classList.add('hidden');
        completionPage.classList.add('hidden');
        document.querySelector('.main-content > :not(.review-mode)').classList.remove('hidden');
        updateWordList();
    }

    // 移除错题
    function removeWrongWord(word) {
        if (confirm(`确定要从错题本中移除"${word}"吗？`)) {
            wrongWordsData = wrongWordsData.filter(w => w.word !== word);
            localStorage.setItem('wrongWords', JSON.stringify(wrongWordsData));
            updateStatistics();
            updateWordList();
        }
    }

    // 清空所有错题
    function clearAllWrongWords() {
        if (wrongWordsData.length === 0) {
            alert('错题本已经是空的！');
            return;
        }
        
        if (confirm('确定要清空所有错题吗？此操作不可撤销。')) {
            wrongWordsData = [];
            localStorage.setItem('wrongWords', JSON.stringify(wrongWordsData));
            updateStatistics();
            updateWordList();
        }
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

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN');
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // 初始化应用
    initEventListeners();
    initDisplay();
});