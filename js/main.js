/**
 * 主程序入口
 * 负责初始化和启动游戏
 */

// --- START OF main.js ---

// 假设 dataManager 和 ui 实例是在其他地方（比如 game.js 或 ui.js）创建并暴露的
// 如果它们是在 main.js 创建的，请保留创建实例的代码
// 例如:
// const dataManager = new DataManager(); // 假设 DataManager 在 data.js 定义
// const ui = new UI(); // 假设 UI 在 ui.js 定义

document.addEventListener('DOMContentLoaded', async () => {
    // 记录开始时间
    const startTime = Date.now();
    const minimumDisplayTime = 300; // 至少显示 300 毫秒 (你可以调整这个数值)

    try {
        // 显示加载消息
        // 确保 ui 实例在这里可用
        if (typeof ui !== 'undefined' && typeof ui.showMessage === 'function') {
            ui.showMessage('正在加载', '正在加载游戏数据，请稍候...');
        } else {
            console.error('UI object or showMessage function is not available.');
            // 可以考虑在这里添加一个简单的后备文本提示
        }


        // 初始化数据管理器
        // 确保 dataManager 实例在这里可用
        if (typeof dataManager !== 'undefined' && typeof dataManager.init === 'function') {
             await dataManager.init();
        } else {
             console.error('DataManager object or init function is not available.');
             throw new Error('DataManager not available for initialization.'); // 抛出错误以便进入 catch
        }


        // 计算已过时间
        const elapsedTime = Date.now() - startTime;

        // 如果加载时间太短，则等待剩余时间
        if (elapsedTime < minimumDisplayTime) {
            await new Promise(resolve => setTimeout(resolve, minimumDisplayTime - elapsedTime));
        }

        // 隐藏加载消息
        if (typeof ui !== 'undefined' && typeof ui.hideModal === 'function') {
            ui.hideModal(); // 现在会确保至少显示了 minimumDisplayTime
        } else {
            console.error('UI object or hideModal function is not available.');
        }


        console.log('游戏初始化完成');
        // **** 这里可能需要添加代码来实际显示主菜单或开始游戏 ****
        // 例如: ui.showScreen('main-menu');
        // 你之前的代码在成功后只隐藏了模态框，但没有明确显示游戏界面


    } catch (error) {
        console.error('游戏初始化失败:', error);

        // 错误提示通常需要用户交互，所以最小显示时间可能不是主要问题
        // 但如果加载提示和错误提示切换太快，也可以稍作延迟
        const errorElapsedTime = Date.now() - startTime;
        if (errorElapsedTime < minimumDisplayTime && typeof ui !== 'undefined' && typeof ui.showMessage === 'function') {
             // 隐藏可能还存在的加载提示（如果 showMessage 不覆盖的话）
             // ui.hideModal(); // 这可能不需要，取决于 showMessage 的实现
             await new Promise(resolve => setTimeout(resolve, minimumDisplayTime - errorElapsedTime));
        }

        // 显示错误消息
        if (typeof ui !== 'undefined' && typeof ui.showMessage === 'function') {
            ui.showMessage('错误', '游戏加载失败，请刷新页面重试。');
        } else {
             console.error('UI object or showMessage function is not available for error.');
             // 提供一个基本的浏览器 alert 作为后备
             alert('错误: 游戏加载失败，请刷新页面重试。\n' + error);
        }

    }
});

// --- END OF main.js ---