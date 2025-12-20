import { useState, useEffect, useCallback } from 'react';
import './InputsPanel.css';

const InputsPanel = ({ onCalculate, isCalculating }) => {
  const [fCoeffs, setFCoeffs] = useState({});
  const [xiCoeffs, setXiCoeffs] = useState({});
  const [xParams, setXParams] = useState({});
  const [isValid, setIsValid] = useState(false);

  const STORAGE_KEYS = {
    fCoeffs: 'math_model_f_coeffs_data_storage',
    xiCoeffs: 'math_model_xi_coeffs_data_storage',
    xParams: 'math_model_x_params_data_storage',
  };

  const generateFArguments = useCallback(() => {
    const args = {};
    
    for (let j = 1; j <= 155; j++) {
      args[j] = ((j - 1) % 14) + 1;
    }
    
    return args;
  }, []);

  const [fArguments] = useState(generateFArguments());

  const loadFromStorage = () => {
    try {
      const savedFCoeffs = localStorage.getItem(STORAGE_KEYS.fCoeffs);
      const savedXiCoeffs = localStorage.getItem(STORAGE_KEYS.xiCoeffs);
      const savedXParams = localStorage.getItem(STORAGE_KEYS.xParams);

      if (savedFCoeffs) {
        setFCoeffs(JSON.parse(savedFCoeffs));
      }
      if (savedXiCoeffs) {
        setXiCoeffs(JSON.parse(savedXiCoeffs));
      }
      if (savedXParams) {
        setXParams(JSON.parse(savedXParams));
      }

      return {
        hasFCoeffs: !!savedFCoeffs,
        hasXiCoeffs: !!savedXiCoeffs,
        hasXParams: !!savedXParams,
      };
    } catch (error) {
      console.error('Ошибка при загрузке из localStorage:', error);
      return { hasFCoeffs: false, hasXiCoeffs: false, hasXParams: false };
    }
  };

  const saveToStorage = () => {
    try {
      localStorage.setItem(STORAGE_KEYS.fCoeffs, JSON.stringify(fCoeffs));
      localStorage.setItem(STORAGE_KEYS.xiCoeffs, JSON.stringify(xiCoeffs));
      localStorage.setItem(STORAGE_KEYS.xParams, JSON.stringify(xParams));
      console.log('Данные сохранены в localStorage');
    } catch (error) {
      console.error('Ошибка при сохранении в localStorage:', error);
    }
  };

  useEffect(() => {
    const hasData = Object.keys(fCoeffs).length > 0 && 
                    Object.keys(xiCoeffs).length > 0 && 
                    Object.keys(xParams).length > 0;
    
    if (hasData) {
      const timeoutId = setTimeout(() => {
        saveToStorage();
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [fCoeffs, xiCoeffs, xParams]);

  useEffect(() => {
    const savedData = loadFromStorage();
    
    if (!savedData.hasFCoeffs && !savedData.hasXiCoeffs && !savedData.hasXParams) {
      initializeData();
    }
  }, []);

  const initializeData = () => {
    const initialFCoeffs = {};
    for (let j = 1; j <= 155; j++) {
      initialFCoeffs[`f${j}_a`] = '';
      initialFCoeffs[`f${j}_b`] = '';
      initialFCoeffs[`f${j}_c`] = '';
      initialFCoeffs[`f${j}_d`] = '';
    }
    setFCoeffs(initialFCoeffs);

    const initialXiCoeffs = {};
    for (let k = 1; k <= 5; k++) {
      initialXiCoeffs[`xi${k}_a`] = '';
      initialXiCoeffs[`xi${k}_b`] = '';
      initialXiCoeffs[`xi${k}_c`] = '';
      initialXiCoeffs[`xi${k}_d`] = '';
    }
    setXiCoeffs(initialXiCoeffs);

    const initialXParams = {};
    for (let i = 1; i <= 14; i++) {
      initialXParams[`x${i}_min`] = '';
      initialXParams[`x${i}_init`] = '';
      initialXParams[`x${i}_max`] = '';
    }
    setXParams(initialXParams);
  };

  useEffect(() => {
    validateAll();
  }, [fCoeffs, xiCoeffs, xParams]);

  const validateAll = () => {
    let valid = true;

    for (let j = 1; j <= 155 && valid; j++) {
      if (!isValidCoefficient(`f${j}_a`) || !isValidCoefficient(`f${j}_b`) ||
          !isValidCoefficient(`f${j}_c`) || !isValidCoefficient(`f${j}_d`)) {
        valid = false;
      }
    }

    for (let k = 1; k <= 5 && valid; k++) {
      if (!isValidCoefficient(`xi${k}_a`) || !isValidCoefficient(`xi${k}_b`) ||
          !isValidCoefficient(`xi${k}_c`) || !isValidCoefficient(`xi${k}_d`)) {
        valid = false;
      }
    }

    for (let i = 1; i <= 14 && valid; i++) {
      const min = parseFloat(xParams[`x${i}_min`]);
      const init = parseFloat(xParams[`x${i}_init`]);
      const max = parseFloat(xParams[`x${i}_max`]);
      
      if (isNaN(min) || isNaN(init) || isNaN(max) || 
          min < 0 || min > 1 || init < 0 || init > 1 || max < 0 || max > 1 ||
          min > init || init > max) {
        valid = false;
      }
    }

    setIsValid(valid);
  };

  const isValidCoefficient = (id) => {
    const value = parseFloat(fCoeffs[id] || xiCoeffs[id]);
    return !isNaN(value) && isFinite(value);
  };

  const handleInputChange = (type, id, value) => {
    if (type === 'f') {
      setFCoeffs(prev => ({ ...prev, [id]: value }));
    } else if (type === 'xi') {
      setXiCoeffs(prev => ({ ...prev, [id]: value }));
    } else if (type === 'x') {
      setXParams(prev => ({ ...prev, [id]: value }));
    }
  };

  const fillRandomValues = () => {
    const newFCoeffs = {};
    for (let j = 1; j <= 155; j++) {
      newFCoeffs[`f${j}_a`] = (Math.random() * 2 - 1).toFixed(2);
      newFCoeffs[`f${j}_b`] = (Math.random() * 2 - 1).toFixed(2);
      newFCoeffs[`f${j}_c`] = (Math.random() * 2 - 1).toFixed(2);
      newFCoeffs[`f${j}_d`] = (Math.random() * 2 - 1).toFixed(2);
    }
    setFCoeffs(newFCoeffs);

    const newXiCoeffs = {};
    for (let k = 1; k <= 5; k++) {
      newXiCoeffs[`xi${k}_a`] = (Math.random() * 0.1).toFixed(3);
      newXiCoeffs[`xi${k}_b`] = (Math.random() * 0.1).toFixed(3);
      newXiCoeffs[`xi${k}_c`] = (Math.random() * 0.2).toFixed(3);
      newXiCoeffs[`xi${k}_d`] = (Math.random() * 0.5).toFixed(3);
    }
    setXiCoeffs(newXiCoeffs);

    const newXParams = {};
    for (let i = 1; i <= 14; i++) {
      const min = Math.random() * 0.3;
      const init = min + Math.random() * (0.7 - min);
      const max = init + Math.random() * (1 - init);

      newXParams[`x${i}_min`] = min.toFixed(2);
      newXParams[`x${i}_init`] = init.toFixed(2);
      newXParams[`x${i}_max`] = max.toFixed(2);
    }
    setXParams(newXParams);
  };

  const handleCalculate = () => {
    if (!isValid) return;

    const inputData = {
      x_params: collectXParams(),
      f_coeffs: collectFCoeffs(),
      xi_coeffs: collectXiCoeffs(),
      t_span: [0, 1],
      num_points: 100
    };

    saveToStorage();
    onCalculate(inputData);
  };

  const collectXParams = () => {
    const params = [];
    for (let i = 1; i <= 14; i++) {
      params.push({
        min: parseFloat(xParams[`x${i}_min`]),
        init: parseFloat(xParams[`x${i}_init`]),
        max: parseFloat(xParams[`x${i}_max`])
      });
    }
    return params;
  };

  const collectFCoeffs = () => {
    const coeffs = [];
    for (let j = 1; j <= 155; j++) {
      coeffs.push({
        a: parseFloat(fCoeffs[`f${j}_a`]),
        b: parseFloat(fCoeffs[`f${j}_b`]),
        c: parseFloat(fCoeffs[`f${j}_c`]),
        d: parseFloat(fCoeffs[`f${j}_d`]),
        x_index: fArguments[j]
      });
    }
    return coeffs;
  };

  const collectXiCoeffs = () => {
    const coeffs = [];
    for (let k = 1; k <= 5; k++) {
      coeffs.push({
        a: parseFloat(xiCoeffs[`xi${k}_a`]),
        b: parseFloat(xiCoeffs[`xi${k}_b`]),
        c: parseFloat(xiCoeffs[`xi${k}_c`]),
        d: parseFloat(xiCoeffs[`xi${k}_d`])
      });
    }
    return coeffs;
  };

  const fillGoodValues = () => {
    console.log('Заполнение нормальными значениями...');
    
    const newFCoeffs = {};
    for (let j = 1; j <= 155; j++) {
      newFCoeffs[`f${j}_a`] = (Math.random() * 0.1 - 0.05).toFixed(3);
      newFCoeffs[`f${j}_b`] = (Math.random() * 0.2 - 0.1).toFixed(3);
      newFCoeffs[`f${j}_c`] = (Math.random() * 0.3 - 0.15).toFixed(3);
      newFCoeffs[`f${j}_d`] = (Math.random() * 0.1 + 0.1).toFixed(3);
    }
    setFCoeffs(newFCoeffs);

    const newXiCoeffs = {};
    for (let k = 1; k <= 5; k++) {
      newXiCoeffs[`xi${k}_a`] = (Math.random() * 0.05 - 0.025).toFixed(4);
      newXiCoeffs[`xi${k}_b`] = (Math.random() * 0.05 - 0.025).toFixed(4);
      newXiCoeffs[`xi${k}_c`] = (Math.random() * 0.1 - 0.05).toFixed(4);
      newXiCoeffs[`xi${k}_d`] = (Math.random() * 0.05 + 0.05).toFixed(4);
    }
    setXiCoeffs(newXiCoeffs);

    const newXParams = {};
    for (let i = 1; i <= 14; i++) {
      const min = (Math.random() * 0.2).toFixed(2);
      const init = (Math.random() * 0.3 + 0.3).toFixed(2);
      const max = (Math.random() * 0.3 + 0.7).toFixed(2);
      
      newXParams[`x${i}_min`] = min;
      newXParams[`x${i}_init`] = init;
      newXParams[`x${i}_max`] = max;
    }
    setXParams(newXParams);
  };

  const characteristicNames = [
    "X₁ - Эффективность функционирования хранилища данных",
    "X₂ - Качество ПО",
    "X₃ - Корректность ПО",
    "X₄ - Надежность ПО",
    "X₅ - Доступность ПО",
    "X₆ - Возможность интенсивного использования ПО",
    "X₇ - Прослеживаемость ПО",
    "X₈ - Функциональная полнота ПО",
    "X₉ - Обеспечение требуемой последовательности работ при проектировании",
    "X₁₀ - Практичность ПО",
    "X₁₁ - Устойчивость к ошибкам данных ПО",
    "X₁₂ - Эффективность выполнения транзакций",
    "X₁₃ - Степень мотивации персонала",
    "X₁₄ - Удобство тестирования ПО"
  ];

  return (
    <div className="tab-content active">
      <div className="widgets-container">
        <div className="widget">
          <h3>Полиномы f<sub>j</sub>(X<sub>i</sub>)</h3>
          <div className="scrollable-list" id="f-polynomials-list">
            {Array.from({ length: 155 }, (_, j) => {
              const funcNum = j + 1;
              const argIndex = fArguments[funcNum];
              return (
                <div key={j} className="polynomial-item">
                  f<sub>{funcNum}</sub>(X<sub>{argIndex}</sub>) = 
                  <input
                    type="number"
                    step="0.01"
                    className="coefficient-input"
                    value={fCoeffs[`f${funcNum}_a`] || ''}
                    onChange={(e) => handleInputChange('f', `f${funcNum}_a`, e.target.value)}
                    placeholder="a"
                  />
                  × (X<sub>{argIndex}</sub>)³ + 
                  <input
                    type="number"
                    step="0.01"
                    className="coefficient-input"
                    value={fCoeffs[`f${funcNum}_b`] || ''}
                    onChange={(e) => handleInputChange('f', `f${funcNum}_b`, e.target.value)}
                    placeholder="b"
                  />
                  × (X<sub>{argIndex}</sub>)² + 
                  <input
                    type="number"
                    step="0.01"
                    className="coefficient-input"
                    value={fCoeffs[`f${funcNum}_c`] || ''}
                    onChange={(e) => handleInputChange('f', `f${funcNum}_c`, e.target.value)}
                    placeholder="c"
                  />
                  × X<sub>{argIndex}</sub> + 
                  <input
                    type="number"
                    step="0.01"
                    className="coefficient-input"
                    value={fCoeffs[`f${funcNum}_d`] || ''}
                    onChange={(e) => handleInputChange('f', `f${funcNum}_d`, e.target.value)}
                    placeholder="d"
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div className="widget">
          <h3>Внешние возмущения ξ<sub>k</sub>(t)</h3>
          <div className="scrollable-list" id="xi-polynomials-list">
            {Array.from({ length: 5 }, (_, k) => {
              const disturbNum = k + 1;
              return (
                <div key={k} className="polynomial-item">
                  ξ<sub>{disturbNum}</sub>(t) = 
                  <input
                    type="number"
                    step="0.001"
                    className="coefficient-input"
                    value={xiCoeffs[`xi${disturbNum}_a`] || ''}
                    onChange={(e) => handleInputChange('xi', `xi${disturbNum}_a`, e.target.value)}
                    placeholder="a"
                  />
                  × t³ + 
                  <input
                    type="number"
                    step="0.001"
                    className="coefficient-input"
                    value={xiCoeffs[`xi${disturbNum}_b`] || ''}
                    onChange={(e) => handleInputChange('xi', `xi${disturbNum}_b`, e.target.value)}
                    placeholder="b"
                  />
                  × t² + 
                  <input
                    type="number"
                    step="0.001"
                    className="coefficient-input"
                    value={xiCoeffs[`xi${disturbNum}_c`] || ''}
                    onChange={(e) => handleInputChange('xi', `xi${disturbNum}_c`, e.target.value)}
                    placeholder="c"
                  />
                  × t + 
                  <input
                    type="number"
                    step="0.001"
                    className="coefficient-input"
                    value={xiCoeffs[`xi${disturbNum}_d`] || ''}
                    onChange={(e) => handleInputChange('xi', `xi${disturbNum}_d`, e.target.value)}
                    placeholder="d"
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div className="widget">
          <h3>Параметры характеристик X<sub>i</sub></h3>
          <div className="x-params-container">
            <div className="characteristics-names">
              <h4>Характеристики ПО</h4>
              {characteristicNames.map((name, index) => {
                const parts = name.split(' - ');
                const number = parts[0];
                
                const displayTitle = name.length > 36
                  ? name.substring(0, 35) + '...'
                  : name;
                
                return (
                  <div 
                    key={index} 
                    className="characteristic-name-item"
                    title={name}
                    data-short={number}
                  >
                    {displayTitle}
                  </div>
                );
              })}
            </div>
            
            <div className="params-column">
              <h4>Мин</h4>
              {Array.from({ length: 14 }, (_, i) => (
                <div key={`min${i}`} className="x-param-item">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={xParams[`x${i+1}_min`] || ''}
                    onChange={(e) => handleInputChange('x', `x${i+1}_min`, e.target.value)}
                    placeholder="0.0-1.0"
                  />
                </div>
              ))}
            </div>
            
            <div className="params-column">
              <h4>Нач</h4>
              {Array.from({ length: 14 }, (_, i) => (
                <div key={`init${i}`} className="x-param-item">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={xParams[`x${i+1}_init`] || ''}
                    onChange={(e) => handleInputChange('x', `x${i+1}_init`, e.target.value)}
                    placeholder="0.0-1.0"
                  />
                </div>
              ))}
            </div>
            
            <div className="params-column">
              <h4>Макс</h4>
              {Array.from({ length: 14 }, (_, i) => (
                <div key={`max${i}`} className="x-param-item">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={xParams[`x${i+1}_max`] || ''}
                    onChange={(e) => handleInputChange('x', `x${i+1}_max`, e.target.value)}
                    placeholder="0.0-1.0"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="widget control-widget">
          <div className="control-content">
            <h3>Управление расчетами</h3>
            <div className="control-buttons">
              <button 
                id="calculate-btn" 
                className="btn primary" 
                onClick={handleCalculate}
                disabled={!isValid || isCalculating}
              >
                {isCalculating ? 'Расчет...' : 'Провести расчеты'}
              </button>
              <button 
                className="btn btn-secondary"
                onClick={fillGoodValues}
              >
                Случайные значения
              </button>
              
              <div className={`validation-status ${isValid ? 'valid' : ''}`} id="validation-status">
                <span className="status-icon">{isValid ? '✓' : '⚠'}</span>
                <span className="status-text">
                  {isValid ? 'Все поля заполнены корректно' : 'Заполните все поля корректными значениями'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InputsPanel;
