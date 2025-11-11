// 主逻辑模块
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed.");

    // 初始化UI，显示默认方法的输入框
    UI.updateInputForm(appState.currentMethod);
    plotter.initialize();
    
    // 获取方法选择的下拉菜单元素
    const methodSelect = document.getElementById('method-select');

    // 添加事件监听器，当用户改变选择时触发
    methodSelect.addEventListener('change', (event) => {
        // 1. 更新全局状态
        appState.currentMethod = event.target.value;

        // 2. 调用UI模块更新界面
        UI.updateInputForm(appState.currentMethod);

        // 3. 重置所有计算结果
        resetState(); // 调用 state.js 中的重置函数
        UI.clearResults(); 
        plotter.clearAll(); 
    });
    
    // 获取迭代按钮
    const iterateBtn = document.getElementById('iterate-btn');
    
    // 为迭代按钮添加点击事件监听器
    iterateBtn.addEventListener('click', handleIteration); 

    const resetBtn = document.getElementById('reset-btn');
    resetBtn.addEventListener('click', () => {
        resetState();
        UI.clearResults();
        plotter.clearAll();
        console.log("Reset button clicked. State and visualizations cleared.");
        const userInput = UI.getUserInput();
        if (userInput.funcString) {
            plotter.drawFunction(userInput.funcString);
        }
    });
});

/**
 * 处理单步迭代的核心函数
 */
function handleIteration() {
    // 清除上一条消息
    UI.clearMessage();

    // 步骤1：准备和解析 (仅在第一次迭代时执行)
    if (appState.history.length === 0) {
        try {
            // 从UI获取输入
            const userInput = UI.getUserInput();
            
            // 验证输入是否为空
            if (!userInput.funcString || !userInput.initialValue1) {
                throw new Error("函数表达式和初值不能为空。");
            }

            // 更新状态
            appState.funcString = userInput.funcString;
            appState.initialValue1 = parseFloat(userInput.initialValue1);
            if (isNaN(appState.initialValue1)) throw new Error("初值 x₀ 必须是一个数字。");

            // 根据方法编译函数
            switch (appState.currentMethod) {
                case 'newton':
                    appState.func = math.parse(appState.funcString).compile();
                    appState.funcPrime = math.derivative(appState.funcString, 'x').compile();
                    break;
                // 其他方法的 case 将在后续添加
            }
            
            // 3. 重置并绘制主函数（这是开始可视化的信号）
            plotter.drawFunction(appState.funcString);

            // 将初值添加到历史记录
            appState.history.push({
                k: 0,
                x: appState.initialValue1,
                error: null // 第0次没有误差
            });

            UI.updateResultsTable(appState.history);

        } catch (error) {
            console.error("Initialization failed:", error);
            UI.showMessage(`错误: ${error.message}`, 'error');
            resetState();
            plotter.clearAll();
            return; // 准备失败，终止执行
        }
    } else {
        // 步骤2：执行后续迭代计算
        try {
            const currentK = appState.history.length;
            const lastState = appState.history[currentK - 1];
            const x_k = lastState.x;
            let next_x;

            switch (appState.currentMethod) {
                case 'newton':
                    // 调用 solver 进行计算
                    next_x = solver.newton(
                        (x) => appState.func.evaluate({ x: x }),
                        (x) => appState.funcPrime.evaluate({ x: x }),
                        x_k
                    );
                    break;
                 // 其他方法的 case 将在后续添加
            }
            
            // 检查计算结果是否有效
            if (!isFinite(next_x)) {
                throw new Error("计算结果无效 (Infinity or NaN)，迭代发散。");
            }
            
            // 计算误差
            const error = Math.abs(next_x - x_k);

            // 将新结果添加到历史记录
            appState.history.push({
                k: currentK,
                x: next_x,
                error: error
            });

            UI.updateResultsTable(appState.history);
            if (appState.currentMethod === 'newton') {
                plotter.drawNewtonTangent(
                    lastState,
                    next_x,
                    (x) => appState.func.evaluate({ x: x }),
                    (x) => appState.funcPrime.evaluate({ x: x })
                );
            }

            // console.log(`Iteration ${currentK} successful. New x = ${next_x}. State:`, appState);
            // console.log("Updated history:", appState.history);
            
        } catch (error) {
            console.error("Iteration failed:", error);
            UI.showMessage(`迭代错误: ${error.message}`, 'error');
            // 可以在这里设置发散状态 appState.isDiverged = true;
        }
    }

}