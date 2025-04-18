/**
 * 游戏核心模块
 * 负责游戏逻辑和规则
 */

class Game {
    constructor() {
        this.currentLevel = null;
        this.currentLevelId = null;
        this.words = [];
        this.currentWordIndex = 0;
        this.score = 0;
        this.correctAnswers = 0;
        this.remainingTime = 60;
        this.timerInterval = null;
        this.isGameActive = false;
        
        // 音效对象
        this.sounds = {
            correct: document.getElementById('correct-sound'),
            wrong: document.getElementById('wrong-sound'),
            background: document.getElementById('background-music')
        };
        
        // 音效和音乐设置
        this.settings = {
            soundEnabled: true,
            musicEnabled: true
        };
        
        // 加载设置
        this.loadSettings();
    }
    
    /**
     * 从localStorage加载设置
     */
    loadSettings() {
        const savedSettings = localStorage.getItem('wordGameSettings');
        if (savedSettings) {
            this.settings = {...this.settings, ...JSON.parse(savedSettings)};
        }
    }
    
    /**
     * 保存设置到localStorage
     */
    saveSettings() {
        localStorage.setItem('wordGameSettings', JSON.stringify(this.settings));
    }
    
    /**
     * 更新设置
     * @param {Object} newSettings 新设置
     */
    updateSettings(newSettings) {
        this.settings = {...this.settings, ...newSettings};
        this.saveSettings();
        
        // 应用音频设置
        if (this.sounds.background) {
            if (this.settings.musicEnabled) {
                this.sounds.background.play().catch(() => {
                    // 用户交互前可能无法自动播放
                    console.log('背景音乐需要用户交互后才能播放');
                });
            } else {
                this.sounds.background.pause();
            }
        }
    }
    
    /**
     * 开始新游戏
     * @param {number} levelId 关卡ID
     */
    startGame(levelId) {
        // 获取关卡单词
        this.words = dataManager.getLevelWords(levelId);
        
        if (this.words.length === 0) {
            console.error('无法开始游戏：没有单词');
            return;
        }
        
        this.currentLevelId = levelId;
        this.currentWordIndex = 0;
        this.score = 0;
        this.correctAnswers = 0;
        this.isGameActive = true;
        
        // 设置计时器时间（固定60秒）
        this.remainingTime = 60;
        
        // 开始计时器
        this.startTimer();
        
        // 播放背景音乐
        if (this.settings.musicEnabled && this.sounds.background) {
            this.sounds.background.play().catch(() => {
                console.log('背景音乐需要用户交互后才能播放');
            });
        }
        
        // 显示第一个单词
        return this.getCurrentWord();
    }
    
    /**
     * 开始计时器
     */
    startTimer() {
        clearInterval(this.timerInterval);
        
        this.timerInterval = setInterval(() => {
            this.remainingTime--;
            
            // 更新UI上的时间
            const timerElement = document.getElementById('timer');
            if (timerElement) {
                timerElement.textContent = this.remainingTime;
            }
            
            // 时间到，结束游戏
            if (this.remainingTime <= 0) {
                this.endGame();
            }
        }, 1000);
    }
    
    /**
     * 停止计时器
     */
    stopTimer() {
        clearInterval(this.timerInterval);
    }
    
    /**
     * 获取当前单词
     * @returns {Object|null} 当前单词对象
     */
    getCurrentWord() {
        if (this.currentWordIndex >= this.words.length) {
            this.endGame();
            return null;
        }
        
        return this.words[this.currentWordIndex];
    }
    
    /**
     * 获取图片选项
     * @returns {Array} 图片选项数组
     */
    getImageOptions() {
        const currentWord = this.getCurrentWord();
        if (!currentWord) return [];
        
        // 正确选项
        const correctOption = {
            word: currentWord,
            isCorrect: true
        };
        
        // 从其他单词中随机选择两个作为干扰项
        const otherWords = this.words.filter(word => word.id !== currentWord.id);
        const shuffledOtherWords = [...otherWords].sort(() => Math.random() - 0.5);
        const distractors = shuffledOtherWords.slice(0, 2).map(word => ({
            word,
            isCorrect: false
        }));
        
        // 合并选项并随机排序
        const options = [correctOption, ...distractors];
        return options.sort(() => Math.random() - 0.5);
    }
    
    /**
     * 检查答案
     * @param {Object} selectedOption 选择的选项
     * @returns {Object} 结果对象
     */
    checkAnswer(selectedOption) {
        if (!this.isGameActive) return { correct: false };
        
        const isCorrect = selectedOption.isCorrect;
        const currentWord = this.getCurrentWord();
        
        // 播放音效
        if (this.settings.soundEnabled) {
            const sound = isCorrect ? this.sounds.correct : this.sounds.wrong;
            if (sound) {
                sound.currentTime = 0;
                sound.play().catch(e => console.log('播放音效失败:', e));
            }
        }
        
        // 更新得分和答题记录
        if (isCorrect) {
            // 固定得分为10分
            let points = 10;
            
            this.score += points;
            this.correctAnswers++;
        }
        
        // 更新答题记录
        dataManager.updateAnswerRecord(isCorrect);
        
        // 准备下一个单词
        this.currentWordIndex++;
        
        // 检查是否已完成所有单词
        const isComplete = this.currentWordIndex >= this.words.length;
        
        // 如果已完成所有单词，结束游戏
        if (isComplete) {
            this.endGame();
        }
        
        return {
            correct: isCorrect,
            points: isCorrect ? 10 : 0,
            word: currentWord,
            isComplete: isComplete,
            nextWord: isComplete ? null : this.getCurrentWord()
        };
    }
    
    /**
     * 结束游戏
     */
    endGame() {
        this.isGameActive = false;
        this.stopTimer();
        
        // 暂停背景音乐
        if (this.sounds.background) {
            this.sounds.background.pause();
        }
        
        // 计算星级
        const totalPossibleScore = this.words.length * 10;
        const percentage = (this.score / totalPossibleScore) * 100;
        
        let stars;
        if (percentage >= 80) {
            stars = 3;
        } else if (percentage >= 60) {
            stars = 2;
        } else {
            stars = 1;
        }
        
        // 更新关卡完成状态
        dataManager.updateLevelCompletion(this.currentLevelId, this.score, stars);
        
        return {
            score: this.score,
            correctAnswers: this.correctAnswers,
            totalWords: this.words.length,
            stars: stars
        };
    }
    
    /**
     * 获取游戏进度
     * @returns {Object} 游戏进度信息
     */
    getGameProgress() {
        return {
            currentWordIndex: this.currentWordIndex,
            totalWords: this.words.length,
            score: this.score,
            remainingTime: this.remainingTime
        };
    }
}

// 创建游戏实例
const game = new Game(); 