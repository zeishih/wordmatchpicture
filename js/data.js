/**
 * 游戏数据管理模块
 * 负责加载和处理单词数据
 */

class DataManager {
    constructor() {
        this.words = [];
        this.levels = [];
        this.playerProgress = {
            completedLevels: {},
            totalScore: 0,
            correctAnswers: 0,
            totalAttempts: 0
        };
    }

    /**
     * 初始化数据管理器
     * @returns {Promise} 初始化完成的Promise
     */
    async init() {
        try {
            // 加载单词数据
            await this.loadWords();
            
            // 创建关卡
            this.createLevels();
            
            // 加载玩家进度
            this.loadProgress();
            
            return Promise.resolve();
        } catch (error) {
            console.error('初始化数据时出错:', error);
            return Promise.reject(error);
        }
    }

    /**
     * 从JSON文件加载单词数据
     * @returns {Promise} 加载完成的Promise
     */
    async loadWords() {
        try {
            const response = await fetch('data/words.json');
            if (!response.ok) {
                throw new Error('无法加载单词数据');
            }
            
            this.words = await response.json();
            return Promise.resolve();
        } catch (error) {
            console.error('加载单词时出错:', error);
            return Promise.reject(error);
        }
    }

    /**
     * 根据单词数据创建游戏关卡
     */
    createLevels() {
        // 每个关卡包含所有的单词，但顺序不同
        this.levels = Array.from({ length: 5 }, (_, i) => {
            // 对单词进行浅拷贝并随机排序
            const shuffledWords = [...this.words].sort(() => Math.random() - 0.5);
            
            return {
                id: i + 1,
                name: `第${i + 1}关`,
                words: shuffledWords,
                unlocked: i === 0 // 第一关默认解锁
            };
        });
    }

    /**
     * 从localStorage加载玩家进度
     */
    loadProgress() {
        const savedProgress = localStorage.getItem('wordGameProgress');
        if (savedProgress) {
            this.playerProgress = JSON.parse(savedProgress);
            
            // 根据玩家进度更新关卡解锁状态
            this.updateLevelUnlockStatus();
        }
    }

    /**
     * 保存玩家进度到localStorage
     */
    saveProgress() {
        localStorage.setItem('wordGameProgress', JSON.stringify(this.playerProgress));
    }

    /**
     * 更新关卡解锁状态
     */
    updateLevelUnlockStatus() {
        this.levels.forEach((level, index) => {
            // 第一关总是解锁的
            if (index === 0) {
                level.unlocked = true;
                return;
            }
            
            // 如果前一关已完成，则解锁当前关
            const prevLevelId = this.levels[index - 1].id;
            level.unlocked = this.playerProgress.completedLevels[prevLevelId] !== undefined;
        });
    }

    /**
     * 获取所有关卡信息
     * @returns {Array} 关卡信息数组
     */
    getLevels() {
        return this.levels;
    }

    /**
     * 获取指定关卡的单词
     * @param {number} levelId 关卡ID
     * @returns {Array} 关卡单词数组
     */
    getLevelWords(levelId) {
        const level = this.levels.find(l => l.id === levelId);
        return level ? level.words : [];
    }

    /**
     * 获取玩家进度
     * @returns {Object} 玩家进度信息
     */
    getPlayerProgress() {
        return this.playerProgress;
    }

    /**
     * 更新关卡完成状态
     * @param {number} levelId 关卡ID
     * @param {number} score 得分
     * @param {number} stars 星级（1-3）
     */
    updateLevelCompletion(levelId, score, stars) {
        this.playerProgress.completedLevels[levelId] = {
            score,
            stars,
            completedAt: new Date().toISOString()
        };
        
        this.playerProgress.totalScore += score;
        
        // 更新关卡解锁状态
        this.updateLevelUnlockStatus();
        
        // 保存进度
        this.saveProgress();
    }

    /**
     * 更新答题记录
     * @param {boolean} isCorrect 是否回答正确
     */
    updateAnswerRecord(isCorrect) {
        this.playerProgress.totalAttempts++;
        
        if (isCorrect) {
            this.playerProgress.correctAnswers++;
        }
        
        // 保存进度
        this.saveProgress();
    }

    /**
     * 重置玩家进度
     */
    resetProgress() {
        this.playerProgress = {
            completedLevels: {},
            totalScore: 0,
            correctAnswers: 0,
            totalAttempts: 0
        };
        
        // 重置关卡解锁状态
        this.levels.forEach((level, index) => {
            level.unlocked = index === 0;
        });
        
        // 保存重置后的进度
        this.saveProgress();
    }

    /**
     * 获取正确率
     * @returns {number} 正确率百分比
     */
    getAccuracy() {
        if (this.playerProgress.totalAttempts === 0) {
            return 0;
        }
        
        return Math.round((this.playerProgress.correctAnswers / this.playerProgress.totalAttempts) * 100);
    }
}

// 创建数据管理器实例
const dataManager = new DataManager(); 