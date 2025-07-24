# 股票做T利润计算器 - 技术规范

## 功能需求

### 核心功能
1. **利润计算引擎**
   - 输入：买入价格(number)、卖出价格(number)、交易数量(integer)、手续费(number, optional)
   - 输出：净利润金额、收益率百分比
   - 计算公式：`净利润 = (卖出价 - 买入价) × 数量 - 手续费`
   - 收益率：`(净利润 / 成本基础) × 100%`

2. **数据验证规则**
   ```javascript
   // 必填字段验证
   buyPrice: required, number, > 0, precision: 0.01
   sellPrice: required, number, > 0, precision: 0.01
   quantity: required, integer, > 0, step: 100 (建议整手)
   commission: optional, number, >= 0, precision: 0.01, default: 0
   ```

3. **数据持久化**
   - 使用 localStorage 自动保存用户输入
   - 键名规范：`buysell_${fieldName}`
   - 页面加载时自动恢复数据
   - 支持计算历史记录（最多10条）

## 技术实现约束

### 前端技术栈
- **HTML5**: 语义化标签，ARIA无障碍支持
- **CSS3**: 
  - CSS Grid/Flexbox 响应式布局
  - CSS Variables 主题系统
  - 支持 prefers-color-scheme, prefers-reduced-motion
- **Vanilla JavaScript**: ES6+，无外部依赖

### 性能要求
- 首屏加载时间 < 1秒
- 计算响应时间 < 100ms
- 使用防抖函数优化自动保存（300ms延迟）
- 懒加载非关键动画效果

### 兼容性目标
```
Desktop: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
Mobile: iOS Safari 13+, Chrome Mobile 80+, Samsung Internet 12+
```

## 用户界面规范

### 设计系统
- **色彩方案**: iOS Human Interface Guidelines
- **字体**: SF Pro Display/Text 系统字体栈
- **间距**: 8px 基础网格系统
- **圆角**: 10px-20px 渐进式圆角
- **阴影**: 多层次阴影系统

### 响应式断点
```css
/* 移动端优先 */
@media (max-width: 480px) { /* 手机 */ }
@media (min-width: 481px) and (max-width: 768px) { /* 平板 */ }
@media (min-width: 769px) { /* 桌面 */ }
```

### 交互反馈规范
1. **输入验证**
   - 实时验证：onBlur 事件触发
   - 错误状态：红色边框 + 内联错误消息
   - 成功状态：蓝色边框 + 轻微上移动画

2. **按钮状态**
   ```css
   .ios-button {
     /* 默认状态 */
     transition: all 0.3s ease;
     
     /* 悬停状态 */
     :hover { transform: translateY(-2px); }
     
     /* 激活状态 */
     :active { transform: scale(0.98); }
     
     /* 加载状态 */
     .loading { pointer-events: none; /* 显示spinner */ }
   }
   ```

3. **触觉反馈**
   ```javascript
   // 错误时振动
   if (navigator.vibrate) navigator.vibrate(100);
   
   // 成功时短振动
   if (navigator.vibrate) navigator.vibrate(50);
   ```

## 数据流架构

### 输入处理流程
```
用户输入 → 实时验证 → 自动保存 → 状态更新 → UI反馈
```

### 计算流程
```javascript
function calculateProfit() {
  // 1. 数据收集与验证
  const inputs = validateInputs();
  if (!inputs.valid) return showErrors(inputs.errors);
  
  // 2. 计算核心逻辑
  const result = {
    netProfit: (inputs.sellPrice - inputs.buyPrice) * inputs.quantity - inputs.commission,
    costBasis: inputs.buyPrice * inputs.quantity
  };
  result.percentage = (result.netProfit / result.costBasis) * 100;
  
  // 3. 结果展示
  updateResultDisplay(result);
  
  // 4. 历史记录保存
  saveToHistory(inputs, result);
}
```

## 错误处理策略

### 输入验证错误
```javascript
const VALIDATION_RULES = {
  buyPrice: {
    required: true,
    type: 'number',
    min: 0.01,
    message: '买入价格必须大于0'
  },
  quantity: {
    required: true,
    type: 'integer',
    min: 1,
    step: 100,
    message: '交易数量必须为正整数，建议按整手(100股)交易'
  }
};
```

### 运行时错误处理
```javascript
// 全局错误捕获
window.addEventListener('error', (e) => {
  console.error('Runtime Error:', e.error);
  // 可选：错误上报到监控系统
});

// localStorage 异常处理
function safeLocalStorage(operation, key, value) {
  try {
    return operation === 'get' 
      ? localStorage.getItem(key)
      : localStorage.setItem(key, value);
  } catch (e) {
    console.warn('LocalStorage unavailable:', e);
    return null;
  }
}
```

## 测试用例

### 单元测试场景
```javascript
// 正常计算测试
test('profit calculation', () => {
  expect(calculateProfit(10, 12, 100, 5)).toEqual({
    netProfit: 195,
    percentage: 19.5
  });
});

// 边界值测试
test('zero commission', () => {
  expect(calculateProfit(10, 11, 100, 0)).toEqual({
    netProfit: 100,
    percentage: 10
  });
});

// 负收益测试
test('loss scenario', () => {
  expect(calculateProfit(12, 10, 100, 5)).toEqual({
    netProfit: -205,
    percentage: -17.08
  });
});
```

### 用户体验测试
1. **加载性能**: 页面完全加载时间 < 1秒
2. **交互延迟**: 按钮点击到结果显示 < 500ms
3. **数据持久化**: 刷新页面后数据完整恢复
4. **错误恢复**: 输入错误数据后能正确提示并恢复

## 部署要求

### 文件结构
```
buysell/
├── index.html          # 单文件应用，包含所有代码
├── README.md           # 使用说明
└── TECHNICAL_SPEC.md   # 技术规范文档
```

### 性能优化
- CSS/JS 内联减少HTTP请求
- 图标使用SVG减少资源加载
- 关键CSS优先加载
- 非关键动画延迟执行

### 安全考虑
- 输入数据XSS防护
- localStorage数据验证
- CSP头部配置（如果部署到服务器）

## 扩展性设计

### 主题系统
```css
:root {
  --primary-color: #007AFF;
  --success-color: #34C759;
  --error-color: #FF3B30;
  /* 支持通过CSS变量快速切换主题 */
}
```

### 国际化准备
```javascript
const i18n = {
  'zh-CN': {
    'buy_price': '买入价格',
    'sell_price': '卖出价格'
  },
  'en-US': {
    'buy_price': 'Buy Price',
    'sell_price': 'Sell Price'
  }
};
```

### API集成预留
```javascript
// 预留接口，支持未来集成实时股价API
async function fetchRealTimePrice(symbol) {
  // 实现股票实时价格获取
}
```

此技术规范确保了代码实现的明确性、可维护性和扩展性，为开发团队提供了清晰的实现指导。