class DataStorageModelJS {
    constructor() {
        this.X_min = new Array(14).fill(0);
        this.X_init = new Array(14).fill(0);
        this.X_max = new Array(14).fill(1);
        
        this.f_coeffs = {};
        this.f_indices = {}; // Новое: храним индексы X для каждого f
        
        this.xi_coeffs = {};
    }
    
    set_X_params(i, min_val, init_val, max_val) {
        this.X_min[i-1] = min_val;
        this.X_init[i-1] = init_val;
        this.X_max[i-1] = max_val;
    }
    
    set_f_poly(j, a, b, c, d, X_index) {
        this.f_coeffs[j] = { a, b, c, d };
        this.f_indices[j] = X_index - 1; // Сохраняем индекс X для этого f
    }
    
    set_xi_poly(k, a, b, c, d) {
        this.xi_coeffs[k] = { a, b, c, d };
    }
    
    compute_f(j, X) {
        if (!this.f_coeffs[j]) return 1.0;
        const { a, b, c, d } = this.f_coeffs[j];
        const idx = this.f_indices[j];
        const X_val = X[idx];
        return a * Math.pow(X_val, 3) + b * Math.pow(X_val, 2) + c * X_val + d;
    }
    
    compute_xi_raw(k, t) {
        if (!this.xi_coeffs[k]) return 0.0;
        const { a, b, c, d } = this.xi_coeffs[k];
        return a * Math.pow(t, 3) + b * Math.pow(t, 2) + c * t + d;
    }
    
    compute_xi_normalized(k, t, xi_global_max) {
        const raw_value = this.compute_xi_raw(k, t);
        return xi_global_max > 0
            ? Math.max(0.0, Math.min(1.0, raw_value / xi_global_max))
            : 0.0;
    }
    
