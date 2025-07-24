// 页面加载完成处理
document.addEventListener('DOMContentLoaded', function() {
  // 页面加载动画
  setTimeout(() => {
    document.body.classList.remove('loading');
  }, 300);
  
  // 初始化表单处理器
  initializeFormHandlers();
  
  // 添加键盘快捷键支持
  document.addEventListener('keydown', handleKeyboardShortcuts);
});

// 初始化表单处理器
function initializeFormHandlers() {
  const selects = ['j', 'rsi', 'volume', 'cycle'];
  
  selects.forEach(id => {
    const select = document.getElementById(id);
    select.addEventListener('change', validateForm);
  });
}

// 表单验证
function validateForm() {
  const j = document.getElementById("j").value;
  const rsi = document.getElementById("rsi").value;
  const analyzeBtn = document.getElementById("analyze-btn");
  
  if (j && rsi) {
    analyzeBtn.style.opacity = '1';
    analyzeBtn.disabled = false;
  } else {
    analyzeBtn.style.opacity = '0.6';
    analyzeBtn.disabled = true;
  }
}

// 键盘快捷键处理
function handleKeyboardShortcuts(e) {
  // Enter键快速分析
  if (e.key === 'Enter' && !e.ctrlKey && !e.metaKey) {
    const activeElement = document.activeElement;
    if (activeElement.tagName === 'SELECT') {
      e.preventDefault();
      judgeSignal();
    }
  }
  
  // Escape键清除结果
  if (e.key === 'Escape') {
    const resultContainer = document.getElementById("result-container");
    if (resultContainer.style.display === 'block') {
      resultContainer.style.display = 'none';
    }
  }
}

// 主要分析函数
function judgeSignal() {
  const j = parseFloat(document.getElementById("j").value);
  const rsi = parseFloat(document.getElementById("rsi").value);
  const volume = document.getElementById("volume").value;
  const cycle = document.getElementById("cycle").value;
  const resultContainer = document.getElementById("result-container");
  const resultTextBox = document.getElementById("result-text");
  const analyzeBtn = document.getElementById("analyze-btn");

  // 输入验证
  if (isNaN(j) || isNaN(rsi)) {
    showNotification("⚠️ 请至少选择 J 值和 RSI 值", "warning");
    return;
  }

  // 添加加载状态
  analyzeBtn.classList.add('loading');
  
  // 触觉反馈
  if (navigator.vibrate) {
    navigator.vibrate(50);
  }

  // 模拟分析过程
  setTimeout(() => {
    performAnalysis(j, rsi, volume, cycle, resultContainer, resultTextBox);
    analyzeBtn.classList.remove('loading');
  }, 1000);
}

// 执行分析
function performAnalysis(j, rsi, volume, cycle, resultContainer, resultTextBox) {
  // 智能分析逻辑
  let signal = generateAnalysisSignal(j, rsi, volume);
  let cycleText = getCycleDescription(cycle);
  let riskLevel = calculateRiskLevel(j, rsi);
  
  // 组合分析结果
  const fullAnalysis = `${signal}\n\n${cycleText}\n\n${getRiskWarning(riskLevel)}`;
  
  resultTextBox.innerText = fullAnalysis;
  
  // 显示结果区域并渲染图表
  resultContainer.style.display = 'block';
  
  // 滚动到结果区域
  setTimeout(() => {
    resultContainer.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'nearest' 
    });
  }, 100);
  
  renderPreviewChart(j, rsi);
  
  // 保存分析历史
  saveAnalysisHistory({ j, rsi, volume, cycle, signal, timestamp: new Date().toISOString() });
}

// 生成分析信号
function generateAnalysisSignal(j, rsi, volume) {
  let signal = "📊 当前市场暂无明显信号，建议耐心观察，不宜贸然操作。";
  
  // 强烈买入信号
  if (j <= 10 && rsi <= 30) {
    signal = "🟢 强烈买入信号：J值与RSI都处于极低位，市场处在相对底部区域，是逢低吸纳的良好机会。";
  }
  // 强烈卖出信号
  else if (j >= 90 && rsi >= 70) {
    signal = "🔴 强烈卖出信号：J值与RSI都在高位，市场短期有见顶压力，建议逐步减仓或考虑止盈。";
  }
  // 买入信号
  else if (j <= 30 && rsi <= 40) {
    signal = "🟡 买入信号：指标偏低，虽未极端但已显示超卖迹象，可关注反弹机会。";
  }
  // 卖出信号
  else if (j >= 70 && rsi >= 60) {
    signal = "🟠 卖出信号：指标偏高，市场可能过热，需防范回调风险。";
  }
  // 中性区域
  else if (j >= 40 && j <= 60 && rsi >= 45 && rsi <= 55) {
    signal = "⚪ 中性区域：指标处于均衡状态，建议观望，等待更明确的信号。";
  }

  // 成交量确认
  if (volume) {
    if (volume === "high" && (j <= 30 || rsi <= 40)) {
      signal += "\n\n✅ 放量确认：下跌伴随放量，增强了底部信号的可靠性。";
    } else if (volume === "high" && (j >= 70 || rsi >= 60)) {
      signal += "\n\n⚠️ 放量警告：上涨伴随放量，但指标已高，需警惕冲高回落。";
    } else if (volume === "low" && (j >= 70 || rsi >= 60)) {
      signal += "\n\n🚨 缩量警告：上涨但缩量，动力不足，可能是诱多行情。";
    }
  }

  return signal;
}

