// ===== 式神总列表（示例，后面你可以自己补全） =====
const SHIKIGAMI_LIST = [
  "不知火",
  "鬼切",
  "须佐之男",
  "SP荒",
  "因幡辉夜姬",
  "帝释天",
  "铃彦姬",
  "千姬",
  "缘结神",
  "鬼吞"
];

// ===== 常用快捷式神（5 个） =====
const QUICK_PICKS = [
  "不知火",
  "鬼切",
  "须佐之男",
  "SP荒",
  "因幡辉夜姬"
];

// ===== 当前选择状态（唯一真相） =====
let currentBan = null;
let enemyPicks = [];

// ===== 通用：渲染快捷按钮 =====
function renderQuickButtons(containerId, onClick) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  QUICK_PICKS.forEach(name => {
    const btn = document.createElement("button");
    btn.textContent = name;
    btn.onclick = () => onClick(name);
    container.appendChild(btn);
  });
}

// ===== 通用：联想输入 =====
function renderSuggestions(inputEl, containerId, onSelect) {
  const keyword = inputEl.value.trim();
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  if (!keyword) return;

  SHIKIGAMI_LIST
    .filter(name => name.includes(keyword))
    .slice(0, 6)
    .forEach(name => {
      const div = document.createElement("div");
      div.textContent = name;
      div.style.cursor = "pointer";
      div.onclick = () => {
        onSelect(name);
        inputEl.value = "";
        container.innerHTML = "";
      };
      container.appendChild(div);
    });
}

// ===== Ban 位选择 =====
renderQuickButtons("ban-quick", name => {
  currentBan = name;
  renderBan();
  updateResult();
});

const banInput = document.getElementById("ban-input");
banInput.addEventListener("input", () => {
  renderSuggestions(banInput, "ban-suggestions", name => {
    currentBan = name;
    renderBan();
    updateResult();
  });
});

// ===== 敌方式神选择 =====
renderQuickButtons("enemy-quick", name => {
  if (enemyPicks.length >= 6) return;
  enemyPicks.push(name);
  renderEnemyPicked();
  updateResult();
});

const enemyInput = document.getElementById("enemy-input");
enemyInput.addEventListener("input", () => {
  renderSuggestions(enemyInput, "enemy-suggestions", name => {
    if (enemyPicks.length >= 6) return;
    enemyPicks.push(name);
    renderEnemyPicked();
    updateResult();
  });
});

// ===== 渲染 Ban（可删除 / 重选） =====
function renderBan() {
  const container = document.getElementById("enemy-ban");
  container.innerHTML = "";

  if (!currentBan) {
    container.textContent = "尚未选择";
    return;
  }

  const item = document.createElement("div");
  item.className = "picked-item";
  item.innerHTML = `
    <span>${currentBan}</span>
    <button class="remove-btn">✕</button>
  `;

  item.querySelector("button").onclick = () => {
    currentBan = null;
    renderBan();
    updateResult();
  };

  container.appendChild(item);
}

// ===== 渲染敌方已选式神（可单个删除） =====
function renderEnemyPicked() {
  const container = document.getElementById("enemy-picked");
  container.innerHTML = "";

  enemyPicks.forEach((name, index) => {
    const item = document.createElement("div");
    item.className = "picked-item";

    item.innerHTML = `
      <span>${index + 1}. ${name}</span>
      <button class="remove-btn" data-index="${index}">✕</button>
    `;

    item.querySelector("button").onclick = () => {
      enemyPicks.splice(index, 1);
      renderEnemyPicked();
      updateResult();
    };

    container.appendChild(item);
  });
}

// ===== 一键清空敌方选择 =====
const clearBtn = document.getElementById("clear-enemy");
if (clearBtn) {
  clearBtn.onclick = () => {
    currentBan = null;
    enemyPicks = [];
    renderBan();
    renderEnemyPicked();
    updateResult();
  };
}

// ===== 状态展示（调试 / 当前状态） =====
function updateResult() {
  document.getElementById("enemy-status").textContent =
    `当前已选：${enemyPicks.length} / 6`;

  document.getElementById("current-result").innerHTML = `
    <p>Ban：${currentBan || "未选择"}</p>
    <p>敌方：${enemyPicks.join(" → ") || "未选择"}</p>
  `;
}

// ===== 初始化渲染 =====
renderBan();
renderEnemyPicked();
updateResult();
