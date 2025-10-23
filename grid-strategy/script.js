// 网格策略核心计算函数
function computeSmartGridRange(rsi, bollUpper, bollLower, maxOffset = 0.1, maxScale = 0.2) {
    const center = (bollUpper + bollLower) / 2;
    const width = bollUpper - bollLower;

    // 偏移比例（决定位置）
    let offsetRatio = ((rsi - 50) / 50) * maxOffset;
    offsetRatio = Math.max(-maxOffset, Math.min(maxOffset, offsetRatio));

    // 缩放比例（决定宽度）
    let scaleRatio = 1 + (Math.abs(rsi - 50) / 50) * maxScale;

    const adjustedWidth = width * scaleRatio;
    const offset = adjustedWidth * offsetRatio / 2;

    const adjustedLower = +(center - adjustedWidth / 2 - offset).toFixed(2);
    const adjustedUpper = +(center + adjustedWidth / 2 - offset).toFixed(2);

    return {
        adjustedUpper,
        adjustedLower,
        adjustedWidth: +(adjustedUpper - adjustedLower).toFixed(2),
        scaleRatio: +scaleRatio.toFixed(4),
        offsetRatio: +offsetRatio.toFixed(4)
    };
}

// RSI 状态判断
function getRSIStatus(rsi) {
    if (rsi <= 20) return { status: 'oversold', text: '超卖', class: 'oversold' };
    if (rsi >= 80) return { status: 'overbought', text: '超买', class: 'overbought' };
    return { status: 'neutral', text: '中性', class: 'neutral' };
}

// 生成策略建议
function generateAdvice(rsi, result) {
    const advice = [];
    const rsiStatus = getRSIStatus(rsi);
    
    if (rsi <= 20) {
        advice.push(`🔴 <span class="advice-highlight">RSI 超卖信号</span>：当前市场可能处于超卖状态，建议重点关注买入机会`);
        advice.push(`📈 网格区间已向下偏移 ${Math.abs(result.offsetRatio * 100).toFixed(1)}%，并扩大 ${((result.scaleRatio - 1) * 100).toFixed(1)}% 以捕获反弹机会`);
        advice.push(`💡 建议在网格下半部分设置更多买单，准备抄底`);
    } else if (rsi >= 80) {
        advice.push(`🟠 <span class="advice-highlight">RSI 超买信号</span>：当前市场可能处于超买状态，建议重点关注卖出机会`);
        advice.push(`📉 网格区间已向上偏移 ${Math.abs(result.offsetRatio * 100).toFixed(1)}%，并扩大 ${((result.scaleRatio - 1) * 100).toFixed(1)}% 以防止踏空`);
        advice.push(`💡 建议在网格上半部分设置更多卖单，准备获利了结`);
    } else {
        advice.push(`🟢 <span class="advice-highlight">RSI 中性区间</span>：市场处于相对平衡状态，适合标准网格策略`);
        advice.push(`⚖️ 网格区间保持相对均衡，买卖单可平均分布`);
        advice.push(`💡 建议采用经典网格策略，等间距设置买卖单`);
    }
    
    // 通用建议
    advice.push(`🎯 建议资金分配：预留 30-50% 资金用于网格外的极端情况`);
    advice.push(`⏰ 定期监控 RSI 和布林带变化，及时调整网格参数`);
    
    return advice;
}

// 生成网格层级
function generateGridLevels(upper, lower, levels) {
    const gridLevels = [];
    const spacing = (upper - lower) / (levels - 1);
    
    for (let i = 0; i < levels; i++) {
        const price = +(lower + spacing * i).toFixed(2);
        const type = i < levels / 2 ? 'buy' : 'sell';
        const typeText = type === 'buy' ? '买入' : '卖出';
        
        gridLevels.push({
            index: i + 1,
            price: price,
            type: type,
            typeText: typeText
        });
    }
    
    return gridLevels.reverse(); // 从高到低排序
}

// 更新 RSI 指示器
function updateRSIIndicator(rsi) {
    const rsiFill = document.getElementById('rsi-fill');
    const rsiInput = document.getElementById('rsi');
    
    if (rsiFill) {
        rsiFill.style.width = `${rsi}%`;
        
        // 根据 RSI 值改变颜色
        if (rsi <= 20) {
            rsiFill.style.background = 'var(--rsi-oversold)';
        } else if (rsi >= 80) {
            rsiFill.style.background = 'var(--rsi-overbought)';
        } else {
            rsiFill.style.background = 'var(--rsi-neutral)';
        }
    }
}

