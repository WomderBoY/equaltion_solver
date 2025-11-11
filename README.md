### **方程迭代求解可视化工具 - 项目说明书**

#### 1. 项目概述

**项目名称**: 方程迭代求解可视化工具

**项目目标**: 开发一个基于 Web 的、无框架的交互式工具，用于可视化多种经典的方程求根迭代算法。用户可以输入自己的方程和初始条件，通过单步操作，直观地观察迭代过程、解的收敛或发散情况，以及算法的几何意义。

**核心价值**: 本项目旨在将抽象的数值分析理论转化为直观的图形化体验，降低学习门槛，为学生、教师和对数值计算感兴趣的人提供一个强大的辅助学习和教学工具。重点在于**可视化**和**交互性**，而非复杂的界面设计。

#### 2. 核心功能

1.  **方法选择与动态界面**:
    *   提供一个下拉菜单，包含以下五种迭代方法：
    *   简单迭代法 (Fixed-Point / Simple Iteration)：输入 $\varphi(x)$，求解 $x = \varphi(x)$
    *   埃特肯加速 (Aitken's $\Delta^2$ Acceleration)：对同一固定点序列进行加速，仍基于 $\varphi(x)$
    *   牛顿迭代法 (Newton's Method)：求根方程 $f(x)=0$
    *   假位法 (Regula Falsi / False Position)：保持根被区间 $[a,b]$ 包围
    *   割线法 (Secant Method)：使用最近两个迭代点（双点割线）
    *   当用户切换方法时，下方的输入区域应自动更新，以匹配该方法所需的参数（例如，函数表达式、一个或两个初值）。

2.  **交互式迭代控制**:
    *   **“单步迭代”按钮**: 每点击一次，执行一轮迭代计算，并实时更新结果和图形。
    *   **“重置”按钮**: 清空所有计算历史、图表上的辅助线和迭代点，将应用恢复到初始输入状态。

3.  **函数与迭代过程可视化**:
    *   **主函数图像**: 在一个2D坐标系中绘制用户输入的函数图像。
    *   **自适应视图**: 图表的坐标范围应能自动调整，确保关键的迭代点和辅助线在可视区域内。
    *   **辅助线绘制**: 针对不同算法绘制对应几何元素（教学核心）。
        *   **固定点迭代 / 埃特肯加速**: 绘制 $y=x$ 与 $y=\varphi(x)$；用蛛网图展示 $(x_k,x_k) \to (x_k,\varphi(x_k)) \to (x_{k+1},x_{k+1})$。埃特肯加速得到的 $x_k^{A}$ 用虚线或特殊标记表示跳跃。
        *   **牛顿法**: 在 $(x_k,f(x_k))$ 处绘制切线并标出与 x 轴交点 $x_{k+1}$。
        *   **假位法**: 绘制区间端点与函数值：$(a_k,f(a_k))$、$(b_k,f(b_k))$，以及割线与其与 x 轴交点 $c_k$；更新区间高亮。
        *   **割线法**: 绘制通过 $(x_{k-1},f(x_{k-1}))$ 与 $(x_k,f(x_k))$ 的割线并标记交点。
    *   **迭代点标记**: 在x轴或函数图像上清晰地标记出每一步的迭代点 $x_0, x_1, x_2, \dots$。

4.  **结果与状态显示**:
    *   **数据表格**: 展示 `k`、`x_k`、`f(x_k)`（或 `\varphi(x_k)` 视方法而定）、绝对误差 $|x_k - x_{k-1}|$、相对误差 $\frac{|x_k - x_{k-1}|}{\max(1,|x_k|)}$；埃特肯加速可附加一列 $x_k^{A}$。
    *   **状态消息**: 在界面显著位置提供反馈信息，例如 "迭代收敛"、"警告：函数可能发散" 或 "输入错误"。

5.  **错误处理与鲁棒性**:
    *   **输入验证**: 检查用户输入的函数表达式是否合法。
    *   **发散检测**: 当迭代值或函数值越界（例如 `|x|>1e6` 或 `|f(x)|>1e12`）、结果为 `NaN` / `Infinity`、或超出最大迭代次数时终止并提示。
    *   **收敛判断**: 计算绝对误差与相对误差；若任一 < 设定阈值（默认 `1e-7`）视为收敛。暂不实现“停滞”模式自动识别。
    *   **导数/分母异常**: 牛顿法若 |f'(x_k)| < 1e-12 或不可导提示并停止本步；假位/割线法若分母过小（|f(b)-f(a)| 或 |f(x_k)-f(x_{k-1})| < 1e-14）提示。

#### 3. 技术选型

*   **核心语言**: `HTML`, `CSS`, `JavaScript` (ES6+)。**禁止使用**任何大型前端框架（如 React, Vue, Angular）。
*   **数学表达式解析**: **Math.js** (`math.js`)：解析 $f(x)$ / $\varphi(x)$，支持求导。
*   **函数绘图**: **function-plot** (`function-plot.js`)：绘制函数、$y=x$、割线/切线与注释点。
*   **加载方式**: 采用 `<script>` 标签 (UMD，全局变量) 引入第三方库（方案 A），不使用打包器。

#### 4. 架构设计

为了保持代码的清晰和可维护性，项目应采用模块化的文件结构。

*   **文件结构**:
    ```
    / (project root)
    |-- index.html         # 应用的唯一HTML页面
    |-- style.css          # 全局样式
    |-- main.js            # 应用主入口，负责模块协调和事件绑定
    |-- /js
    |   |-- ui.js          # UI模块：负责所有DOM操作和界面更新
    |   |-- /solver        # 算法模块：纯函数实现各迭代
    |   |   |-- fixedPoint.js
    |   |   |-- aitken.js
    |   |   |-- newton.js
    |   |   |-- regulaFalsi.js
    |   |   |-- secant.js
    |   |-- plotter.js     # 绘图模块：封装function-plot库，提供统一的绘图接口
    |   |-- state.js       # 状态管理模块：存储应用的所有当前状态
    ```

*   **模块职责**:
    *   `state.js`: 定义并导出一个全局状态对象 `appState`，用于存储当前方法、函数表达式、迭代历史、初值、是否收敛/发散等。**任何模块都不应直接修改DOM，而是通过修改state，再由UI模块根据state来渲染界面**。
    *   `solver`: 包含所有迭代算法的纯函数：fixedPoint / aitken / newton / regulaFalsi / secant；输入必要数值与历史，输出新点及诊断，不做 DOM 操作。
    *   `plotter.js`: 封装 `function-plot` 的所有操作。提供如 `initializePlot`, `drawFunctions`, `addTangentLine`, `addCobwebPoint` 等高层API。它根据传入的数据在图表上进行绘制。
    *   `ui.js`: 负责将 `appState` 的变化渲染到页面上。例如，根据state更新输入框、结果表格和消息提示。它还负责监听用户的输入事件。
    *   `main.js`: 作为应用的“指挥中心”。它初始化所有模块，绑定核心事件（如按钮点击、下拉菜单选择），并编排整个工作流程：`事件触发 -> 更新state -> 调用solver计算 -> 更新state -> 调用ui和plotter更新视图`。

#### 5. 核心交互流程（以牛顿法为例）

1.  **初始化**: 页面加载完成，`main.js` 调用 `UI.initialize()`，绑定“方法选择”、“迭代”、“重置”按钮的事件监听。默认显示简单迭代法的输入界面。
2.  **选择方法**: 用户从下拉菜单中选择“牛顿迭代法”。
    *   `main.js` 监听到 `change` 事件。
    *   更新 `appState.currentMethod` 为 `'newton'`。
    *   调用 `UI.updateInputForm(appState.currentMethod)`，该函数清空旧的输入框，并创建 $f(x)$ 和初值 $x_0$ 的输入框。
3.  **用户输入**: 用户输入方程 `x^2 - 2` 和初值 `1.5`。
4.  **首次迭代**: 用户点击“单步迭代”按钮。
    *   `main.js` 监听到 `click` 事件。
    *   **解析与准备**:
        *   从输入框获取函数字符串 `expr = "x^2 - 2"` 和初值 `x0 = 1.5`。
        *   使用 `math.js` 解析函数：`appState.func = math.parse(expr).compile()`。
        *   使用 `math.js` 求导：`appState.funcPrime = math.derivative(expr, 'x').compile()`。
        *   将初值存入迭代历史：`appState.history = [{ k: 0, x: 1.5 }]`。
        *   调用 `plotter.drawFunctions(...)` 绘制主函数 $y=f(x)$ 和 $y=0$ (x轴)。
    *   **计算**: 调用 `solver.newton(appState.func, appState.funcPrime, 1.5)`，得到新的迭代值 `x1` (例如 1.41667)。
    *   **更新状态**: 将新结果存入 `appState.history`。
    *   **更新视图**:
        *   调用 `UI.updateResultsTable(appState.history)`，在表格中新增一行。
        *   调用 `plotter.drawNewtonTangent(...)`，在图上绘制点 $(1.5, f(1.5))$ 处的切线，并标记新点 `x1`。
5.  **后续迭代**: 用户再次点击“单步迭代”，重复第4步的“计算”、“更新状态”、“更新视图”流程。
6.  **重置**: 用户点击“重置”按钮。
    *   `main.js` 调用 `reset()`。
    *   清空 `appState.history` 与标记状态；调用 `UI.clearAll()` 与 `plotter.clearAnnotations()`。

### 6. 数学公式摘要

1. 固定点迭代：\( x_{k+1} = \varphi(x_k) \)
2. 埃特肯加速：若 \(\Delta^2 x_k = x_{k+2} - 2x_{k+1} + x_k \neq 0\)，\( x_k^{A} = x_k - \dfrac{(x_{k+1}-x_k)^2}{x_{k+2}-2x_{k+1}+x_k} \)
3. 牛顿法：\( x_{k+1} = x_k - \dfrac{f(x_k)}{f'(x_k)} \)
4. 假位法：区间 \([a_k,b_k]\)，\( c_k = b_k - f(b_k) \frac{b_k-a_k}{f(b_k)-f(a_k)} \)，用符号判据更新区间。
5. 割线法：\( x_{k+1} = x_k - f(x_k)\frac{x_k - x_{k-1}}{f(x_k)-f(x_{k-1})} \)

### 7. 误差与收敛

绝对误差：\( e_{abs,k} = |x_k - x_{k-1}| \)；相对误差：\( e_{rel,k} = e_{abs,k}/\max(1,|x_k|) \)。任一 < 阈值 (默认 1e-7) 即判收敛。

### 8. 默认参数

```
epsilonAbs = 1e-7
epsilonRel = 1e-7
maxIter    = 200
|x|        <= 1e6
|f(x)|     <= 1e12
derivativeThreshold = 1e-12
denominatorThreshold = 1e-14
```

### 9. 更新后的文件结构

```
/
|-- index.html
|-- style.css
|-- main.js
|-- /js
|   |-- state.js
|   |-- ui.js
|   |-- plotter.js
|   |-- /solver
|       |-- fixedPoint.js
|       |-- aitken.js
|       |-- newton.js
|       |-- regulaFalsi.js
|       |-- secant.js
```

### 10. 可选后续增强

* 导出 CSV
* 阻尼牛顿 / 重根提示（未来可加）
* 主题切换与移动端优化
* 收敛阶经验估计
* 批量绘制性能优化

---