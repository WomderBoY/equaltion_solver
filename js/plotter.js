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
        const container = document.querySelector('#plot');
        if (container) container.innerHTML = '';
        chartOptions.data = [{
            fn: funcString,
            graphType: 'polyline',
            color: 'steelblue'
        }];
        
        delete chartOptions.xAxis;
        delete chartOptions.yAxis;

        functionPlot(chartOptions);
    }

    function drawNewtonTangent(lastState, next_x, f, f_prime) {
        const x_k = lastState.x;
        const y_k = f(x_k);
        const slope = f_prime(x_k);
        const tangentFn = `${slope} * (x - ${x_k}) + ${y_k}`;

        // 1. 创建当前迭代步骤的辅助图形
        const newAnnotations = [
            // 新增：从 (x_k, 0) 到 (x_k, y_k) 的垂直虚线
            {
                vector: [0, y_k], // 向量 [dx, dy]
                offset: [x_k, 0], // 起点
                graphType: 'polyline',
                fnType: 'vector',
                color: 'gray',
                lineStyle: 'dashed' // 使用虚线样式 
            },
            // 使用 points 模拟虚线
            {
                points: [[x_k, 0], [x_k, y_k]],
                fnType: 'points',
                graphType: 'polyline',
                color: 'rgba(128, 128, 128, 0.7)',
            },
            // 切线
            { 
                fn: tangentFn, 
                color: 'tomato',
                // 为不同迭代的切线赋予不同的透明度，使其可区分
                opacity: 0.8 - lastState.k * 0.1 
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
        
        // 2. 将新的辅助图形追加到历史记录中
        historyAnnotations.push(...newAnnotations);

        // 3. 更新用于计算自适应范围的所有关键点
        allKeyPoints.push([x_k, y_k], [next_x, 0]);
        if (allKeyPoints.length === 2) { // 第一次迭代时，加入初值的x轴点
             allKeyPoints.push([x_k, 0]);
        }

        // 4. 计算包含所有历史关键点的最佳视窗
        const domains = calculateDomains(allKeyPoints);

        // 5. 准备最终的 data 数组进行绘制
        const mainFunctionData = chartOptions.data[0];
        chartOptions.data = [mainFunctionData, ...historyAnnotations];
        
        // 6. 应用新的坐标轴范围并重绘
        chartOptions.xAxis = { domain: domains.xDomain };
        chartOptions.yAxis = { domain: domains.yDomain };

        functionPlot(chartOptions);
    }
    
    function clearAll() {
        historyAnnotations = [];
        allKeyPoints = [];
        const container = document.querySelector('#plot');
        if (container) container.innerHTML = '';
        chartOptions = {
            target: '#plot',
            grid: true,
            data: []
        };
        // delete chartOptions.xAxis;
        // delete chartOptions.yAxis;
        functionPlot(chartOptions);
    }

    return {
        initialize,
        drawFunction,
        drawNewtonTangent,
        clearAll // 只暴露一个 clearAll
    };
})();