// 主计算函数
function calculateGrid() {
    // 获取输入值
    const rsi = parseFloat(document.getElementById('rsi').value) || 50;
    const bollUpper = parseFloat(document.getElementById('bollUpper').value) || 0;
    const bollLower = parseFloat(document.getElementById('bollLower').value) || 0;
    const maxOffset = parseFloat(document.getElementById('maxOffset').value) || 0.1;
    const maxScale = parseFloat(document.getElementById('maxScale').value) || 0.2;
    const gridLevels = parseInt(document.getElementById('gridLevels').value) || 10;
    
    // 验证输入
    if (bollUpper <= bollLower) {
        alert('布林带上轨必须大于下轨！');
        return;
    }
    
    if (rsi < 0 || rsi > 100) {
        alert('RSI 值必须在 0-100 之间！');
        return;
    }
    
    // 计算网格策略
    const result = computeSmartGridRange(rsi, bollUpper, bollLower, maxOffset, maxScale);
    const rsiStatus = getRSIStatus(rsi);
    const advice = generateAdvice(rsi, result);
    const levels = generateGridLevels(result.adjustedUpper, result.adjustedLower, gridLevels);
    const spacing = result.adjustedWidth / (gridLevels - 1);
    
    // 更新结果显示
    document.getElementById('adjusted-upper').textContent = result.adjustedUpper.toFixed(2);
    document.getElementById('adjusted-lower').textContent = result.adjustedLower.toFixed(2);
    document.getElementById('adjusted-width').textContent = result.adjustedWidth.toFixed(2);
    document.getElementById('grid-spacing').textContent = spacing.toFixed(2);
    document.getElementById('scale-ratio').textContent = result.scaleRatio.toFixed(4);
    document.getElementById('offset-ratio').textContent = result.offsetRatio.toFixed(4);
    
    // 更新 RSI 状态
    const rsiStatusElement = document.getElementById('rsi-status');
    rsiStatusElement.textContent = rsiStatus.text;
    rsiStatusElement.className = `ios-result-detail-value rsi-status ${rsiStatus.class}`;
    
    // 生成网格层级
    const gridContainer = document.getElementById('grid-levels-container');
    gridContainer.innerHTML = '';
    
    levels.forEach(level => {
        const levelDiv = document.createElement('div');
        levelDiv.className = 'grid-level';
        levelDiv.innerHTML = `
            <span class="grid-level-index">#${level.index}</span>
            <span class="grid-level-price">$${level.price}</span>
            <span class="grid-level-type ${level.type}">${level.typeText}</span>
        `;
        gridContainer.appendChild(levelDiv);
    });
    
    // 生成策略建议
    const adviceContainer = document.getElementById('strategy-advice');
    adviceContainer.innerHTML = advice.map(item => 
        `<div class="advice-item">${item}</div>`
    ).join('');
    
    // 显示结果
    const resultContainer = document.getElementById('result-container');
    resultContainer.classList.add('show');
    
    // 滚动到结果区域
    resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// 高级设置切换 - 简化版本，让CSS完全控制动画
function toggleAdvancedSettings() {
    const toggle = document.getElementById('advanced-toggle');
    const content = document.getElementById('advanced-content');
    
    toggle.classList.toggle('active');
    
    if (content.classList.contains('show')) {
        // 收起
        content.classList.add('animating');
        content.classList.remove('show');
        
        // 清理动画类
        setTimeout(() => {
            content.classList.remove('animating');
        }, 350);
    } else {
        // 展开
        content.classList.add('animating');
        content.classList.add('show');
        
        // 清理动画类
        setTimeout(() => {
            content.classList.remove('animating');
        }, 350);
    }
}

// 主题切换
function toggleTheme() {
    const body = document.body;
    const themeEmoji = document.getElementById('theme-emoji');
    
    if (body.getAttribute('data-theme') === 'dark') {
        body.removeAttribute('data-theme');
        themeEmoji.textContent = '🌙';
        localStorage.setItem('theme', 'light');
    } else {
        body.setAttribute('data-theme', 'dark');
        themeEmoji.textContent = '☀️';
        localStorage.setItem('theme', 'dark');
    }
}

// Tips 功能
function initTips() {
    console.log('初始化 Tips 功能...');
    const tipsIcons = document.querySelectorAll('.tips-icon');
    console.log('找到 tips 图标数量:', tipsIcons.length);
    
    // 创建遮罩层
    let overlay = document.querySelector('.tips-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'tips-overlay';
        document.body.appendChild(overlay);
    }
    
    tipsIcons.forEach((icon, index) => {
        const tipsId = icon.getAttribute('data-tips');
        console.log(`Tips ${index + 1}: data-tips="${tipsId}"`);
        const popup = document.getElementById(`tips-${tipsId}`);
        console.log(`对应的弹窗元素:`, popup);
        
        if (popup) {
            // 点击显示 tips
            icon.addEventListener('click', function(e) {
                console.log(`点击了 tips 图标: ${tipsId}`);
                e.preventDefault();
                e.stopPropagation();
                
                // 隐藏其他所有 tips
                document.querySelectorAll('.tips-popup').forEach(p => {
                    p.classList.remove('show');
                });
                overlay.classList.remove('show');
                
                // 显示当前 tips 和遮罩
                popup.classList.add('show');
                overlay.classList.add('show');
                console.log(`显示 tips: ${tipsId}`);
            });
            
            // 阻止 popup 内部点击事件冒泡
            popup.addEventListener('click', function(e) {
                e.stopPropagation();
            });
        } else {
            console.error(`未找到 ID 为 tips-${tipsId} 的弹窗元素`);
        }
    });
    
    // 点击遮罩层隐藏所有 tips
    overlay.addEventListener('click', function() {
        console.log('点击遮罩层，隐藏所有 tips');
        document.querySelectorAll('.tips-popup').forEach(popup => {
            popup.classList.remove('show');
        });
        overlay.classList.remove('show');
    });
    
    // ESC 键隐藏 tips
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.tips-popup').forEach(popup => {
                popup.classList.remove('show');
            });
            overlay.classList.remove('show');
        }
    });
}