    rhs_normalized_corrected(t, X, xi_global_max) {
        const dXdt = new Array(14).fill(0);
        const epsilon = 0.0001; // Для избежания деления на 0
        
        // ξ уже нормализованы относительно xi_global_max
        const xi = [1, 2, 3, 4, 5].map(k => 
            this.compute_xi_normalized(k, t, xi_global_max)
        );
        
        // dX1/dt = 1/X1 * (...)
        dXdt[0] = (1.0 / (X[0] + epsilon)) * (
            this.compute_f(1, X) * this.compute_f(2, X) * this.compute_f(3, X) * 
            this.compute_f(4, X) * this.compute_f(5, X) * this.compute_f(6, X) * 
            this.compute_f(7, X) * this.compute_f(8, X) * this.compute_f(9, X) * 
            this.compute_f(10, X) * this.compute_f(11, X) * this.compute_f(12, X) * 
            this.compute_f(13, X) * this.compute_f(14, X) * 
            (xi[0] + xi[1] + xi[2]) - xi[3] - xi[4]
        );
        
        // dX2/dt = 1/X2 * (...)
        dXdt[1] = (1.0 / (X[1] + epsilon)) * (
            this.compute_f(15, X) * this.compute_f(16, X) * this.compute_f(17, X) * 
            this.compute_f(18, X) * this.compute_f(19, X) * this.compute_f(20, X) * 
            this.compute_f(21, X) * this.compute_f(22, X) * this.compute_f(23, X) * 
            this.compute_f(24, X) * this.compute_f(25, X) * this.compute_f(26, X) * 
            this.compute_f(27, X) * this.compute_f(28, X) * 
            (xi[0] + xi[1] + xi[2] + xi[3]) - xi[4]
        );
        
        // dX3/dt = 1/X3 * (...)
        dXdt[2] = (1.0 / (X[2] + epsilon)) * (
            this.compute_f(29, X) * this.compute_f(30, X) * this.compute_f(31, X) * 
            this.compute_f(32, X) * this.compute_f(33, X) * this.compute_f(34, X) * 
            this.compute_f(35, X) * this.compute_f(36, X) * this.compute_f(37, X) * 
            this.compute_f(38, X) * this.compute_f(39, X) * this.compute_f(40, X) * 
            this.compute_f(41, X) * this.compute_f(42, X) * 
            (xi[0] + xi[1] + xi[2] + xi[3]) - xi[4]
        );
        
        // dX4/dt = 1/X4 * (...)
        dXdt[3] = (1.0 / (X[3] + epsilon)) * (
            this.compute_f(43, X) * this.compute_f(44, X) * this.compute_f(45, X) * 
            this.compute_f(46, X) * this.compute_f(47, X) * this.compute_f(48, X) * 
            this.compute_f(49, X) * this.compute_f(50, X) * this.compute_f(51, X) * 
            this.compute_f(52, X) * this.compute_f(53, X) * this.compute_f(54, X) * 
            this.compute_f(55, X) * this.compute_f(56, X) * xi[4] - 
            (xi[0] + xi[1] + xi[2] + xi[3])
        );
        
        // dX5/dt = 1/X5 * (...)
        dXdt[4] = (1.0 / (X[4] + epsilon)) * (
            this.compute_f(57, X) * this.compute_f(58, X) * this.compute_f(59, X) * 
            this.compute_f(60, X) * this.compute_f(61, X) * 
            (xi[0] + xi[1] + xi[3] + xi[4]) - xi[4]
        );
        
        // dX6/dt = 1/X6 * (...)
        dXdt[5] = (1.0 / (X[5] + epsilon)) * (
            this.compute_f(62, X) * this.compute_f(63, X) * this.compute_f(64, X) * 
            this.compute_f(65, X) * this.compute_f(66, X) * this.compute_f(67, X) * 
            this.compute_f(68, X) * this.compute_f(69, X) * this.compute_f(70, X) * 
            this.compute_f(71, X) * this.compute_f(72, X) * this.compute_f(73, X) * 
            this.compute_f(74, X) * this.compute_f(75, X) * 
            (xi[0] + xi[1]) - xi[4]
        );
        
        // dX7/dt = 1/X7 * (...)
        dXdt[6] = (1.0 / (X[6] + epsilon)) * (
            this.compute_f(76, X) * this.compute_f(77, X) * this.compute_f(78, X) - 
            xi[4]
        );
        
        // dX8/dt = 1/X8 * (...)
        dXdt[7] = (1.0 / (X[7] + epsilon)) * (
            this.compute_f(79, X) * this.compute_f(80, X) * this.compute_f(81, X) * 
            this.compute_f(82, X) * this.compute_f(83, X) * this.compute_f(84, X) * 
            this.compute_f(85, X) * 
            (xi[0] + xi[1] + xi[2]) - xi[0] - xi[1]
        );
        
        // dX9/dt = 1/X9 * (...)
        dXdt[8] = (1.0 / (X[8] + epsilon)) * (
            this.compute_f(86, X) * this.compute_f(87, X) * this.compute_f(88, X) * 
            this.compute_f(89, X) * this.compute_f(90, X) * this.compute_f(91, X) * 
            this.compute_f(92, X) * this.compute_f(93, X) * this.compute_f(94, X) * 
            this.compute_f(95, X) * this.compute_f(96, X) * this.compute_f(97, X) * 
            this.compute_f(98, X) * this.compute_f(99, X) * 
            (xi[3] + xi[4]) - xi[0] - xi[1] - xi[2]
        );
        
        // dX10/dt = 1/X10 * (...)
        dXdt[9] = (1.0 / (X[9] + epsilon)) * (
            this.compute_f(100, X) * this.compute_f(101, X) * this.compute_f(102, X) * 
            this.compute_f(103, X) * this.compute_f(104, X) * this.compute_f(105, X) * 
            this.compute_f(106, X) * this.compute_f(107, X) * this.compute_f(108, X) * 
            this.compute_f(109, X) * this.compute_f(110, X) * this.compute_f(111, X) * 
            (xi[0] + xi[1]) - 
            this.compute_f(112, X) * this.compute_f(113, X) * xi[2]
        );
        
        // dX11/dt = 1/X11 * (...)
        dXdt[10] = (1.0 / (X[10] + epsilon)) * (
            this.compute_f(114, X) * this.compute_f(115, X) * this.compute_f(116, X) * 
            this.compute_f(117, X) * this.compute_f(118, X) * this.compute_f(119, X) * 
            this.compute_f(120, X) * this.compute_f(121, X) * this.compute_f(122, X) - 
            (this.compute_f(123, X) * this.compute_f(124, X) * 
            (xi[0] + xi[1] + xi[2] + xi[3] + xi[4]))
        );
        
        // dX12/dt = 1/X12 * (...)
        dXdt[11] = (1.0 / (X[11] + epsilon)) * (
            this.compute_f(125, X) * this.compute_f(126, X) * this.compute_f(127, X) * 
            this.compute_f(128, X) * this.compute_f(129, X) * this.compute_f(130, X) * 
            this.compute_f(131, X) * this.compute_f(132, X) * this.compute_f(133, X) * 
            this.compute_f(134, X) * this.compute_f(135, X) * this.compute_f(136, X) * 
            this.compute_f(137, X) * 
            (xi[0] + xi[3] + xi[4]) - xi[2]
        );
        
        // dX13/dt = 1/X13 * (...)
        dXdt[12] = (1.0 / (X[12] + epsilon)) * (
            this.compute_f(138, X) * this.compute_f(139, X) * this.compute_f(140, X) * 
            this.compute_f(141, X) * this.compute_f(142, X) * this.compute_f(143, X) * 
            this.compute_f(144, X) * this.compute_f(145, X) * this.compute_f(146, X) * 
            this.compute_f(147, X) * this.compute_f(148, X) * this.compute_f(149, X) * 
            this.compute_f(150, X) - 
            this.compute_f(151, X) * (xi[0] + xi[1] + xi[2] + xi[3] + xi[4])
        );
        
        // dX14/dt = 1/X14 * (...)
        dXdt[13] = (1.0 / (X[13] + epsilon)) * (
            this.compute_f(152, X) * this.compute_f(153, X) * this.compute_f(154, X) * 
            this.compute_f(155, X) - 
            (xi[0] + xi[1] + xi[2] + xi[3] + xi[4])
        );
        
        // Ограничиваем скорость изменения
        for (let i = 0; i < dXdt.length; i++) {
            dXdt[i] = Math.max(-5.0, Math.min(5.0, dXdt[i]));
        }
        
        return dXdt;
    }

