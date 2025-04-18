/**
 * UI交互模块
 * 负责界面显示和用户交互
 */

class UI {
    constructor() {
        // 屏幕元素
        this.screens = {
            mainMenu: document.getElementById('main-menu'),
            levelSelect: document.getElementById('level-select'),
            game: document.getElementById('game-screen'),
            stats: document.getElementById('stats-screen'),
            settings: document.getElementById('settings-screen')
        };
        
        // 游戏元素
        this.gameElements = {
            currentWord: document.getElementById('current-word'),
            phonetic: document.getElementById('phonetic'),
            imagesContainer: document.getElementById('images-container'),
            score: document.getElementById('score'),
            stars: document.getElementById('stars'),
            timer: document.getElementById('timer'),
            feedback: document.getElementById('feedback')
        };
        
        // 关卡元素
        this.levelElements = {
            levelsContainer: document.getElementById('levels-container')
        };
        
        // 统计元素
        this.statsElements = {
            totalScore: document.getElementById('total-score'),
            completedLevels: document.getElementById('completed-levels'),
            accuracy: document.getElementById('accuracy')
        };
        
        // 设置元素
        this.settingsElements = {
            soundToggle: document.getElementById('sound-toggle'),
            musicToggle: document.getElementById('music-toggle')
        };
        
        // 模态框元素
        this.modalElements = {
            overlay: document.getElementById('overlay'),
            title: document.getElementById('modal-title'),
            content: document.getElementById('modal-content'),
            closeButton: document.getElementById('modal-close')
        };
        
        // 当前活动屏幕
        this.activeScreen = this.screens.mainMenu;
        
        // 初始化事件监听器
        this.initEventListeners();
    }
    
    /**
     * 初始化事件监听器
     */
    initEventListeners() {
        // 主菜单按钮
        document.getElementById('start-game').addEventListener('click', () => {
            this.showScreen(this.screens.game);
            const firstLevelId = 1;
            this.startGame(firstLevelId);
        });
        
        document.getElementById('select-level').addEventListener('click', () => {
            this.showLevelSelect();
        });
        
        document.getElementById('view-stats').addEventListener('click', () => {
            this.showStats();
        });
        
        document.getElementById('settings').addEventListener('click', () => {
            this.showSettings();
        });
        
        // 返回按钮
        document.getElementById('back-to-menu-from-levels').addEventListener('click', () => {
            this.showScreen(this.screens.mainMenu);
        });
        
        document.getElementById('back-to-menu-from-game').addEventListener('click', () => {
            if (game.isGameActive) {
                this.showConfirmation('确定要退出游戏吗？', '当前游戏进度将丢失。', () => {
                    game.endGame();
                    this.showScreen(this.screens.mainMenu);
                });
            } else {
                this.showScreen(this.screens.mainMenu);
            }
        });
        
        document.getElementById('back-to-menu-from-stats').addEventListener('click', () => {
            this.showScreen(this.screens.mainMenu);
        });
        
        document.getElementById('back-to-menu-from-settings').addEventListener('click', () => {
            this.showScreen(this.screens.mainMenu);
        });
        
        // 重置进度按钮
        document.getElementById('reset-progress').addEventListener('click', () => {
            this.showConfirmation('确定要重置进度吗？', '所有游戏进度将被清除，无法恢复。', () => {
                dataManager.resetProgress();
                this.showScreen(this.screens.mainMenu);
                this.showMessage('提示', '游戏进度已重置');
            });
        });
        
        // 设置选项
        this.settingsElements.soundToggle.addEventListener('change', () => {
            game.updateSettings({
                soundEnabled: this.settingsElements.soundToggle.checked
            });
        });
        
        this.settingsElements.musicToggle.addEventListener('change', () => {
            game.updateSettings({
                musicEnabled: this.settingsElements.musicToggle.checked
            });
        });
        
        // 模态框关闭按钮
        this.modalElements.closeButton.addEventListener('click', () => {
            this.hideModal();
        });
    }
    
    /**
     * 显示指定屏幕
     * @param {HTMLElement} screen 要显示的屏幕元素
     */
    showScreen(screen) {
        // 隐藏当前活动屏幕
        if (this.activeScreen) {
            this.activeScreen.classList.remove('active');
        }
        
        // 显示新屏幕
        screen.classList.add('active');
        
        // 更新当前活动屏幕
        this.activeScreen = screen;
    }
    
