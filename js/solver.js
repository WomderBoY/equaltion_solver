// 迭代算法模块

const solver = {
    /**
     * 牛顿法迭代步
     * @param {function} f - 函数 f(x)
     * @param {function} f_prime - 导函数 f'(x)
     * @param {number} x_k - 当前迭代点
     * @returns {number} - 下一个迭代点 x_{k+1}
     */
    newton: (f, f_prime, x_k) => {
        // 计算 f(x_k) 和 f'(x_k)
        const fxk = f(x_k);
        const f_prime_xk = f_prime(x_k);

        // 检查分母是否为零
        if (Math.abs(f_prime_xk) < 1e-10) {
            throw new Error("导数值接近于零，无法继续迭代。");
        }

        return x_k - fxk / f_prime_xk;
    },

    /**
     * 简单迭代法 (不动点迭代) 步
     * @param {function} phi - 迭代函数 φ(x), 用于求解不动点 x = φ(x)
     * @param {number} x_k - 当前迭代点
     * @returns {number} - 下一个迭代点 x_{k+1}
     */
    simpleIteration: (phi, x_k) => {
        // 根据公式 x_{k+1} = φ(x_k) 直接计算
        return phi(x_k);
    },

    /**
     * 埃特肯 (Aitken) 加速法计算步
     * @param {number} x_k - 序列中的第 k 个点
     * @param {number} x_k_plus_1 - 序列中的第 k+1 个点
     * @param {number} x_k_plus_2 - 序列中的第 k+2 个点
     * @returns {number} - 加速后的点
     */
    aitken: (x_k, x_k_plus_1, x_k_plus_2) => {
        const delta_x_sq = Math.pow(x_k_plus_1 - x_k, 2);
        const delta_2_x = x_k_plus_2 - 2 * x_k_plus_1 + x_k;

        // 检查分母是否过小
        if (Math.abs(delta_2_x) < 1e-14) {
            throw new Error("埃特肯加速法分母接近于零，无法计算。");
        }

        return x_k - (delta_x_sq / delta_2_x);
    },

    /**
     * 单点弦截法迭代步
     * @param {function} f - 一个接收数字并返回数字的普通函数 f(x)
     * @param {number} x_k - 当前的迭代点 (活动的点)
     * @param {number} x_0 - 固定的锚点
     * @returns {number} - 下一个迭代点 x_{k+1}
     */
    secantSingle: (f, x_k, x_0) => {
        const fx_k = f(x_k);
        const fx_0 = f(x_0);

        const denominator = fx_k - fx_0;

        // 检查分母是否过小
        if (Math.abs(denominator) < 1e-14) {
            throw new Error("弦截法分母接近于零 (f(x_k) ≈ f(x_0))，无法计算。");
        }
        
        // 使用教科书中的公式
        return x_k - fx_k * (x_k - x_0) / denominator;
    },

    /**
     * 双点弦截法 (割线法) 迭代步
     * @param {function} f - 一个接收数字并返回数字的普通函数 f(x)
     * @param {number} x_k - 当前迭代点 (较新的点)
     * @param {number} x_k_minus_1 - 上一个迭代点 (较旧的点)
     * @returns {number} - 下一个迭代点 x_{k+1}
     */
    secantDouble: (f, x_k, x_k_minus_1) => {
        const fx_k = f(x_k);
        const fx_k_minus_1 = f(x_k_minus_1);

        const denominator = fx_k - fx_k_minus_1;

        // 检查分母是否过小
        if (Math.abs(denominator) < 1e-14) {
            throw new Error("割线法分母接近于零 (f(x_k) ≈ f(x_{k-1}))，无法计算。");
        }
        
        // 使用标准的割线法公式
        return x_k - fx_k * (x_k - x_k_minus_1) / denominator;
    }
};