// 缓存功能
function saveInputValues() {
    const inputs = {
        rsi: document.getElementById('rsi').value,
        bollUpper: document.getElementById('bollUpper').value,
        bollLower: document.getElementById('bollLower').value,
        maxOffset: document.getElementById('maxOffset').value,
        maxScale: document.getElementById('maxScale').value,
        gridLevels: document.getElementById('gridLevels').value
    };
    localStorage.setItem('gridStrategyInputs', JSON.stringify(inputs));
}

function loadInputValues() {
    const saved = localStorage.getItem('gridStrategyInputs');
    if (saved) {
        try {
            const inputs = JSON.parse(saved);
            Object.keys(inputs).forEach(key => {
                const element = document.getElementById(key);
                if (element && inputs[key]) {
                    element.value = inputs[key];
                }
            });
        } catch (e) {
            console.log('加载缓存数据失败:', e);
        }
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    // 加载保存的主题
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        document.getElementById('theme-emoji').textContent = '☀️';
    }
    
    // 加载缓存的输入值
    loadInputValues();
    
    // 移除加载状态
    setTimeout(() => {
        document.body.classList.remove('loading');
    }, 100);
    
    // 绑定事件
    document.getElementById('advanced-toggle').addEventListener('click', toggleAdvancedSettings);
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    
    // 初始化 Tips 功能
    initTips();
    
    // RSI 输入实时更新指示器
    const rsiInput = document.getElementById('rsi');
    rsiInput.addEventListener('input', function() {
        const rsi = parseFloat(this.value) || 50;
        updateRSIIndicator(rsi);
    });
    
    // 获取当前RSI值并初始化指示器
    const currentRsi = parseFloat(document.getElementById('rsi').value) || 50;
    updateRSIIndicator(currentRsi);
    
    // 为所有输入框添加缓存保存功能和输入验证
    const inputs = document.querySelectorAll('.ios-input');
    inputs.forEach(input => {
        input.addEventListener('input', saveInputValues);
        input.addEventListener('change', saveInputValues);
        
        // 输入验证
        input.addEventListener('blur', function() {
            if (this.type === 'number') {
                const min = parseFloat(this.min);
                const max = parseFloat(this.max);
                const value = parseFloat(this.value);
                
                if (!isNaN(min) && value < min) {
                    this.value = min;
                }
                if (!isNaN(max) && value > max) {
                    this.value = max;
                }
            }
        });
    });
    
    // 回车键计算
    document.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            calculateGrid();
        }
    });
});

// 确保函数在全局作用域可用
if (typeof window !== 'undefined') {
    window.calculateGrid = calculateGrid;
    window.toggleAdvancedSettings = toggleAdvancedSettings;
    window.toggleTheme = toggleTheme;
}