    solve(t_span = [0, 1], num_points = 100) {
        try {
            const [t0, t1] = t_span;
            const dt = (t1 - t0) / (num_points - 1);
            const time_points = Array.from({length: num_points}, (_, i) => t0 + i * dt);

            console.log("Шаг 1: Находим максимальные значения ξ...");
            const xi_raw_values = [];
            for (let k = 1; k <= 5; k++) {
                const xi_values = time_points.map(t => Math.abs(this.compute_xi_raw(k, t)));
                xi_raw_values.push(Math.max(...xi_values));
            }
            const xi_global_max = Math.max(...xi_raw_values, 1.0);
            console.log(`Максимальное значение ξ: ${xi_global_max}`);

            console.log("Шаг 2: Предварительный расчет для нахождения X_global_max...");
            let X_global_max = 1.0;
            let testX = this.X_init.map(val => Math.max(0.001, Math.min(1.0, val)));
            
            for (let iter = 0; iter < 100; iter++) {
                for (let i = 0; i < time_points.length; i++) {
                    const t = time_points[i];
                    const dXdt = this.rhs_normalized_corrected(t, testX, xi_global_max);
                    
                    testX = testX.map((val, idx) => {
                        let newVal = val + dXdt[idx] * dt * 0.1; // Меньший шаг для теста
                        // Собираем максимальные значения
                        X_global_max = Math.max(X_global_max, Math.abs(newVal));
                        return Math.max(0.001, Math.min(1.0, newVal));
                    });
                }
            }
            
            // Добавляем запас 20%
            X_global_max = X_global_max * 1.2;
            console.log(`Оценочное максимальное значение X: ${X_global_max}`);

            console.log("Шаг 3: Основной расчет с полной нормализацией...");
            const t = [];
            const X = Array(14).fill().map(() => []);
            const xi = Array(5).fill().map(() => []);
            
            // Нормализуем начальные значения относительно X_global_max
            let currentX = this.X_init.map((val, idx) => {
                const normalized = val / X_global_max;
                return Math.max(
                    this.X_min[idx] / X_global_max, 
                    Math.min(this.X_max[idx] / X_global_max, normalized)
                );
            });
            
            for (let i = 0; i < num_points; i++) {
                const currentT = time_points[i];
                t.push(currentT);
                
                // Сохраняем денормализованные значения для вывода
                currentX.forEach((val, idx) => {
                    X[idx].push(val * X_global_max);
                });
                
                // Сохраняем нормализованные ξ
                for (let k = 1; k <= 5; k++) {
                    xi[k-1].push(this.compute_xi_normalized(k, currentT, xi_global_max));
                }
                
                if (i < num_points - 1) {
                    // Метод Рунге-Кутта 4-го порядка
                    const k1 = this.rhs_normalized_corrected(currentT, currentX, xi_global_max);
                    
                    const X2 = currentX.map((val, idx) => val + k1[idx] * dt/2);
                    const k2 = this.rhs_normalized_corrected(currentT + dt/2, X2, xi_global_max);
                    
                    const X3 = currentX.map((val, idx) => val + k2[idx] * dt/2);
                    const k3 = this.rhs_normalized_corrected(currentT + dt/2, X3, xi_global_max);
                    
                    const X4 = currentX.map((val, idx) => val + k3[idx] * dt);
                    const k4 = this.rhs_normalized_corrected(currentT + dt, X4, xi_global_max);
                    
                    currentX = currentX.map((val, idx) => {
                        let newVal = val + (k1[idx] + 2*k2[idx] + 2*k3[idx] + k4[idx]) * dt / 6;
                        
                        // Ограничиваем значения в нормализованном виде
                        newVal = Math.max(0.0, Math.min(1.0, newVal));
                        
                        // Учитываем границы пользователя (также нормализованные)
                        const minNorm = this.X_min[idx] / X_global_max;
                        const maxNorm = this.X_max[idx] / X_global_max;
                        newVal = Math.max(minNorm, Math.min(maxNorm, newVal));
                        
                        return newVal;
                    });
                }
            }
            
            console.log("Расчет завершен успешно");
            return { 
                t, 
                X,
                xi,
                X_global_max, 
                xi_global_max,
                X_norm: X.map(arr => arr.map(v => v / X_global_max)),
                xi_norm: xi
            };
            
        } catch (error) {
            console.error(`Ошибка в расчете: ${error}`);
            console.error(error.stack);
            
            // Возвращаем данные по умолчанию при ошибке
            const t = Array.from({length: num_points}, (_, i) => 
                t_span[0] + (t_span[1] - t_span[0]) * i / (num_points - 1)
            );
            const X = Array(14).fill().map(() => Array(num_points).fill(0.5));
            const xi = Array(5).fill().map(() => Array(num_points).fill(0.5));
            return { 
                t, 
                X, 
                xi, 
                X_global_max: 1.0, 
                xi_global_max: 1.0,
                X_norm: X,
                xi_norm: xi
            };
        }
    }
}

export const calculateResults = async (inputData) => {
    const model = new DataStorageModelJS();

    inputData.x_params.forEach((params, i) => {
        model.set_X_params(i+1, params.min, params.init, params.max);
    });

    inputData.f_coeffs.forEach((coeff, i) => {
        model.set_f_poly(i+1, coeff.a, coeff.b, coeff.c, coeff.d, coeff.x_index);
    });

    inputData.xi_coeffs.forEach((coeff, i) => {
        model.set_xi_poly(i+1, coeff.a, coeff.b, coeff.c, coeff.d);
    });

    return model.solve(inputData.t_span, inputData.num_points);
};

export default DataStorageModelJS;
