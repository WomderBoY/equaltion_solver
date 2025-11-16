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


};