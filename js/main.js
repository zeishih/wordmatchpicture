/**
 * 主程序入口
 * 负责初始化和启动游戏
 */

// DOM加载完成后执行
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // 显示加载消息
        ui.showMessage('正在加载', '正在加载游戏数据，请稍候...');
        
        // 初始化数据管理器
        await dataManager.init();
        
        // 隐藏加载消息
        ui.hideModal();
        
        console.log('游戏初始化完成');
    } catch (error) {
        console.error('游戏初始化失败:', error);
        ui.showMessage('错误', '游戏加载失败，请刷新页面重试。');
    }
}); 