// 获取周期描述
function getCycleDescription(cycle) {
  const descriptions = {
    "week": "📅 周K分析：中期趋势参考，信号更具延续性，适合中长线投资决策。",
    "hour": "⏰ 小时K分析：短线信号参考，波动较快，适合日内交易操作。",
    "day": "📈 日K分析：日常主要参考，平衡波动与趋势，适合大多数投资策略。"
  };
  
  return descriptions[cycle] || descriptions["day"];
}

// 计算风险等级
function calculateRiskLevel(j, rsi) {
  const extremeHigh = (j >= 90 || rsi >= 80);
  const extremeLow = (j <= 10 || rsi <= 20);
  const high = (j >= 70 || rsi >= 70);
  const low = (j <= 30 || rsi <= 30);
  
  if (extremeHigh) return "extreme-high";
  if (extremeLow) return "extreme-low";
  if (high) return "high";
  if (low) return "low";
  return "normal";
}

// 获取风险警告
function getRiskWarning(riskLevel) {
  const warnings = {
    "extreme-high": "🚨 极高风险：指标处于极端高位，强烈建议减仓或止盈。",
    "extreme-low": "💎 极佳机会：指标处于极端低位，可能是难得的买入机会。",
    "high": "⚠️ 较高风险：指标偏高，建议谨慎操作，控制仓位。",
    "low": "✅ 较好机会：指标偏低，可适当关注买入机会。",
    "normal": "📊 正常区间：指标处于正常范围，建议根据其他因素综合判断。"
  };
  
  return warnings[riskLevel] || warnings["normal"];
}

