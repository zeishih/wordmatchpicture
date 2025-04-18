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
        // 可用图片列表
        this.availableImages = new Set();
    }

    /**
     * 初始化数据管理器
     * @returns {Promise} 初始化完成的Promise
     */
    async init() {
        try {
            // 加载单词数据
            await this.loadWords();
            
            // 获取可用图片列表
            await this.getAvailableImages();
            
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
     * 获取可用的图片列表
     * @returns {Promise} 加载完成的Promise
     */
    async getAvailableImages() {
        try {
            const response = await fetch('available-images.json');
            if (response.ok) {
                const images = await response.json();
                this.availableImages = new Set(images);
                return Promise.resolve();
            } else {
                console.warn('无法加载图片列表，将使用所有单词');
                // 如果无法加载图片列表，则假设所有单词都有图片
                this.words.forEach(word => {
                    this.availableImages.add(word.image);
                });
                return Promise.resolve();
            }
        } catch (error) {
            console.warn('加载图片列表时出错，将使用所有单词:', error);
            // 出错时也假设所有单词都有图片
            this.words.forEach(word => {
                this.availableImages.add(word.image);
            });
            return Promise.resolve();
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
        // 按照关卡对单词进行分组
        const levelGroups = {};
        
        this.words.forEach(word => {
            if (!levelGroups[word.level]) {
                levelGroups[word.level] = [];
            }
            
            // 只添加有对应图片的单词
            const imageName = word.image || `${word.word.toLowerCase().replace(/\s+/g, '-')}.jpeg`;
            if (this.availableImages.has(imageName) || this.availableImages.has(imageName.replace('.jpeg', '.jpg')) || 
                this.availableImages.has(imageName.replace('.jpeg', '.png'))) {
                // 确保单词有对应的图片路径
                word.image = imageName;
                levelGroups[word.level].push(word);
            }
        });
        
        // 创建关卡数组
        this.levels = Object.keys(levelGroups).map((levelName, index) => {
            return {
                id: index + 1,
                name: levelName,
                words: levelGroups[levelName].sort(() => Math.random() - 0.5), // 随机排序单词
                unlocked: index === 0 // 第一关默认解锁
            };
        });
        
        // 如果没有关卡（可能是因为没有单词或没有图片），创建一个空关卡
        if (this.levels.length === 0) {
            this.levels = [{
                id: 1,
                name: "默认关卡",
                words: [],
                unlocked: true
            }];
        }
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