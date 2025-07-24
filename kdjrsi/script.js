// KDJ + RSI 智能分析工具 - iOS 18 风格版本
(function() {
    'use strict';
    
    // 缓存键名
    const CACHE_KEYS = {
        J_VALUE: 'kdjrsi_jValue',
        RSI_VALUE: 'kdjrsi_rsiValue',
        VOLUME: 'kdjrsi_volume',
        CYCLE: 'kdjrsi_cycle'
    };

    // 页面加载完成处理
    document.addEventListener('DOMContentLoaded', function() {
        // 移除加载状态
        setTimeout(function() {
            document.body.classList.remove('loading');
        }, 300);
        
        // 从缓存加载数据
        loadFromCache();
        
        // 初始化输入框事件
        initializeInputHandlers();
        
        // 初始化键盘快捷键
        initializeKeyboardHandlers();
    });

    // 初始化输入框处理器
    function initializeInputHandlers() {
        const selects = ['j', 'rsi', 'volume', 'cycle'];
        
        selects.forEach(function(id) {
            const select = document.getElementById(id);
            if (!select) return;
            
            // 自动保存功能
            select.addEventListener('change', function() {
                saveToCache();
                clearSelectError(id);
            });
            
            // 清除错误状态
            select.addEventListener('focus', function() {
                clearSelectError(id);
            });
        });
    }

    // 初始化键盘快捷键
    function initializeKeyboardHandlers() {
        document.addEventListener('keydown', function(e) {
            // Ctrl/Cmd + Enter 快速分析
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                judgeSignal();
            }
            
            // Escape 清除结果
            if (e.key === 'Escape') {
                const resultContainer = document.getElementById("result-container");
                if (resultContainer && resultContainer.style.display === 'block') {
                    resultContainer.style.display = 'none';
                }
            }
        });
    }

    // 显示选择框错误
    function showSelectError(selectId) {
        const select = document.getElementById(selectId);
        if (select) {
            select.classList.add('error');
        }
    }

    // 清除选择框错误
    function clearSelectError(selectId) {
        const select = document.getElementById(selectId);
        if (select) {
            select.classList.remove('error');
        }
    }

    // 清除所有错误提示
    function clearAllErrors() {
        const selects = ['j', 'rsi', 'volume', 'cycle'];
        selects.forEach(function(id) {
            clearSelectError(id);
        });
    }

    // 保存数据到缓存
    function saveToCache() {
        try {
            const jValue = document.getElementById("j");
            const rsiValue = document.getElementById("rsi");
            const volume = document.getElementById("volume");
            const cycle = document.getElementById("cycle");

            if (jValue) localStorage.setItem(CACHE_KEYS.J_VALUE, jValue.value);
            if (rsiValue) localStorage.setItem(CACHE_KEYS.RSI_VALUE, rsiValue.value);
            if (volume) localStorage.setItem(CACHE_KEYS.VOLUME, volume.value);
            if (cycle) localStorage.setItem(CACHE_KEYS.CYCLE, cycle.value);
        } catch (e) {
            console.warn('无法保存到本地存储:', e);
        }
    }

    // 从缓存加载数据
    function loadFromCache() {
        try {
            const jValue = localStorage.getItem(CACHE_KEYS.J_VALUE) || '';
            const rsiValue = localStorage.getItem(CACHE_KEYS.RSI_VALUE) || '';
            const volume = localStorage.getItem(CACHE_KEYS.VOLUME) || '';
            const cycle = localStorage.getItem(CACHE_KEYS.CYCLE) || 'day';

            const jEl = document.getElementById("j");
            const rsiEl = document.getElementById("rsi");
            const volumeEl = document.getElementById("volume");
            const cycleEl = document.getElementById("cycle");

            if (jEl) jEl.value = jValue;
            if (rsiEl) rsiEl.value = rsiValue;
            if (volumeEl) volumeEl.value = volume;
            if (cycleEl) cycleEl.value = cycle;

            // 如果缓存数据完整，自动分析
            if (jValue && rsiValue && volume) {
                setTimeout(function() {
                    judgeSignal();
                }, 500);
            }
        } catch (e) {
            console.warn('无法从本地存储加载数据:', e);
        }
    }

    // 显示loading状态
    function showLoading(button) {
        if (button) {
            button.classList.add('loading');
            button.disabled = true;
        }
    }

    // 隐藏loading状态
    function hideLoading(button) {
        if (button) {
            button.classList.remove('loading');
            button.disabled = false;
        }
    }

    // 主要分析函数
    function judgeSignal() {
        // 获取分析按钮
        const analyzeBtn = document.getElementById("analyze-btn");
        if (!analyzeBtn) return;
        
        // 显示loading状态
        showLoading(analyzeBtn);
        
        // 清除所有错误提示
        clearAllErrors();
        
        // 获取输入值
        const jEl = document.getElementById("j");
        const rsiEl = document.getElementById("rsi");
        const volumeEl = document.getElementById("volume");
        const cycleEl = document.getElementById("cycle");

        if (!jEl || !rsiEl || !volumeEl || !cycleEl) {
            hideLoading(analyzeBtn);
            return;
        }

        const jValue = parseFloat(jEl.value);
        const rsiValue = parseFloat(rsiEl.value);
        const volume = volumeEl.value;
        const cycle = cycleEl.value;

        // 验证输入
        let hasError = false;
        
        if (!jEl.value) {
            showSelectError('j');
            hasError = true;
        }

        if (!rsiEl.value) {
            showSelectError('rsi');
            hasError = true;
        }

        if (!volume) {
            showSelectError('volume');
            hasError = true;
        }

        if (hasError) {
            hideLoading(analyzeBtn);
            return;
        }

        // 模拟分析延迟，提供更好的用户体验
        setTimeout(function() {
            // 执行分析
            performAnalysis(jValue, rsiValue, volume, cycle);
            // 隐藏loading状态
            hideLoading(analyzeBtn);
        }, 800);
    }

    // 执行分析
    function performAnalysis(jValue, rsiValue, volume, cycle) {
        const analysis = analyzeSignals(jValue, rsiValue, volume, cycle);
        updateResultDisplay(analysis, jValue, rsiValue);
    }

    // 信号分析逻辑
    function analyzeSignals(jValue, rsiValue, volume, cycle) {
        let signal = "中性";
        let confidence = 50;
        let suggestion = "";
        let riskLevel = "中等";

        // 基础信号判断
        if (jValue <= 20 && rsiValue <= 30) {
            signal = "强烈买入";
            confidence = 85;
            suggestion = "双重超卖信号，技术面支撑强烈。建议分批建仓，设置止损位。";
            riskLevel = "较低";
        } else if (jValue <= 30 && rsiValue <= 40) {
            signal = "买入";
            confidence = 70;
            suggestion = "技术指标显示超卖状态，可考虑逢低买入。注意控制仓位。";
            riskLevel = "中等";
        } else if (jValue >= 80 && rsiValue >= 70) {
            signal = "强烈卖出";
            confidence = 85;
            suggestion = "双重超买信号，获利了结时机。建议减仓或止盈，防范回调风险。";
            riskLevel = "较高";
        } else if (jValue >= 70 && rsiValue >= 60) {
            signal = "卖出";
            confidence = 70;
            suggestion = "技术指标显示超买状态，建议谨慎操作，可考虑部分获利了结。";
            riskLevel = "中等偏高";
        } else if (jValue >= 40 && jValue <= 60 && rsiValue >= 40 && rsiValue <= 60) {
            signal = "观望";
            confidence = 60;
            suggestion = "指标处于中性区间，建议观望等待更明确信号。可关注突破方向。";
            riskLevel = "中等";
        }

        // 成交量修正
        if (volume === "high") {
            if (signal.includes("买入")) {
                confidence += 10;
                suggestion += "\n\n📈 放量配合，信号可靠性增强。";
            } else if (signal.includes("卖出")) {
                confidence += 10;
                suggestion += "\n\n📉 放量下跌，警惕风险加大。";
            }
        } else if (volume === "low") {
            confidence -= 5;
            suggestion += "\n\n📊 成交量偏低，信号强度有所减弱。";
        }

        // 周期修正
        const cycleText = {
            'day': '日线',
            'week': '周线', 
            'hour': '小时线'
        };
        
        suggestion += `\n\n⏰ 当前分析基于${cycleText[cycle]}周期，请结合其他周期综合判断。`;

        return {
            signal: signal,
            confidence: Math.min(confidence, 95),
            suggestion: suggestion,
            riskLevel: riskLevel
        };
    }

    // 更新结果显示
    function updateResultDisplay(analysis, jValue, rsiValue) {
        const resultText = document.getElementById("result-text");
        const resultContainer = document.getElementById("result-container");

        if (!resultText || !resultContainer) {
            return;
        }

        // 更新分析结果文本
        const resultContent = `信号：${analysis.signal}
置信度：${analysis.confidence}%
风险等级：${analysis.riskLevel}

${analysis.suggestion}`;

        resultText.textContent = resultContent;

        // 显示结果
        resultContainer.style.display = 'block';
        
        // 绘制图表
        drawChart(jValue, rsiValue);
        
        // 滚动到结果区域
        setTimeout(function() {
            resultContainer.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'nearest' 
            });
        }, 100);
    }

    // iOS健康APP风格图表 - 优化版
    function drawChart(jValue, rsiValue) {
        const radius = 28;
        // 移动端下拉重复bug根治：只保留第一个id=previewChart的canvas
        const allCanvases = document.querySelectorAll('#previewChart');
        if (allCanvases.length > 1) {
            for (let i = 1; i < allCanvases.length; i++) {
                allCanvases[i].parentNode && allCanvases[i].parentNode.removeChild(allCanvases[i]);
            }
        }

        const canvas = document.getElementById('previewChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const parent = canvas.parentElement;
        
        // 健康APP风格尺寸
        let width = Math.min(parent ? parent.clientWidth - 20 : 400, 440);
        const height = 300; // 增加高度避免重叠
        
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);

        ctx.clearRect(0, 0, width, height);

        // 优化布局，增加间距
        const leftPad = 80;
        const rightPad = 80;
        const topPad = 50;
        const bottomPad = 40;
        const plotWidth = width - leftPad - rightPad;
        const plotHeight = height - topPad - bottomPad;

        // 扩展区间以处理极端值
        const jMin = -40, jMax = 120;
        const rsiMin = -15, rsiMax = 105;

        const isDarkMode = document.documentElement.classList.contains('dark-mode');

        // 健康APP风格颜色（支持暗黑模式）
        const healthColors = {
            primary: isDarkMode ? '#EBEBF5' : '#8E8E93',
            secondary: isDarkMode ? '#AEAEB2' : '#C7C7CC',
            // 调整暗黑模式下的背景色为更柔和的深灰色，透明度更低
            background: isDarkMode ? 'rgba(36, 37, 42, 0.82)' : 'rgba(248, 248, 248, 0.4)',
            // 调整暗黑模式下的网格色为更细腻、低对比度
            grid: isDarkMode ? 'rgba(120, 120, 130, 0.18)' : 'rgba(229, 229, 234, 0.4)',
            pointBorder: isDarkMode ? '#1C1C1E' : '#ffffff'
        };

        // 优化刻度点，避免重叠
        const jTicks = [-30, 0, 20, 50, 80, 110];
        const rsiTicks = [-10, 20, 30, 50, 70, 80, 100];
        
        const jLabels = {
            '-30': '极超卖', '0': '超卖', '20': '低位', 
            '50': '中性', '80': '超买', '110': '极超买'
        };
        
        const rsiLabels = {
            '-10': '异常', '20': '超卖', '30': '低位', 
            '50': '中性', '70': '偏强', '80': '超买', '100': '极强'
        };

        // 1. 渐变背景扩大至整个canvas
        let bgGradient = ctx.createLinearGradient(0, 0, 0, height);
        if (isDarkMode) {
            bgGradient.addColorStop(0, 'rgba(38, 39, 44, 0.93)');
            bgGradient.addColorStop(1, 'rgba(28, 29, 32, 0.97)');
        } else {
            bgGradient.addColorStop(0, 'rgba(245, 246, 248, 0.93)');
            bgGradient.addColorStop(1, 'rgba(232, 233, 238, 0.97)');
        }
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(radius, 0);
        ctx.lineTo(width - radius, 0);
        ctx.quadraticCurveTo(width, 0, width, radius);
        ctx.lineTo(width, height - radius);
        ctx.quadraticCurveTo(width, height, width - radius, height);
        ctx.lineTo(radius, height);
        ctx.quadraticCurveTo(0, height, 0, height - radius);
        ctx.lineTo(0, radius);
        ctx.quadraticCurveTo(0, 0, radius, 0);
        ctx.closePath();
        ctx.fillStyle = bgGradient;
        ctx.fill();
        ctx.restore();

        // 2. 网格线扩大至整个canvas，且颜色适中
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(radius, 0);
        ctx.lineTo(width - radius, 0);
        ctx.quadraticCurveTo(width, 0, width, radius);
        ctx.lineTo(width, height - radius);
        ctx.quadraticCurveTo(width, height, width - radius, height);
        ctx.lineTo(radius, height);
        ctx.quadraticCurveTo(0, height, 0, height - radius);
        ctx.lineTo(0, radius);
        ctx.quadraticCurveTo(0, 0, radius, 0);
        ctx.closePath();
        ctx.clip();
        ctx.strokeStyle = isDarkMode ? 'rgba(180, 180, 200, 0.13)' : 'rgba(120, 120, 130, 0.18)';
        ctx.lineWidth = 0.18;
        // 水平网格线（18条）
        for (let i = 1; i <= 18; i++) {
            const y = (height / 19) * i;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
        // 垂直网格线（16条）
        for (let i = 1; i <= 16; i++) {
            const x = (width / 17) * i;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        ctx.restore();

        // 圆角描边（暗黑模式下更自然）
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(radius, 0);
        ctx.lineTo(width - radius, 0);
        ctx.quadraticCurveTo(width, 0, width, radius);
        ctx.lineTo(width, height - radius);
        ctx.quadraticCurveTo(width, height, width - radius, height);
        ctx.lineTo(radius, height);
        ctx.quadraticCurveTo(0, height, 0, height - radius);
        ctx.lineTo(0, radius);
        ctx.quadraticCurveTo(0, 0, radius, 0);
        ctx.closePath();
        ctx.lineWidth = 2.2;
        ctx.strokeStyle = isDarkMode ? 'rgba(120,120,130,0.18)' : 'rgba(200,200,210,0.13)';
        ctx.stroke();
        ctx.restore();

        // J和RSI两个点的横向距离更宽
        const jX = leftPad + plotWidth * 0.22;
        const rsiX = leftPad + plotWidth * 0.78;

        // 主垂直线（更淡更细，几乎不可见）
        ctx.beginPath();
        ctx.moveTo(jX, topPad);
        ctx.lineTo(jX, topPad + plotHeight);
        ctx.lineWidth = 0.18;
        ctx.strokeStyle = isDarkMode ? 'rgba(120, 120, 130, 0.08)' : 'rgba(142, 142, 147, 0.08)';
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(rsiX, topPad);
        ctx.lineTo(rsiX, topPad + plotHeight);
        ctx.stroke();
        ctx.lineWidth = 0.22; // 恢复细线宽度
        ctx.strokeStyle = healthColors.grid;

        // 计算点位置（处理极端值）
        const jNorm = Math.max(jMin, Math.min(jMax, jValue));
        const rsiNorm = Math.max(rsiMin, Math.min(rsiMax, rsiValue));
        const jY = topPad + plotHeight * (1 - (jNorm - jMin) / (jMax - jMin));
        const rsiY = topPad + plotHeight * (1 - (rsiNorm - rsiMin) / (rsiMax - rsiMin));

        // 健康APP风格颜色判断
        function getHealthColor(val, isJ = true) {
            if (isJ) {
                if (val <= 20) return '#30D158';
                if (val >= 80) return '#FF453A';
                return '#007AFF';
            } else {
                if (val <= 30) return '#30D158';
                if (val >= 70) return '#FF453A';
                return '#007AFF';
            }
        }

        const jColor = getHealthColor(jNorm, true);
        const rsiColor = getHealthColor(rsiNorm, false);

        // 健康APP风格连接线
        ctx.strokeStyle = 'rgba(142, 142, 147, 0.4)';
        ctx.lineWidth = 2;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(jX, jY);
        ctx.lineTo(rsiX, rsiY);
        ctx.stroke();

        // 健康APP风格数据点
        function drawHealthPoint(x, y, color, label, value) {
            // 外圈
            ctx.beginPath();
            ctx.arc(x, y, 12, 0, 2 * Math.PI);
            ctx.fillStyle = color + '15';
            ctx.fill();
            
            // 主圆点
            ctx.beginPath();
            ctx.arc(x, y, 8, 0, 2 * Math.PI);
            ctx.fillStyle = color;
            ctx.fill();
            
            // 边框
            ctx.beginPath();
            ctx.arc(x, y, 8, 0, 2 * Math.PI);
            ctx.strokeStyle = healthColors.pointBorder;
            ctx.lineWidth = 3;
            ctx.stroke();
            
            // 数值标签 (优化极端值显示)
            const isTop = y < topPad + 20;
            const labelY = isTop ? y + 35 : y - 20;
            const textBaseline = isTop ? 'top' : 'bottom';

            ctx.font = '600 15px -apple-system, BlinkMacSystemFont, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = textBaseline;
            ctx.fillStyle = color;
            ctx.fillText(`${label}: ${value}`, x, labelY);
        }

        drawHealthPoint(jX, jY, jColor, 'J', jValue);
        drawHealthPoint(rsiX, rsiY, rsiColor, 'RSI', rsiValue);

        // 左侧J值刻度（优化间距和字体大小）
        ctx.font = '500 12px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = healthColors.primary;
        
        jTicks.forEach((val, index) => {
            if (val >= jMin && val <= jMax) {
                const y = topPad + plotHeight * (1 - (val - jMin) / (jMax - jMin));
                
                // 检查是否与其他标签重叠
                let shouldDrawLabel = true;
                jTicks.forEach((otherVal, otherIndex) => {
                    if (otherIndex !== index && Math.abs(val - otherVal) < 15) {
                        const otherY = topPad + plotHeight * (1 - (otherVal - jMin) / (jMax - jMin));
                        if (Math.abs(y - otherY) < 25 && otherIndex < index) {
                            shouldDrawLabel = false;
                        }
                    }
                });
                
                if (shouldDrawLabel) {
                    ctx.fillText(`${val}`, leftPad - 25, y);
                    
                    // 标签（增加间距和字体大小）
                    if (jLabels[val]) {
                        ctx.font = '400 10px -apple-system, BlinkMacSystemFont, sans-serif';
                        ctx.fillStyle = healthColors.secondary;
                        ctx.fillText(jLabels[val], leftPad - 25, y + 14);
                        ctx.font = '500 12px -apple-system, BlinkMacSystemFont, sans-serif';
                        ctx.fillStyle = healthColors.primary;
                    }
                }
            }
        });

        // 右侧RSI刻度（优化间距和字体大小）
        ctx.textAlign = 'left';
        
        rsiTicks.forEach((val, index) => {
            if (val >= rsiMin && val <= rsiMax) {
                const y = topPad + plotHeight * (1 - (val - rsiMin) / (rsiMax - rsiMin));
                
                // 检查是否与其他标签重叠
                let shouldDrawLabel = true;
                rsiTicks.forEach((otherVal, otherIndex) => {
                    if (otherIndex !== index && Math.abs(val - otherVal) < 15) {
                        const otherY = topPad + plotHeight * (1 - (otherVal - rsiMin) / (rsiMax - rsiMin));
                        if (Math.abs(y - otherY) < 25 && otherIndex < index) {
                            shouldDrawLabel = false;
                        }
                    }
                });
                
                if (shouldDrawLabel) {
                    ctx.fillText(`${val}`, leftPad + plotWidth + 25, y);
                    
                    // 标签（增加间距和字体大小）
                    if (rsiLabels[val]) {
                        ctx.font = '400 10px -apple-system, BlinkMacSystemFont, sans-serif';
                        ctx.fillStyle = healthColors.secondary;
                        ctx.fillText(rsiLabels[val], leftPad + plotWidth + 25, y + 14);
                        ctx.font = '500 12px -apple-system, BlinkMacSystemFont, sans-serif';
                        ctx.fillStyle = healthColors.primary;
                    }
                }
            }
        });

        // 统一标题颜色（健康APP风格）
        ctx.font = '600 14px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillStyle = healthColors.primary;
        ctx.fillText('J值区间', jX, 18);
        ctx.fillText('RSI区间', rsiX, 18);
    }

    // 页面可见性变化时保存数据
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            saveToCache();
        }
    });

    // 全局函数（保持向后兼容）
    window.judgeSignal = judgeSignal;

// ====== 主题切换功能 ======
    document.addEventListener('DOMContentLoaded', function() {
        var toggle = document.getElementById('theme-toggle');
        var emoji = document.getElementById('theme-emoji');
        if (!toggle || !emoji) return;
        var darkClass = 'dark-mode';
        
        function setTheme(dark) {
            if (dark) {
                document.documentElement.classList.add(darkClass);
                emoji.textContent = '🌑'; // 新月
            } else {
                document.documentElement.classList.remove(darkClass);
                emoji.textContent = '🌞';
            }
            // 主题切换后，如果图表已显示，则重绘
            if (document.getElementById("result-container").style.display === 'block') {
                const jValue = document.getElementById("j").value;
                const rsiValue = document.getElementById("rsi").value;
                if (jValue && rsiValue) {
                    drawChart(parseFloat(jValue), parseFloat(rsiValue));
                }
            }
        }
        
        // 修正初始逻辑：light 显示🌞，dark 显示🌑
        var isDark = localStorage.getItem('theme') === 'dark';
        setTheme(isDark);
        
        toggle.onclick = function() {
            isDark = !isDark;
            setTheme(isDark);
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        };
    });
})();