// 显示通知
function showNotification(message, type = "info") {
  // 创建通知元素
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: ${type === 'warning' ? 'var(--warning)' : 'var(--primary)'};
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    font-weight: 600;
    z-index: 1000;
    animation: slideDown 0.3s ease;
  `;
  
  document.body.appendChild(notification);
  
  // 3秒后自动移除
  setTimeout(() => {
    notification.style.animation = 'slideUp 0.3s ease';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

// 保存分析历史
function saveAnalysisHistory(analysis) {
  try {
    let history = JSON.parse(localStorage.getItem('kdj_rsi_history') || '[]');
    history.unshift(analysis);
    
    // 只保留最近20次分析
    if (history.length > 20) {
      history = history.slice(0, 20);
    }
    
    localStorage.setItem('kdj_rsi_history', JSON.stringify(history));
  } catch (e) {
    console.warn('无法保存分析历史:', e);
  }
}

// 渲染图表
function renderPreviewChart(j, rsi) {
  // 检查Chart.js是否已加载
  if (typeof Chart === 'undefined') {
    console.error('Chart.js 未加载');
    document.getElementById('chart-note').innerHTML = '⚠️ 图表库加载失败，请刷新页面重试';
    return;
  }

  const canvas = document.getElementById('previewChart');
  const ctx = canvas.getContext('2d');
  
  // 销毁现有图表实例
  if (window._chartInstance) {
    window._chartInstance.destroy();
  }

  // 获取CSS变量值
  const computedStyle = getComputedStyle(document.documentElement);
  const primary = computedStyle.getPropertyValue('--primary').trim();
  const success = computedStyle.getPropertyValue('--success').trim();
  const danger = computedStyle.getPropertyValue('--danger').trim();
  const textPrimary = computedStyle.getPropertyValue('--text-primary').trim();
  const textSecondary = computedStyle.getPropertyValue('--text-secondary').trim();
  const textTertiary = computedStyle.getPropertyValue('--text-tertiary').trim();

  // 创建渐变背景
  const gradient = ctx.createLinearGradient(0, 0, 0, 200);
  gradient.addColorStop(0, 'rgba(51, 102, 204, 0.1)');
  gradient.addColorStop(1, 'rgba(51, 102, 204, 0.02)');

  // 根据指标值确定颜色
  const getIndicatorColor = (value, type) => {
    if (type === 'j') {
      if (value <= 20) return success;
      if (value >= 80) return danger;
      return primary;
    } else { // RSI
      if (value <= 30) return success;
      if (value >= 70) return danger;
      return primary;
    }
  };

  // 添加关键水平线数据
  const horizontalLines = [
    { value: 20, label: '超卖线', color: success },
    { value: 50, label: '中轴线', color: textTertiary },
    { value: 80, label: '超买线', color: danger }
  ];

  window._chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['RSI', 'J值'],
      datasets: [
        {
          label: '当前指标',
          data: [rsi, j],
          fill: true,
          backgroundColor: gradient,
          borderColor: primary,
          borderWidth: 2,
          tension: 0.3,
          pointBackgroundColor: [
            getIndicatorColor(rsi, 'rsi'),
            getIndicatorColor(j, 'j')
          ],
          pointBorderColor: '#FFFFFF',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointHoverBackgroundColor: [
            getIndicatorColor(rsi, 'rsi'),
            getIndicatorColor(j, 'j')
          ],
          pointHoverBorderColor: '#FFFFFF',
          pointHoverBorderWidth: 2,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'index'
      },
      plugins: {
        legend: { 
          display: false 
        },
        tooltip: {
          enabled: true,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          titleColor: textSecondary,
          bodyColor: textPrimary,
          borderColor: 'rgba(51, 102, 204, 0.2)',
          borderWidth: 1,
          cornerRadius: 8,
          padding: 12,
          titleFont: { 
            size: 14, 
            weight: '600',
            family: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif'
          },
          bodyFont: { 
            size: 16, 
            weight: '600',
            family: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif'
          },
          displayColors: false,
          callbacks: {
            title: (tooltipItems) => {
              const label = tooltipItems[0].label;
              return label === 'RSI' ? 'RSI 相对强弱指数' : 'J值 短期强弱';
            },
            label: (context) => {
              const value = context.parsed.y;
              const status = context.label === 'RSI' 
                ? (value <= 30 ? '超卖' : value >= 70 ? '超买' : '正常')
                : (value <= 20 ? '超卖' : value >= 80 ? '超买' : '正常');
              return `当前值: ${value} (${status})`;
            }
          }
        }
      },
      scales: {
        y: {
          min: -10,
          max: 110,
          ticks: {
            stepSize: 20,
            color: textTertiary,
            font: { 
              size: 12,
              family: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif'
            },
            callback: function(value) {
              if (value === 20) return '20 (超卖)';
              if (value === 50) return '50 (中轴)';
              if (value === 80) return '80 (超买)';
              return value;
            }
          },
          grid: {
            color: function(context) {
              const value = context.tick.value;
              if (value === 20) return success + '40';
              if (value === 50) return textTertiary + '40';
              if (value === 80) return danger + '40';
              return 'rgba(0, 0, 0, 0.05)';
            },
            lineWidth: function(context) {
              const value = context.tick.value;
              return (value === 20 || value === 50 || value === 80) ? 2 : 1;
            }
          },
          border: {
            display: false
          }
        },
        x: {
          ticks: {
            color: textSecondary,
            font: { 
              size: 14, 
              weight: '600',
              family: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif'
            }
          },
          grid: { 
            display: false 
          },
          border: { 
            display: false 
          }
        }
      },
      elements: {
        point: {
          hoverBorderWidth: 2
        }
      }
    }
  });
}

// 添加CSS动画样式
const addAnimationStyles = () => {
  if (!document.getElementById('notification-animations')) {
    const style = document.createElement('style');
    style.id = 'notification-animations';
    style.textContent = `
      @keyframes slideDown {
        from {
          transform: translateX(-50%) translateY(-100%);
          opacity: 0;
        }
        to {
          transform: translateX(-50%) translateY(0);
          opacity: 1;
        }
      }
      
      @keyframes slideUp {
        from {
          transform: translateX(-50%) translateY(0);
          opacity: 1;
        }
        to {
          transform: translateX(-50%) translateY(-100%);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }
};

// 初始化动画样式
addAnimationStyles();

// 错误处理
window.addEventListener('error', function(e) {
  console.error('页面错误:', e.error);
  showNotification('页面出现错误，请刷新重试', 'warning');
});