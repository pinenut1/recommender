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

// ===== 常用快捷式神（你指定的 5 个） =====
const QUICK_PICKS = [
  "不知火",
  "鬼切",
  "须佐之男",
  "SP荒",
  "因幡辉夜姬"
];

// ===== 当前选择状态 =====
let currentBan = null;
let enemyPicks = [];



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


renderQuickButtons("ban-quick", name => {
  currentBan = name;
  updateResult();
});

const banInput = document.getElementById("ban-input");
banInput.addEventListener("input", () => {
  renderSuggestions(banInput, "ban-suggestions", name => {
    currentBan = name;
    updateResult();
  });
});


renderQuickButtons("enemy-quick", name => {
  if (enemyPicks.length >= 6) return;
  enemyPicks.push(name);
  updateResult();
});

const enemyInput = document.getElementById("enemy-input");
enemyInput.addEventListener("input", () => {
  renderSuggestions(enemyInput, "enemy-suggestions", name => {
    if (enemyPicks.length >= 6) return;
    enemyPicks.push(name);
    updateResult();
  });
});


function updateResult() {
  document.getElementById("enemy-status").textContent =
    `当前已选：${enemyPicks.length} / 6`;

  document.getElementById("current-result").innerHTML = `
    <p>Ban：${currentBan || "未选择"}</p>
    <p>敌方：${enemyPicks.join(" → ") || "未选择"}</p>
  `;
}