    /**
     * 显示关卡选择界面
     */
    showLevelSelect() {
        // 获取关卡数据
        const levels = dataManager.getLevels();
        
        // 清空关卡容器
        this.levelElements.levelsContainer.innerHTML = '';
        
        // 创建关卡元素
        levels.forEach(level => {
            const levelProgress = dataManager.getPlayerProgress().completedLevels[level.id];
            
            const levelElement = document.createElement('div');
            levelElement.className = `level-item ${levelProgress ? 'completed' : ''} ${!level.unlocked ? 'locked' : ''}`;
            
            const levelNumber = document.createElement('div');
            levelNumber.className = 'level-number';
            levelNumber.textContent = level.id;
            
            const levelName = document.createElement('div');
            levelName.className = 'level-name';
            levelName.textContent = level.name;
            
            const levelStars = document.createElement('div');
            levelStars.className = 'level-stars';
            
            if (levelProgress) {
                levelStars.textContent = '★'.repeat(levelProgress.stars) + '☆'.repeat(3 - levelProgress.stars);
            } else {
                levelStars.textContent = '☆☆☆';
            }
            
            levelElement.appendChild(levelNumber);
            levelElement.appendChild(levelName);
            levelElement.appendChild(levelStars);
            
            // 添加点击事件（仅对解锁的关卡有效）
            if (level.unlocked) {
                levelElement.addEventListener('click', () => {
                    this.showScreen(this.screens.game);
                    this.startGame(level.id);
                });
            } else {
                const lockIcon = document.createElement('div');
                lockIcon.className = 'lock-icon';
                lockIcon.innerHTML = '🔒';
                levelElement.appendChild(lockIcon);
            }
            
            this.levelElements.levelsContainer.appendChild(levelElement);
        });
        
        // 显示关卡选择屏幕
        this.showScreen(this.screens.levelSelect);
    }
    
    /**
     * 显示统计信息
     */
    showStats() {
        const progress = dataManager.getPlayerProgress();
        
        // 更新统计信息
        this.statsElements.totalScore.textContent = progress.totalScore;
        this.statsElements.completedLevels.textContent = Object.keys(progress.completedLevels).length;
        this.statsElements.accuracy.textContent = dataManager.getAccuracy() + '%';
        
        // 显示统计屏幕
        this.showScreen(this.screens.stats);
    }
    
    /**
     * 显示设置界面
     */
    showSettings() {
        // 更新设置界面
        this.settingsElements.soundToggle.checked = game.settings.soundEnabled;
        this.settingsElements.musicToggle.checked = game.settings.musicEnabled;
        
        // 显示设置屏幕
        this.showScreen(this.screens.settings);
    }
    
    /**
     * 开始游戏
     * @param {number} levelId 关卡ID
     */
    startGame(levelId) {
        // 开始游戏逻辑
        const currentWord = game.startGame(levelId);
        
        if (!currentWord) {
            this.showMessage('错误', '无法开始游戏，请稍后重试');
            this.showScreen(this.screens.mainMenu);
            return;
        }
        
        // 更新UI
        this.updateGameUI();
    }
    
    /**
     * 更新游戏界面
     */
    updateGameUI() {
        const currentWord = game.getCurrentWord();
        
        if (!currentWord) return;
        
        // 更新单词和音标
        this.gameElements.currentWord.textContent = currentWord.word;
        this.gameElements.phonetic.textContent = currentWord.phonetic;
        
        // 更新得分
        this.gameElements.score.textContent = game.score;
        
        // 清空图片容器
        this.gameElements.imagesContainer.innerHTML = '';
        
        // 获取并显示图片选项
        const imageOptions = game.getImageOptions();
        
        imageOptions.forEach(option => {
            const imageElement = document.createElement('div');
            imageElement.className = 'image-option';
            
            const img = document.createElement('img');
            img.src = `image/${option.word.image}`;
            img.alt = option.word.word;
            
            imageElement.appendChild(img);
            
            // 添加点击事件
            imageElement.addEventListener('click', () => {
                // 检查答案
                const result = game.checkAnswer(option);
                
                // 显示反馈
                this.showFeedback(result);
                
                // 如果游戏未结束，更新UI以显示下一个单词
                if (!result.isComplete) {
                    setTimeout(() => {
                        this.updateGameUI();
                        this.hideFeedback();
                    }, 1500);
                } else {
                    // 游戏结束，显示结果
                    setTimeout(() => {
                        this.showGameResult(result);
                    }, 1500);
                }
            });
            
            this.gameElements.imagesContainer.appendChild(imageElement);
        });
        
        // 隐藏反馈
        this.hideFeedback();
    }
    
