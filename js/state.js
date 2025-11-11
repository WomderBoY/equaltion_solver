// 全局应用状态
const appState = {
    currentMethod: 'simple', // 将默认方法改为'simple'，因为它的输入最少
    
    // 输入数据
    funcString: '',      // f(x) 或 φ(x) 的字符串表达式
    initialValue1: null, // 初值 x0
    initialValue2: null, // 第二个初值 x1 (仅双点弦截法需要)
    
    // 计算结果
    history: [],         // 存储迭代历史的对象数组 [{k, x, error}, ...]
    
    // 编译后的函数
    func: null,          // f(x) 的编译后函数
    funcPrime: null,     // f'(x) 的导函数 (牛顿法需要)
    phiFunc: null,       // φ(x) 的编译后函数 (简单迭代法需要)

    // 状态标志
    isConverged: false,
    isDiverged: false,
    error: null,         // 存储错误信息
};

// 重置函数，用于清空状态，方便后续使用
function resetState() {
    appState.funcString = '';
    appState.initialValue1 = null;
    appState.initialValue2 = null;
    appState.history = [];
    appState.func = null;
    appState.funcPrime = null;
    appState.phiFunc = null;
    appState.isConverged = false;
    appState.isDiverged = false;
    appState.error = null;
}