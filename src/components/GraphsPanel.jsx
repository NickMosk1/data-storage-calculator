import { useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const GraphsPanel = ({ results }) => {
  const chartRefs = useRef([]);

  if (!results || !results.t || !results.X) {
    return (
      <div className="tab-content active">
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h3>Графики характеристик ПО</h3>
          <p>Нет данных для отображения. Выполните расчеты на вкладке "Ввод данных".</p>
        </div>
      </div>
    );
  }

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

  const colorTriplets = [
    [
      '#00aeff',
      '#ff7c43',
      '#2f4b7c',
    ],
    [
      '#a05195',
      '#ffa600',
      '#d45087',
    ],
    [
      '#665191',
      '#f95d6a',
      '#ff7c00',
    ],
    [
      '#00a86b',
      '#8a2be2',
      '#ff4500',
    ],
    [
      '#008080',
      '#ff1493',
      '#ffd700',
    ]
  ];

  const getMaxValue = (dataArray) => {
    if (!Array.isArray(dataArray) || dataArray.length === 0) return 1;
    let max = 0;
    dataArray.forEach(data => {
      if (Array.isArray(data)) {
        const localMax = Math.max(...data);
        if (localMax > max) max = localMax;
      }
    });
    return Math.ceil(max * 1.1 * 10) / 10 || 1;
  };

  const getAdaptiveOptions = (chartData, chartType = 'X') => {
    const maxY = getMaxValue(chartData.datasets.map(ds => ds.data));
    
    return {
      responsive: true,
      maintainAspectRatio: false,
      onHover: (event, chartElements) => {
        const canvas = event.native?.target;
        if (canvas) {
          if (chartElements && chartElements.length > 0) {
            canvas.style.cursor = 'none';
          } else {
            canvas.style.cursor = 'default';
          }
        }
      },
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          titleFont: {
            size: 16,
            family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            weight: '500'
          },
          bodyFont: {
            size: 15,
            family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            weight: '400'
          },
          padding: 16,
          cornerRadius: 8,
          displayColors: false,
          callbacks: {
            beforeBody: function(context) {
              context.sort((a, b) => {
                const aValue = a.parsed.y;
                const bValue = b.parsed.y;
                return bValue - aValue;
              });
              return '';
            }
          }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Время t',
            font: {
              size: 18,
              weight: 'bold',
              family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
            }
          },
          grid: {
            color: 'rgba(0,0,0,0.1)',
            lineWidth: 1
          },
          ticks: {
            font: {
              size: 14,
              family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
            }
          }
        },
        y: {
          title: {
            display: true,
            text: 'Значение',
            font: {
              size: 18,
              weight: 'bold',
              family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
            }
          },
          min: 0,
          max: maxY,
          grid: {
            color: 'rgba(0,0,0,0.1)',
            lineWidth: 1
          },
          ticks: {
            font: {
              size: 14,
              family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
            },
            callback: function(value) {
              return value.toFixed(2);
            },
            stepSize: maxY > 1 ? maxY / 5 : 0.2
          }
        }
      },
      elements: {
        point: {
          radius: 0,
          hoverRadius: 6,
          hitRadius: 10
        },
        line: {
          tension: 0.3
        }
      }
    };
  };

  const labels = Array.isArray(results.t) ? results.t.map(t => t.toFixed(2)) : [];

  const sortDatasetsByFinalValue = (datasetsWithIndices) => {
    return datasetsWithIndices.sort((a, b) => {
      const aData = a.data;
      const bData = b.data;
      if (!aData || !bData || aData.length === 0 || bData.length === 0) return 0;
      const aLastValue = aData[aData.length - 1];
      const bLastValue = bData[bData.length - 1];
      return bLastValue - aLastValue;
    });
  };

  const createChartData = (tripletIndex, indices) => {
    const colors = colorTriplets[tripletIndex];
    const datasetsWithIndices = [];
    
    indices.forEach((globalIndex, localIndex) => {
      if (globalIndex < results.X.length) {
        datasetsWithIndices.push({
          label: `X${globalIndex + 1}`,
          data: Array.isArray(results.X[globalIndex]) ? results.X[globalIndex] : [],
          borderColor: colors[localIndex],
          backgroundColor: colors[localIndex] + '20',
          borderWidth: 3,
          tension: 0.3,
          fill: false,
          pointRadius: 0,
          pointHoverRadius: 6,
          originalIndex: globalIndex,
          colorIndex: localIndex
        });
      }
    });
    
    const sortedDatasets = sortDatasetsByFinalValue(datasetsWithIndices);
    
    return {
      labels: labels,
      datasets: sortedDatasets.map(ds => ({
        label: ds.label,
        data: ds.data,
        borderColor: ds.borderColor,
        backgroundColor: ds.backgroundColor,
        borderWidth: ds.borderWidth,
        tension: ds.tension,
        fill: ds.fill,
        pointRadius: ds.pointRadius,
        pointHoverRadius: ds.pointHoverRadius
      })),
      originalIndices: sortedDatasets.map(ds => ds.originalIndex),
      originalColors: sortedDatasets.map(ds => ds.borderColor)
    };
  };

  const chartGroups = [
    {
      title: "Основные характеристики эффективности",
      indices: [0, 1, 2],
      data: null,
      tripletIndex: 0
    },
    {
      title: "Эксплуатационные характеристики",
      indices: [3, 4, 5],
      data: null,
      tripletIndex: 1
    },
    {
      title: "Функциональные характеристики",
      indices: [6, 7, 8],
      data: null,
      tripletIndex: 2
    },
    {
      title: "Качественные характеристики ПО",
      indices: [9, 10, 11],
      data: null,
      tripletIndex: 3
    },
    {
      title: "Организационные и тестировочные характеристики",
      indices: [12, 13],
      data: null,
      tripletIndex: 4
    }
  ];

  chartGroups.forEach((group, index) => {
    group.data = createChartData(group.tripletIndex, group.indices);
  });

  const handleChartRef = (index) => (ref) => {
    chartRefs.current[index] = ref;
    
    if (ref?.canvas) {
      ref.canvas.style.cursor = 'default';
      ref.canvas.style.pointerEvents = 'auto';
    }
  };

  const ChartWithLabels = ({ chartData, title, originalIndices, originalColors }) => {
    const chartHeight = 400;
    
    const getSortedLabels = () => {
      const labelsWithValues = [];
      chartData.datasets.forEach((dataset, index) => {
        const data = dataset.data;
        if (data && data.length > 0) {
          const lastValue = data[data.length - 1];
          const originalGlobalIndex = originalIndices[index];
          labelsWithValues.push({
            label: `X${originalGlobalIndex + 1}`,
            value: lastValue,
            color: originalColors[index],
            originalIndex: originalGlobalIndex,
            datasetIndex: index
          });
        }
      });
      
      return labelsWithValues.sort((a, b) => b.value - a.value);
    };

    const sortedLabels = getSortedLabels();

    return (
      <div style={{ 
        marginBottom: '40px', 
        backgroundColor: 'white', 
        padding: '30px', 
        borderRadius: '15px', 
        boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
        border: '3px solid #e9ecef',
        position: 'relative'
      }}>
        <h2 style={{ 
          marginBottom: '25px', 
          textAlign: 'center', 
          color: '#2c3e50',
          fontSize: '28px',
          fontWeight: '700',
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          paddingBottom: '15px',
          borderBottom: '3px solid #f0f0f0'
        }}>
          {title}
        </h2>
        
        <div style={{ 
          height: `${chartHeight}px`,
          position: 'relative',
          width: '100%'
        }}>
          {/* График */}
          <div style={{ 
            height: '100%',
            position: 'relative',
            zIndex: 20
          }}>
            <Line 
              ref={handleChartRef(originalIndices[0])}
              data={chartData} 
              options={getAdaptiveOptions(chartData, 'X')}
            />
          </div>
        </div>
        
        {/* Детальная легенда с полными названиями */}
        <div style={{
          marginTop: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
          backgroundColor: '#f8f9fa',
          padding: '20px',
          borderRadius: '12px',
          border: '2px solid #e9ecef'
        }}>
          <h4 style={{ 
            textAlign: 'center',
            marginBottom: '10px',
            color: '#2c3e50',
            fontSize: '20px',
            fontWeight: '600',
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
          }}>
            Подробная информация (отсортировано по убыванию конечных значений)
          </h4>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '15px'
          }}>
            {sortedLabels.map((label, idx) => {
              const globalIndex = label.originalIndex;
              const data = results.X[globalIndex];
              const max = data && data.length > 0 ? Math.max(...data).toFixed(3) : '0.000';
              const min = data && data.length > 0 ? Math.min(...data).toFixed(3) : '0.000';
              const avg = data && data.length > 0 
                ? (data.reduce((a, b) => a + b, 0) / data.length).toFixed(3) 
                : '0.000';
              const lastValue = data && data.length > 0 ? data[data.length - 1].toFixed(3) : '0.000';
              
              return (
                <div key={idx} style={{
                  backgroundColor: 'white',
                  padding: '15px',
                  borderRadius: '8px',
                  border: `2px solid ${label.color}30`,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px',
                    marginBottom: '10px'
                  }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      backgroundColor: label.color,
                      borderRadius: '4px'
                    }}></div>
                    <span style={{ 
                      fontSize: '18px', 
                      fontWeight: '700',
                      color: label.color,
                      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
                    }}>
                      {label.label}
                    </span>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#666',
                      marginLeft: 'auto',
                      backgroundColor: '#e9ecef',
                      padding: '2px 8px',
                      borderRadius: '4px'
                    }}>
                      Порядок: {idx + 1}
                    </span>
                  </div>
                  
                  <div style={{ 
                    fontSize: '16px', 
                    color: '#555',
                    marginBottom: '15px',
                    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
                  }}>
                    {characteristicNames[globalIndex].split(' - ')[1]}
                  </div>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '8px',
                    fontSize: '14px'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: '600', color: '#666' }}>Мин</div>
                      <div style={{ fontWeight: '700', color: '#dc3545' }}>{min}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: '600', color: '#666' }}>Ср</div>
                      <div style={{ fontWeight: '700', color: '#17a2b8' }}>{avg}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: '600', color: '#666' }}>Макс</div>
                      <div style={{ fontWeight: '700', color: '#28a745' }}>{max}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: '600', color: '#666' }}>Конец</div>
                      <div style={{ fontWeight: '700', color: label.color }}>{lastValue}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="tab-content active">
      <div style={{ padding: '30px' }}>
        {/* Графики характеристик ПО */}
        {chartGroups.map((group, index) => (
          <ChartWithLabels
            key={index}
            chartData={group.data}
            title={group.title}
            originalIndices={group.data.originalIndices}
            originalColors={group.data.originalColors}
          />
        ))}
      </div>
    </div>
  );
};

export default GraphsPanel;
