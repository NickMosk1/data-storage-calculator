import { useState, useCallback } from 'react';
import InputsPanel from './InputsPanel';
import GraphsPanel from './GraphsPanel';
import RadarPanel from './RadarPanel';
import { calculateResults } from '../services/mathModel';

const Calculator = () => {
  const [activeTab, setActiveTab] = useState('inputs');
  const [results, setResults] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const characteristicNames = [
    "Эффективность функционирования хранилища данных",
    "Качество ПО",
    "Корректность ПО",
    "Надежность ПО",
    "Доступность ПО",
    "Возможность интенсивного использования ПО",
    "Прослеживаемость ПО",
    "Функциональная полнота ПО",
    "Обеспечение требуемой последовательности работ при проектировании хранилища",
    "Практичность ПО",
    "Устойчивость к ошибкам данных ПО",
    "Эффективность выполнения транзакций",
    "Степень мотивации персонала",
    "Удобство тестирования ПО"
  ];

  const disturbanceNames = [
    "Увеличение количества источников новых данных",
    "Частота изменения периодов сдачи финансовой отчетности",
    "Сокращение квалифицированной поддержки вендора",
    "Рост интенсивности перехода на Open Source решения",
    "Увеличение количества новых стандартов Open Source"
  ];

  const handleCalculate = useCallback(async (inputData) => {
    setIsCalculating(true);
    try {
      const calculatedResults = await calculateResults(inputData);
      setResults(calculatedResults);
      setActiveTab('graphs');
    } catch (error) {
      console.error('Calculation error:', error);
      alert('Ошибка при расчетах: ' + error.message);
    } finally {
      setIsCalculating(false);
    }
  }, []);

  return (
    <div className="calculator">
      <div className="header">
        <h1>Калькулятор характеристик ПО хранилища данных</h1>
        <p>Математическая модель для расчета 14 характеристик программного обеспечения хранилища данных</p>
      </div>

      <div className="tabs">
        <button 
          className={`tab-button ${activeTab === 'inputs' ? 'active' : ''}`}
          onClick={() => setActiveTab('inputs')}
        >
          Входные параметры
        </button>
        <button 
          className={`tab-button ${activeTab === 'graphs' ? 'active' : ''}`}
          onClick={() => setActiveTab('graphs')}
          disabled={!results}
        >
          Графики характеристик ПО
        </button>
        <button 
          className={`tab-button ${activeTab === 'radar' ? 'active' : ''}`}
          onClick={() => setActiveTab('radar')}
          disabled={!results}
        >
          Лепестковая диаграмма характеристик
        </button>
      </div>

      <div className="tab-content active">
        {activeTab === 'inputs' && (
          <InputsPanel 
            onCalculate={handleCalculate}
            isCalculating={isCalculating}
          />
        )}
        {activeTab === 'graphs' && results && (
          <GraphsPanel 
            results={results}
            characteristicNames={characteristicNames}
            disturbanceNames={disturbanceNames}
          />
        )}
        {activeTab === 'radar' && results && (
          <RadarPanel 
            results={results}
            characteristicNames={characteristicNames}
          />
        )}
      </div>
    </div>
  );
};

export default Calculator;