    /**
     * 显示反馈信息
     * @param {Object} result 答案检查结果
     */
    showFeedback(result) {
        const feedback = this.gameElements.feedback;
        
        feedback.className = 'feedback-container';
        feedback.classList.add(result.correct ? 'correct' : 'wrong');
        
        feedback.textContent = result.correct 
            ? `正确！+${result.points}分` 
            : `错误！正确答案: ${result.word.word} (${result.word.translation})`;
        
        feedback.style.display = 'block';
    }
    
    /**
     * 隐藏反馈信息
     */
    hideFeedback() {
        const feedback = this.gameElements.feedback;
        feedback.style.display = 'none';
    }
    
    /**
     * 显示游戏结果
     * @param {Object} result 游戏结果
     */
    showGameResult(result) {
        const gameResult = game.endGame();
        
        let message = `
            <div class="game-result">
                <p>恭喜完成游戏！</p>
                <p>得分: ${gameResult.score}</p>
                <p>正确率: ${Math.round((gameResult.correctAnswers / gameResult.totalWords) * 100)}%</p>
                <p>星级评价: ${'★'.repeat(gameResult.stars)}${'☆'.repeat(3 - gameResult.stars)}</p>
            </div>
        `;
        
        this.showMessage('游戏结束', message);
    }
    
    /**
     * 显示消息对话框
     * @param {string} title 标题
     * @param {string} message 消息内容
     * @param {Function} callback 回调函数
     */
    showMessage(title, message, callback) {
        this.modalElements.title.textContent = title;
        this.modalElements.content.innerHTML = message;
        
        // 设置关闭按钮回调
        const originalCallback = this.modalElements.closeButton.onclick;
        this.modalElements.closeButton.onclick = () => {
            this.hideModal();
            if (callback) callback();
            
            // 恢复原始回调
            this.modalElements.closeButton.onclick = originalCallback;
        };
        
        // 显示模态框
        this.modalElements.overlay.classList.remove('hidden');
    }
    
    /**
     * 显示确认对话框
     * @param {string} title 标题
     * @param {string} message 消息内容
     * @param {Function} confirmCallback 确认回调函数
     */
    showConfirmation(title, message, confirmCallback) {
        this.modalElements.title.textContent = title;
        this.modalElements.content.textContent = message;
        
        // 修改关闭按钮为确认
        this.modalElements.closeButton.textContent = '确认';
        
        // 创建取消按钮
        const cancelButton = document.createElement('button');
        cancelButton.textContent = '取消';
        cancelButton.className = 'btn-secondary';
        cancelButton.style.marginLeft = '10px';
        
        // 设置按钮事件
        const originalCallback = this.modalElements.closeButton.onclick;
        this.modalElements.closeButton.onclick = () => {
            this.hideModal();
            if (confirmCallback) confirmCallback();
            
            // 恢复原始状态
            this.modalElements.closeButton.textContent = '确定';
            this.modalElements.closeButton.onclick = originalCallback;
        };
        
        cancelButton.onclick = () => {
            this.hideModal();
            
            // 恢复原始状态
            this.modalElements.closeButton.textContent = '确定';
            this.modalElements.closeButton.onclick = originalCallback;
        };
        
        // 添加取消按钮
        this.modalElements.closeButton.after(cancelButton);
        
        // 显示模态框
        this.modalElements.overlay.classList.remove('hidden');
    }
    
    /**
     * 隐藏模态框
     */
    hideModal() {
        this.modalElements.overlay.classList.add('hidden');
        
        // 移除可能添加的取消按钮
        const cancelButton = this.modalElements.closeButton.nextElementSibling;
        if (cancelButton && cancelButton.textContent === '取消') {
            cancelButton.remove();
        }
    }
}

// 创建UI实例
const ui = new UI(); 