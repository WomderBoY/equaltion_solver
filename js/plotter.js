// 绘图模块 (保留历史轨迹 + 垂直虚线 + 整体自适应)
const plotter = (function() {
    let chartOptions = {
        target: '#plot',
        grid: true,
        data: []
    };
    
    // 用于存储所有历史绘图元素
    let historyAnnotations = [];
    // 用于存储所有关键点，以计算整体自适应范围
    let allKeyPoints = [];
    // 用于存储基础函数，以便在重绘时保留它们
    let baseFunctions = [];

    // 内部函数，用于计算最佳的坐标轴范围
    function calculateDomains(points) {
        if (points.length === 0) {
            return { xDomain: [-10, 10], yDomain: [-10, 10] };
        }

        const paddingFactor = 0.2; // 20%的留白

        let minX = points[0][0], maxX = points[0][0];
        let minY = points[0][1], maxY = points[0][1];

        for (const point of points) {
            minX = Math.min(minX, point[0]);
            maxX = Math.max(maxX, point[0]);
            minY = Math.min(minY, point[1]);
            maxY = Math.max(maxY, point[1]);
        }

        if (maxX === minX) { maxX += 1; minX -= 1; }
        if (maxY === minY) { maxY += 1; minY -= 1; }

        const width = maxX - minX;
        const height = maxY - minY;
        const xPadding = width * paddingFactor;
        const yPadding = height * paddingFactor;

        return {
            xDomain: [minX - xPadding, maxX + xPadding],
            yDomain: [minY - yPadding, maxY + yPadding]
        };
    }

    // 提取重绘逻辑，避免代码重复
    function redrawPlot() {
        const domains = calculateDomains(allKeyPoints);
        chartOptions.data = [...baseFunctions, ...historyAnnotations];
        chartOptions.xAxis = { domain: domains.xDomain };
        chartOptions.yAxis = { domain: domains.yDomain };
        functionPlot(chartOptions);
    }

    function initialize() {
        try {
            functionPlot(chartOptions);
            console.log("Plotter initialized successfully.");
        } catch (e) {
            console.error("Failed to initialize plotter:", e);
        }
    }
    
    // 首次绘制主函数，并重置历史记录
    function drawFunction(funcString) {
        // 重置历史记录
        historyAnnotations = [];
        allKeyPoints = [];
        
        // 将主函数存入 baseFunctions 数组
        baseFunctions = [{
            fn: funcString,
            graphType: 'polyline',
            color: 'steelblue'
        }];
        
        chartOptions.data = [...baseFunctions];
        
        // 删除旧的坐标轴范围以进行自动调整
        delete chartOptions.xAxis;
        delete chartOptions.yAxis;

        functionPlot(chartOptions);
    }

    /**
     * 在图上添加 y=x 辅助线
     */
    function drawYEqualsX() {
        baseFunctions.push({
            fn: 'x',
            color: 'grey',
            lineStyle: 'dashed' 
            // function-plot v1.22.8+ 不支持此属性，用 `graphType: 'polyline', fnType: 'linear', daste: '5, 5'` 替代
        });
        chartOptions.data = [...baseFunctions];
        functionPlot(chartOptions);
    }

    /**
     * 绘制简单迭代法的蛛网图 (Cobweb Plot)
     * @param {number} x_k - 上一个迭代点
     * @param {number} next_x - 当前迭代点 (即 phi(x_k))
     */
    function drawCobweb(x_k, next_x) {
        // 蛛网图的路径: (x_k, x_k) -> (x_k, next_x) -> (next_x, next_x)
        const cobwebPoints = [
            [x_k, x_k],
            [x_k, next_x],
            [next_x, next_x]
        ];

        // 1. 创建当前迭代步骤的辅助图形
        const newAnnotations = [
            // 蛛网路径线
            {
                points: cobwebPoints,
                fnType: 'points',
                graphType: 'polyline',
                color: 'purple',
                opacity: 0.8
            },
            // 在函数曲线上的点 (x_k, φ(x_k))
            {
                points: [[x_k, next_x]],
                fnType: 'points',
                graphType: 'scatter',
                color: 'purple',
                attr: { r: 4 }
            },
             // 在 y=x 上的新点 (x_{k+1}, x_{k+1})
            {
                points: [[next_x, next_x]],
                fnType: 'points',
                graphType: 'scatter',
                color: 'green',
                attr: { r: 4 }
            }
        ];

        // 2. 将新的辅助图形追加到历史记录中
        historyAnnotations.push(...newAnnotations);

        // 3. 更新用于计算自适应范围的所有关键点
        allKeyPoints.push(...cobwebPoints);
        if (allKeyPoints.length === 3) { // 第一次迭代时，加入初值的x轴点，确保视图良好
             allKeyPoints.push([x_k, 0]);
        }

        // 4. 调用内部函数重绘
        redrawPlot();
    }

    function drawNewtonTangent(x_k, next_x, f) {
        const y_k = f(x_k);

        const slope = math.derivative(baseFunctions[0].fn, 'x').evaluate({x: x_k});

        const tangentFn = `${slope} * (x - ${x_k}) + ${y_k}`;

        const newAnnotations = [
            // 从 (x_k, 0) 到 (x_k, y_k) 的垂直虚线
            {
                points: [[x_k, 0], [x_k, y_k]],
                fnType: 'points',
                graphType: 'polyline',
                color: 'rgba(128, 128, 128, 0.7)',
                // daste: '2, 2' // (可选) for dashed line
            },
            // 切线
            { 
                fn: tangentFn, 
                color: 'tomato',
                opacity: 0.8
            },
            // 切点 (x_k, y_k)
            { 
                points: [[x_k, y_k]], 
                fnType: 'points', 
                graphType: 'scatter', 
                color: 'tomato', 
                attr: { r: 4 } 
            },
            // 新根 (x_{k+1}, 0)
            { 
                points: [[next_x, 0]], 
                fnType: 'points', 
                graphType: 'scatter', 
                color: 'green', 
                attr: { r: 4 } 
            }
        ];
        
        historyAnnotations.push(...newAnnotations);
        allKeyPoints.push([x_k, y_k], [next_x, 0]);
        if (allKeyPoints.length === 2) {
            allKeyPoints.push([x_k, 0]);
        }

        // 调用内部函数重绘
        redrawPlot();
    }
    
    function clearAll() {
        historyAnnotations = [];
        allKeyPoints = [];
        baseFunctions = [];
        const container = document.querySelector('#plot');
        if (container) container.innerHTML = '';
        chartOptions = {
            target: '#plot',
            grid: true,
            data: []
        };
        delete chartOptions.xAxis;
        delete chartOptions.yAxis;
        functionPlot(chartOptions);
    }

    return {
        initialize,
        drawFunction,
        drawYEqualsX,
        drawCobweb,
        drawNewtonTangent,
        clearAll // 只暴露一个 clearAll
    };
})();