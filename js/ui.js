// UI更新模块

const UI = {
    updateInputForm: (method) => {
        const container = document.getElementById('input-area');
        container.innerHTML = ''; // 清空现有内容

        let htmlContent = '';

        switch (method) {
            case 'simple':
            case 'aitken':
                htmlContent = `
                    <label for="phi-func-input">迭代函数 <span data-latex="\\varphi(x)"></span>:</label>
                    <input type="text" id="phi-func-input" placeholder="例如: 1/sqrt(x)">
                    <label for="x0-input">初值 <span data-latex="x_0"></span>:</label>
                    <input type="text" id="x0-input" placeholder="例如: 0.5">
                `;
                break;
            
            case 'newton':
                htmlContent = `
                    <label for="f-func-input">函数 <span data-latex="f(x)"></span>:</label>
                    <input type="text" id="f-func-input" placeholder="例如: e^x - 2">
                    <label for="x0-input">初值 <span data-latex="x_0"></span>:</label>
                    <input type="text" id="x0-input" placeholder="例如: 2">
                `;
                break;
            
            case 'secant_single':
                htmlContent = `
                    <label for="f-func-input">函数 <span data-latex="f(x)"></span>:</label>
                    <input type="text" id="f-func-input" placeholder="例如: -log(x)">
                    <label for="x0-input">固定点 <span data-latex="x_0"></span>:</label>
                    <input type="text" id="x0-input" placeholder="例如: 0.5">
                    <label for="x1-input">迭代初值 <span data-latex="x_1"></span>:</label>
                    <input type="text" id="x1-input" placeholder="例如: 2">
                `;
                break;

            case 'secant_double':
                htmlContent = `
                    <label for="f-func-input">函数 <span data-latex="f(x)"></span>:</label>
                    <input type="text" id="f-func-input" placeholder="例如: e^x - 3">
                    <label for="x0-input">初值 <span data-latex="x_0"></span>:</label>
                    <input type="text" id="x0-input" placeholder="例如: 3">
                    <label for="x1-input">初值 <span data-latex="x_1"></span>:</label>
                    <input type="text" id="x1-input" placeholder="例如: 2">
                `;
                break;

            default:
                htmlContent = '<p style="color: #888;">请选择一种有效的迭代方法。</p>';
        }

        container.innerHTML = htmlContent;
        // 渲染页面中使用 data-latex 占位的数学符号（如果 KaTeX 已加载）
        UI.renderKatex();
    },

    /**
     * 使用 KaTeX 渲染所有带有 data-latex 属性的元素
     */
    renderKatex: () => {
        if (typeof katex === 'undefined') return;
        document.querySelectorAll('[data-latex]').forEach(el => {
            const latex = el.getAttribute('data-latex') || '';
            try {
                katex.render(latex, el, { throwOnError: false });
            } catch (e) {
                // 渲染失败时在控制台输出但不打断流程
                console.error('KaTeX render error:', e);
            }
        });
    },

    /**
     * 从输入框中获取用户输入并返回一个对象
     * @returns {object} 包含用户输入的对象 { funcString, initialValue1, initialValue2 }
     */
    getUserInput: () => {
        const method = appState.currentMethod;
        const inputData = {};

        if (method === 'simple' || method === 'aitken') {
            inputData.funcString = document.getElementById('phi-func-input')?.value.trim();
        } else {
            inputData.funcString = document.getElementById('f-func-input')?.value.trim();
        }

        inputData.initialValue1 = document.getElementById('x0-input')?.value.trim();
        
        if (method === 'secant_double' || method === 'secant_single') {
            inputData.initialValue2 = document.getElementById('x1-input')?.value.trim();
        }

        return inputData;
    },

    /**
     * 在消息区域显示消息
     * @param {string} message - 要显示的消息
     * @param {string} type - 消息类型 ('error', 'success', 'info')
     */
    showMessage: (message, type = 'info') => {
        const messageArea = document.getElementById('message-area');
        messageArea.innerHTML = `<p class="message ${type}">${message}</p>`;
    },

    clearMessage: () => {
        document.getElementById('message-area').innerHTML = '';
    },

    /**
     * 根据历史记录更新结果表格
     * @param {Array} history - 包含迭代历史的对象数组
     */
    updateResultsTable: (history) => {
        const tableBody = document.getElementById('results-table-body');
        tableBody.innerHTML = ''; // 清空现有表格内容

        if (!history || history.length === 0) {
            return;
        }

        history.forEach(item => {
            const row = document.createElement('tr');
            
            const k = `<td>${item.k}</td>`;
            const xk = `<td>${item.x.toFixed(8)}</td>`; // 保留8位小数以提高可读性
            const error = `<td>${item.error !== null ? item.error.toExponential(4) : 'N/A'}</td>`; // 使用科学计数法显示误差

            row.innerHTML = k + xk + error;
            tableBody.appendChild(row);
        });
    },

    /**
     * 清空结果表格和消息
     */
    clearResults: () => {
        document.getElementById('results-table-body').innerHTML = '';
        UI.clearMessage();
    }

};

// 在 DOM 完全加载后尝试渲染页面中所有 data-latex 元素（以防初始表头需要渲染）
document.addEventListener('DOMContentLoaded', () => {
    if (UI && UI.renderKatex) UI.renderKatex();
});