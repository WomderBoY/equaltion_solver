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
            if (appState.currentMethod === 'secant_single' || appState.currentMethod === 'secant_double') {
                if (!userInput.funcString || !userInput.initialValue1 || !userInput.initialValue2) {
                    throw new Error("函数表达式和两个初值均不能为空。");
                }
            } else if (!userInput.funcString || !userInput.initialValue1) { // 其他方法的验证
                throw new Error("函数表达式和初值不能为空。");
            }

            // 更新状态
            appState.funcString = userInput.funcString;
            appState.initialValue1 = parseFloat(userInput.initialValue1);
            if (isNaN(appState.initialValue1)) throw new Error("初值 x₀ 必须是一个数字。");

            if (appState.currentMethod === 'secant_single' || appState.currentMethod === 'secant_double') {
                appState.initialValue2 = parseFloat(userInput.initialValue2); // x₁
                if (isNaN(appState.initialValue2)) throw new Error("初值 x₁ 必须是数字。");
            }

            // 根据方法编译函数
            switch (appState.currentMethod) {
                case 'newton':
                    appState.func = math.parse(appState.funcString).compile();
                    appState.funcPrime = math.derivative(appState.funcString, 'x').compile();
                    break;
                case 'secant_single':
                case 'secant_double':
                    appState.func = math.parse(appState.funcString).compile();
                    break;
                case 'simple':
                case 'aitken':
                    appState.phiFunc = math.parse(appState.funcString).compile();
                    break;
            }
            
            // 3. 重置并绘制主函数
            plotter.drawFunction(appState.funcString);
            if (appState.currentMethod === 'simple' || appState.currentMethod === 'aitken') {
                plotter.drawYEqualsX(); 
            }

            // 将初值添加到历史记录
            if (appState.currentMethod === 'secant_double') {
                // 双点弦截法需要将两个初值都加入历史
                appState.history.push({ k: 0, x: appState.initialValue1, error: null });
                appState.history.push({ k: 1, x: appState.initialValue2, error: null });
            } else {
                const firstIterateValue = (appState.currentMethod === 'secant_single') 
                    ? appState.initialValue2 
                    : appState.initialValue1;
                appState.history.push({ k: 0, x: firstIterateValue, error: null });
            }

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
            if (appState.currentMethod === 'secant_double' && appState.history.length < 2) {
                UI.showMessage("请再次点击'单步迭代'以开始计算。");
                return; // 首次点击只初始化，不计算
            }

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
                case 'simple':
                    next_x = solver.simpleIteration(
                        (x) => appState.phiFunc.evaluate({ x: x }), // <-- 添加这个包装器
                        x_k
                    );
                    break;
                case 'aitken': { // 使用块作用域
                    // 一个 Aitken 步骤需要从 x_k 开始，执行两次简单迭代
                    const p1 = solver.simpleIteration(
                        (x) => appState.phiFunc.evaluate({ x: x }),
                        x_k
                    );
                    if (!isFinite(p1)) throw new Error("第一步简单迭代发散。");

                    const p2 = solver.simpleIteration(
                        (x) => appState.phiFunc.evaluate({ x: x }),
                        p1
                    );
                    if (!isFinite(p2)) throw new Error("第二步简单迭代发散。");

                    // 使用这三点进行加速
                    next_x = solver.aitken(x_k, p1, p2);
                    
                    // 为绘图函数传递所有计算过程中的点
                    plotter.drawAitkenStep(x_k, p1, p2, next_x);
                    break;
                }
                case 'secant_single': {
                    const x_0_fixed = appState.initialValue1; // 固定点
                    const f = (x) => appState.func.evaluate({ x: x });

                    next_x = solver.secantSingle(f, x_k, x_0_fixed);
                    
                    plotter.drawSecant(x_0_fixed, x_k, next_x, f, true); // true表示有固定点
                    break;
                }
                case 'secant_double': {
                    console.log(`--- 开始第 ${currentK - 1} 次计算 (Click #${currentK}) ---`);
                    console.log('当前完整的历史记录:', JSON.parse(JSON.stringify(appState.history)));

                    const x_k_minus_1 = appState.history[currentK - 2].x; // 获取上上个点

                    console.log(`使用的点: x_k (较新的点) = ${x_k}`);
                    console.log(`使用的点: x_k_minus_1 (较旧的点) = ${x_k_minus_1}`);
                    console.log(`固定的 x₀ (appState.initialValue1) 是: ${appState.initialValue1}`);
                    
                    const f = (x) => appState.func.evaluate({ x: x });

                    next_x = solver.secantDouble(f, x_k, x_k_minus_1);
                    
                    // 复用 drawSecant 函数
                    plotter.drawSecant(x_k_minus_1, x_k, next_x, f, false); // false表示没有固定点
                    break;
                }
            }
            
            // 检查计算结果是否有效
            if (!isFinite(next_x)) {
                throw new Error("计算结果无效 (Infinity or NaN)，迭代发散。");
            }
            
            // 计算误差
            const error = Math.abs(next_x - x_k);
            appState.history.push({
                k: currentK,
                x: next_x,
                error: error
            });

            UI.updateResultsTable(appState.history);
            
            if (appState.currentMethod === 'newton') {
                plotter.drawNewtonTangent(
                    x_k,
                    next_x,
                    (x_value) => appState.func.evaluate({ x: x_value })
                );
            } else if (appState.currentMethod === 'simple') {
                plotter.drawCobweb(x_k, next_x);
            }
            
        } catch (error) {
            console.error("Iteration failed:", error);
            UI.showMessage(`迭代错误: ${error.message}`, 'error');
            // 可以在这里设置发散状态 appState.isDiverged = true;
        }
    }

}