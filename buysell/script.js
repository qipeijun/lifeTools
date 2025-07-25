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
        
        // 初始化收益率设置功能
        initializeProfitRateSettings();
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

    // 碰撞检测函数 - 检测下拉框是否会超出视窗底部
    function performCollisionDetection(dropdown, trigger) {
        if (!dropdown || !trigger) return;
        
        // 重置下拉框位置类名
        dropdown.classList.remove('dropdown-up');
        
        // 临时显示下拉框以获取尺寸（但不透明度为0）
        dropdown.style.visibility = 'hidden';
        dropdown.style.opacity = '0';
        dropdown.style.display = 'block';
        
        // 获取触发元素和下拉框的位置信息
        const triggerRect = trigger.getBoundingClientRect();
        const dropdownRect = dropdown.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        
        // 计算下拉框底部位置
        const dropdownBottom = triggerRect.bottom + dropdownRect.height;
        
        // 检查是否会超出视窗底部（留20px缓冲区）
        const bufferZone = 20;
        const willOverflow = dropdownBottom > (viewportHeight - bufferZone);
        
        if (willOverflow) {
            // 向上显示
            dropdown.classList.add('dropdown-up');
        }
        
        // 恢复下拉框的显示状态
        dropdown.style.visibility = '';
        dropdown.style.opacity = '';
        dropdown.style.display = '';
    }

    // 初始化收益率设置功能
    function initializeProfitRateSettings() {
        const settingsIcon = document.querySelector('.settings-icon');
        const dropdown = document.getElementById('profit-rate-dropdown');
        const customInputContainer = document.getElementById('custom-input-container');
        const customRateInput = document.getElementById('custom-rate-input');
        const applyCustomRateBtn = document.getElementById('apply-custom-rate');
        
        if (!settingsIcon || !dropdown) return;
        
        // 点击齿轮图标显示/隐藏下拉框
        settingsIcon.addEventListener('click', function(e) {
            e.stopPropagation();
            
            if (dropdown.classList.contains('show')) {
                dropdown.classList.remove('show');
            } else {
                // 显示下拉框前进行碰撞检测
                performCollisionDetection(dropdown, settingsIcon);
                dropdown.classList.add('show');
            }
        });
        
        // 点击页面其他地方关闭下拉框
        document.addEventListener('click', function(e) {
            if (!dropdown.contains(e.target) && !settingsIcon.contains(e.target)) {
                dropdown.classList.remove('show');
                if (customInputContainer) {
                    customInputContainer.style.display = 'none';
                }
            }
        });
        
        // 处理下拉选项点击
        const dropdownOptions = document.querySelectorAll('.dropdown-option');
        dropdownOptions.forEach(function(option) {
            option.addEventListener('click', function(e) {
                e.stopPropagation();
                
                if (option.classList.contains('custom-rate')) {
                    // 显示自定义输入框
                    if (customInputContainer) {
                        customInputContainer.style.display = 'flex';
                        if (customRateInput) {
                            customRateInput.focus();
                        }
                    }
                } else {
                    // 使用预设收益率
                    const rate = parseFloat(option.dataset.rate);
                    if (!isNaN(rate)) {
                        calculateSellPriceByRate(rate);
                        dropdown.classList.remove('show');
                    }
                }
            });
        });
        
        // 处理自定义收益率确定按钮
        if (applyCustomRateBtn && customRateInput) {
            applyCustomRateBtn.addEventListener('click', function() {
                const customRate = parseFloat(customRateInput.value);
                if (!isNaN(customRate) && customRate >= 0 && customRate <= 100) {
                    calculateSellPriceByRate(customRate);
                    dropdown.classList.remove('show');
                    customInputContainer.style.display = 'none';
                    customRateInput.value = '';
                } else {
                    alert('请输入0-100之间的有效收益率');
                    customRateInput.focus();
                }
            });
            
            // 回车键确定
            customRateInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    applyCustomRateBtn.click();
                }
            });
        }
    }
    
    // 根据目标收益率反向计算卖出价格
    function calculateSellPriceByRate(targetRate) {
        const buyPriceEl = document.getElementById("buyPrice");
        const sellPriceEl = document.getElementById("sellPrice");
        const quantityEl = document.getElementById("quantity");
        const commissionEl = document.getElementById("commission");
        
        if (!buyPriceEl || !sellPriceEl || !quantityEl || !commissionEl) {
            return;
        }
        
        const buyPrice = parseFloat(buyPriceEl.value);
        const quantity = parseInt(quantityEl.value);
        let commission = parseFloat(commissionEl.value);
        
        // 验证必要输入
        if (isNaN(buyPrice) || buyPrice <= 0) {
            alert('请先输入有效的买入价格');
            buyPriceEl.focus();
            return;
        }
        
        if (isNaN(quantity) || quantity <= 0) {
            alert('请先输入有效的交易数量');
            quantityEl.focus();
            return;
        }
        
        if (isNaN(commission)) {
            commission = 0;
        }
        
        // 计算目标卖出价格
        // 公式：目标收益率 = (卖出收入 - 买入成本 - 手续费) / 买入成本
        // 卖出收入 = 卖出价格 * 数量
        // 所以：卖出价格 = (买入成本 * (1 + 目标收益率) + 手续费) / 数量
        const buyCost = buyPrice * quantity;
        const targetSellPrice = (buyCost * (1 + targetRate / 100) + commission) / quantity;
        
        // 设置卖出价格（保留4位小数）
        sellPriceEl.value = targetSellPrice.toFixed(4);
        
        // 自动计算结果
        setTimeout(function() {
            calculateProfit();
        }, 100);
        
        // 提示用户
        const message = `已根据目标收益率 ${targetRate}% 计算出卖出价格：${targetSellPrice.toFixed(4)} 元`;
        console.log(message);
        
        // 显示Toast提示
        showToast(`目标收益率 ${targetRate}%，建议卖出价格：${targetSellPrice.toFixed(4)} 元`);
    }
    
    // 显示Toast提示
    function showToast(message) {
        // 移除已存在的toast
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        
        document.body.appendChild(toast);

        // 动画效果
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translate(-50%, 0)';
        }, 10);

        // 3秒后自动移除
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translate(-50%, -10px)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    // 全局函数（保持向后兼容）
    window.calculateProfit = calculateProfit;

    // ====== 主题切换功能 ======
    document.addEventListener('DOMContentLoaded', function() {
        const toggle = document.getElementById('theme-toggle');
        const emoji = document.getElementById('theme-emoji');
        if (!toggle || !emoji) return;

        const darkClass = 'dark-mode';
        const themeKey = 'theme';

        function setTheme(isDark) {
            // 核心修复：确保在 body 元素上切换 class
            document.body.classList.toggle(darkClass, isDark);
            emoji.textContent = isDark ? '🌑' : '🌞';
        }

        function initializeTheme() {
            const savedTheme = localStorage.getItem(themeKey);
            let isDark;

            if (savedTheme) {
                // 优先使用本地存储的用户选择
                isDark = savedTheme === 'dark';
            } else {
                // 否则，遵循系统设置
                isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            }
            
            setTheme(isDark);
        }

        toggle.onclick = function() {
            // 切换当前主题状态
            const isCurrentlyDark = document.body.classList.contains(darkClass);
            const newIsDark = !isCurrentlyDark;
            setTheme(newIsDark);
            // 保存用户选择到本地存储
            localStorage.setItem(themeKey, newIsDark ? 'dark' : 'light');
        };

        // 页面加载时初始化主题
        initializeTheme();
    });
})();
