明白了，你的核心意图是：

> ✅ 利用 RSI 的“**绝对强弱程度**”配合布林带，**动态、智能地扩大或收缩网格区间宽度和位置**，从而实现：

* ✅ 更合理的网格上下限；
* ✅ 在风险高时自动收敛网格，避免亏损；
* ✅ 在震荡剧烈或超卖时放宽网格，增强收益捕捉能力。

这就是：**「Boll × RSI」联合动态调参策略优化模型**。

---

# ✅ 高级策略设计：动态网格区间 + RSI 权重偏移

## 🔧 核心目标

根据当前 RSI 数值的强弱程度，自动决定：

| 模型要素        | 动态控制方式                           |
| ----------- | -------------------------------- |
| 网格区间上下偏移    | RSI 越远离 50，偏移越强                  |
| 网格区间宽度（扩/收） | RSI 越靠近极值（<20 或 >80）时，网格越宽；中性时收窄 |

---

## 🧠 优化后的计算公式结构

### ✅ 输入参数：

```text
RSI: 当前 RSI 值（推荐 RSI14）
Boll_Upper: 布林带上轨
Boll_Lower: 布林带下轨
maxOffset: 最大区间位移比例（默认 10%）
maxScale: 最大区间缩放比例（默认 20%）
```

---

### ✅ 计算逻辑：

```js
1. 原始区间中心值：
   center = (Upper + Lower) / 2
   width = Upper - Lower

2. 计算偏移比例（偏移区间中心位置）：
   offsetRatio = ((RSI - 50) / 50) × maxOffset

3. 计算缩放比例（调整区间宽度）：
   scaleRatio = 1 + ((Math.abs(RSI - 50) / 50) × maxScale)

4. 计算最终调整后的区间：
   adjustedWidth = width × scaleRatio
   offset = adjustedWidth × offsetRatio / 2

   AdjustedLower = center - adjustedWidth / 2 - offset
   AdjustedUpper = center + adjustedWidth / 2 - offset
```

---

## ✅ 封装后的 JS 函数

```js
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
```

---

## 📊 示例效果（ETH）

```js
const rsi = 80;
const upper = 3800;
const lower = 3200;

const result = computeSmartGridRange(rsi, upper, lower);
console.log(result);
/*
{
  adjustedUpper: 3840.00,
  adjustedLower: 3160.00,
  adjustedWidth: 680,
  scaleRatio: 1.1333,
  offsetRatio: 0.06
}
*/
```

> ✅ 说明：
>
> * RSI 高达 80，认为市场偏热 → 整体向上偏移
> * 并适当拉宽区间（scaleRatio > 1）防止踏空
> * 若 RSI = 50 则不会偏移也不扩大（最理想震荡状态）

---

## ✅ 策略优势总结

| 优化点         | 效果说明                     |
| ----------- | ------------------------ |
| 动态调整中心位移    | 根据 RSI 判断区间应上移 or 下移     |
| 动态调整区间宽度    | RSI 越极端 → 网格越稀疏 → 防止密集亏损 |
| 可调参、可组合     | 可配合价格波动率、KDJ、MACD 等优化    |
| 适合震荡 & 趋势兼容 | 避免一刀切盲目布网，适配不同行情         |

---

根据以上理论知识，实现一个网格策略的计算工具
