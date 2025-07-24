// 股票做T利润计算器 - 简化版本
(function() {
    'use strict';
    
    // 缓存键名
    const CACHE_KEYS = {
        BUY_PRICE: 'buysell_buyPrice',
        SELL_PRICE: 'buysell_sellPrice',
        QUANTITY: 'buysell_quantity',
        COMMISSION: 'buysell_commission'
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
        const inputs = ['buyPrice', 'sellPrice', 'quantity', 'commission'];
        
        inputs.forEach(function(id) {
            const input = document.getElementById(id);
            if (!input) return;
            
            // 自动保存功能
            input.addEventListener('input', saveToCache);
            input.addEventListener('change', saveToCache);
            
            // 实时验证
            input.addEventListener('blur', function() {
                validateInput(id);
            });
            
            // 清除错误状态
            input.addEventListener('focus', function() {
                clearInputError(id);
            });
            
            // 回车键快速计算
            input.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    calculateProfit();
                }
            });
        });
    }

    // 初始化键盘快捷键
    function initializeKeyboardHandlers() {
        document.addEventListener('keydown', function(e) {
            // Ctrl/Cmd + Enter 快速计算
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                calculateProfit();
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

    // 输入验证
    function validateInput(inputId) {
        const input = document.getElementById(inputId);
        if (!input) return;
        
        const value = parseFloat(input.value);
        let hasError = false;

        if (input.value.trim() === '') {
            if (inputId !== 'commission') {
                hasError = true;
            }
        } else if (isNaN(value)) {
            hasError = true;
        } else if (value < 0) {
            hasError = true;
        } else if (inputId === 'quantity' && value % 1 !== 0) {
            hasError = true;
        }

        if (hasError) {
            showInputError(inputId);
        } else {
            clearInputError(inputId);
        }
    }

    // 显示输入错误
    function showInputError(inputId) {
        const input = document.getElementById(inputId);
        if (input) {
            input.classList.add('error');
        }
    }

    // 清除输入错误
    function clearInputError(inputId) {
        const input = document.getElementById(inputId);
        if (input) {
            input.classList.remove('error');
        }
    }

    // 清除所有错误提示
    function clearAllErrors() {
        const inputs = ['buyPrice', 'sellPrice', 'quantity', 'commission'];
        inputs.forEach(function(id) {
            clearInputError(id);
        });
    }

    // 保存数据到缓存
    function saveToCache() {
        try {
            const buyPrice = document.getElementById("buyPrice");
            const sellPrice = document.getElementById("sellPrice");
            const quantity = document.getElementById("quantity");
            const commission = document.getElementById("commission");

            if (buyPrice) localStorage.setItem(CACHE_KEYS.BUY_PRICE, buyPrice.value);
            if (sellPrice) localStorage.setItem(CACHE_KEYS.SELL_PRICE, sellPrice.value);
            if (quantity) localStorage.setItem(CACHE_KEYS.QUANTITY, quantity.value);
            if (commission) localStorage.setItem(CACHE_KEYS.COMMISSION, commission.value);
        } catch (e) {
            console.warn('无法保存到本地存储:', e);
        }
    }

    // 从缓存加载数据
    function loadFromCache() {
        try {
            const buyPrice = localStorage.getItem(CACHE_KEYS.BUY_PRICE) || '';
            const sellPrice = localStorage.getItem(CACHE_KEYS.SELL_PRICE) || '';
            const quantity = localStorage.getItem(CACHE_KEYS.QUANTITY) || '';
            const commission = localStorage.getItem(CACHE_KEYS.COMMISSION) || '';

            const buyPriceEl = document.getElementById("buyPrice");
            const sellPriceEl = document.getElementById("sellPrice");
            const quantityEl = document.getElementById("quantity");
            const commissionEl = document.getElementById("commission");

            if (buyPriceEl) buyPriceEl.value = buyPrice;
            if (sellPriceEl) sellPriceEl.value = sellPrice;
            if (quantityEl) quantityEl.value = quantity;
            if (commissionEl) commissionEl.value = commission;

            // 如果缓存数据完整且合法，自动计算结果
            if (buyPrice && sellPrice && quantity) {
                const buyPriceNum = parseFloat(buyPrice);
                const sellPriceNum = parseFloat(sellPrice);
                const quantityNum = parseInt(quantity);
                
                if (!isNaN(buyPriceNum) && !isNaN(sellPriceNum) && !isNaN(quantityNum) &&
                    buyPriceNum > 0 && sellPriceNum > 0 && quantityNum > 0) {
                    setTimeout(function() {
                        calculateProfit();
                    }, 500);
                }
            }
        } catch (e) {
            console.warn('无法从本地存储加载数据:', e);
        }
    }

    // 格式化数字显示
    function formatNumber(num) {
        return Math.abs(num).toLocaleString('zh-CN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
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

    // 计算利润主函数
    function calculateProfit() {
        // 获取计算按钮
        const calculateBtn = document.getElementById("calculate-btn");
        if (!calculateBtn) return;
        
        // 显示loading状态
        showLoading(calculateBtn);
        
        // 清除所有错误提示
        clearAllErrors();
        
        // 获取输入值
        const buyPriceEl = document.getElementById("buyPrice");
        const sellPriceEl = document.getElementById("sellPrice");
        const quantityEl = document.getElementById("quantity");
        const commissionEl = document.getElementById("commission");

        if (!buyPriceEl || !sellPriceEl || !quantityEl || !commissionEl) {
            hideLoading(calculateBtn);
            return;
        }

        const buyPrice = parseFloat(buyPriceEl.value);
        const sellPrice = parseFloat(sellPriceEl.value);
        const quantity = parseInt(quantityEl.value);
        let commission = parseFloat(commissionEl.value);

        // 验证输入
        let hasError = false;
        
        if (!buyPriceEl.value.trim()) {
            showInputError('buyPrice');
            hasError = true;
        } else if (isNaN(buyPrice) || buyPrice <= 0) {
            showInputError('buyPrice');
            hasError = true;
        }

        if (!sellPriceEl.value.trim()) {
            showInputError('sellPrice');
            hasError = true;
        } else if (isNaN(sellPrice) || sellPrice <= 0) {
            showInputError('sellPrice');
            hasError = true;
        }

        if (!quantityEl.value.trim()) {
            showInputError('quantity');
            hasError = true;
        } else if (isNaN(quantity) || quantity <= 0) {
            showInputError('quantity');
            hasError = true;
        }

        if (hasError) {
            hideLoading(calculateBtn);
            return;
        }

        // 处理手续费
        if (isNaN(commission)) {
            commission = 0;
        }

        // 模拟计算延迟，提供更好的用户体验
        setTimeout(function() {
            // 执行计算
            performCalculation(buyPrice, sellPrice, quantity, commission);
            // 隐藏loading状态
            hideLoading(calculateBtn);
        }, 500);
    }

    // 执行计算
    function performCalculation(buyPrice, sellPrice, quantity, commission) {
        const buyCost = buyPrice * quantity;
        const sellIncome = sellPrice * quantity;
        const netProfit = sellIncome - buyCost - commission;
        const percentage = buyCost !== 0 ? (netProfit / buyCost) * 100 : 0;

        // 更新结果显示
        updateResultDisplay(netProfit, percentage, buyCost, sellIncome, commission);
    }

    // 更新结果显示
    function updateResultDisplay(netProfit, percentage, buyCost, sellIncome, commission) {
        const profitAmountEl = document.getElementById("profit-amount");
        const profitPercentageEl = document.getElementById("profit-percentage");
        const buyCostEl = document.getElementById("buy-cost");
        const sellIncomeEl = document.getElementById("sell-income");
        const commissionEl = document.getElementById("commission-display");
        const resultContainer = document.getElementById("result-container");

        if (!profitAmountEl || !profitPercentageEl || !buyCostEl || !sellIncomeEl || !commissionEl || !resultContainer) {
            return;
        }

        // 更新主要数据
        profitAmountEl.textContent = (netProfit >= 0 ? '+' : '-') + formatNumber(netProfit);
        profitPercentageEl.textContent = (percentage >= 0 ? '+' : '') + percentage.toFixed(2) + '%';

        // 更新详情数据
        buyCostEl.textContent = formatNumber(buyCost);
        sellIncomeEl.textContent = formatNumber(sellIncome);
        commissionEl.textContent = formatNumber(commission);

        // 设置颜色样式
        const profitClass = netProfit > 0 ? 'profit' : netProfit < 0 ? 'loss' : 'neutral';
        
        profitAmountEl.className = 'ios-result-main-value ' + profitClass;
        profitPercentageEl.className = 'ios-result-item-value ' + profitClass;

        // 显示结果
        resultContainer.style.display = 'block';
        
        // 滚动到结果区域
        setTimeout(function() {
            resultContainer.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'nearest' 
            });
        }, 100);
    }

    // 页面可见性变化时保存数据
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            saveToCache();
        }
    });

    // 全局函数（保持向后兼容）
    window.calculateProfit = calculateProfit;

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