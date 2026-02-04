// ===== 式神总列表（示例，可扩展） =====
const SHIKIGAMI_LIST = [
  "不知火","须佐之男","sp荒","因幡辉夜姬","卑弥呼","sp茶几",
  "阎魔","sp不见岳","sp座敷","摩托","鬼吞","一目连","sp禅镜","帝释天",
  "封阳君","sp追月","sp熊","sp蛇","铃鹿御前","面灵气","入内雀","李小狼",
  "祸津神","神无月","龙珏","sp岚","太奶","千姬","云外镜","ssr蛇","sp小白","泷",
  "猫川","月读","缘结神","sp鹿丸","雨女","sp猫","老头",
  "匣子","言灵","初音","鬼金羊","sp雪女"
];

// ===== 常用快捷式神 =====
const QUICK_PICKS = ["不知火","鬼吞","平将门","封阳君","卑弥呼","荒骷髅","sp禅镜","鬼金羊"];

// ===== 当前选择状态 =====
let currentBan = null;
let enemyPicks = [];
let strategies = [];

// ===== 加载 strategies.json =====
fetch("strategies.json")
  .then(res => res.json())
  .then(data => {
    strategies = data;
    console.log("策略数据已加载", strategies);
  });

// ===== 渲染快捷按钮 =====
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

// ===== 联想输入 =====
function renderSuggestions(inputEl, containerId, onSelect) {
  const keyword = inputEl.value.trim();
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  if (!keyword) return;

  SHIKIGAMI_LIST.filter(name => name.includes(keyword))
    .slice(0, 6)
    .forEach(name => {
      const div = document.createElement("div");
      div.textContent = name;
      div.onclick = () => {
        onSelect(name);
        inputEl.value = "";
        container.innerHTML = "";
      };
      container.appendChild(div);
    });
}

// ===== Ban 区 =====
renderQuickButtons("ban-quick", name => {
  currentBan = name;
  renderBan();
  updateRecommendations();
});

const banInput = document.getElementById("ban-input");
banInput.addEventListener("input", () => {
  renderSuggestions(banInput, "ban-suggestions", name => {
    currentBan = name;
    renderBan();
    updateRecommendations();
  });
});

// 删除 ban
document.getElementById("remove-ban").onclick = () => {
  currentBan = null;
  renderBan();
  updateRecommendations();
};

// ===== 敌方选择 =====
renderQuickButtons("enemy-quick", name => {
  if (enemyPicks.length >= 6) return;
  enemyPicks.push(name);
  renderEnemyPicked();
  updateRecommendations();
});

const enemyInput = document.getElementById("enemy-input");
enemyInput.addEventListener("input", () => {
  if (enemyPicks.length >= 6) return;
  renderSuggestions(enemyInput, "enemy-suggestions", name => {
    enemyPicks.push(name);
    renderEnemyPicked();
    updateRecommendations();
  });
});

// 清空敌方
document.getElementById("clear-enemy").onclick = () => {
  enemyPicks = [];
  renderEnemyPicked();
  updateRecommendations();
};

// 一键清空
document.getElementById("clear-all").onclick = () => {
  currentBan = null;
  enemyPicks = [];
  renderBan();
  renderEnemyPicked();
  updateRecommendations();
};

// ===== 渲染 Ban =====
function renderBan() {
  const container = document.getElementById("ban-quick");
  container.innerHTML = "";
  if (currentBan) {
    const item = document.createElement("div");
    item.className = "picked-item";
    item.innerHTML = `<span>${currentBan}</span> <button class="remove-btn">✕</button>`;
    item.querySelector("button").onclick = () => {
      currentBan = null;
      renderBan();
      updateRecommendations();
    };
    container.appendChild(item);
  }
}

// ===== 渲染敌方已选 =====
function renderEnemyPicked() {
  const container = document.getElementById("enemy-picked");
  container.innerHTML = "";
  enemyPicks.forEach((name, index) => {
    const item = document.createElement("div");
    item.className = "picked-item";
    item.innerHTML = `<span>${index + 1}. ${name}</span> <button class="remove-btn" data-index="${index}">✕</button>`;
    item.querySelector("button").onclick = () => {
      enemyPicks.splice(index, 1);
      renderEnemyPicked();
      updateRecommendations();
    };
    container.appendChild(item);
  });
  document.getElementById("enemy-status").textContent = `当前已选：${enemyPicks.length} / 6`;
}

// ===== 推荐逻辑 =====
function updateRecommendations() {
  const container = document.getElementById("recommendations");
  container.innerHTML = "";

  if (!strategies.length) return;

  let matches = strategies.filter(s => s.ban === currentBan &&
    enemyPicks.every((e,i) => s.enemy[i] === e)
  );

  let relaxed = false;
  // 放宽匹配条件，如果严格匹配为空
  if (matches.length === 0 && currentBan) {
    matches = strategies.filter(s => s.ban === currentBan);
    relaxed = true;
  }

  if (matches.length === 0) {
    container.innerHTML = "<p>暂无匹配策略</p>";
    return;
  }

  matches.slice(0,3).forEach(s => {
    const div = document.createElement("div");
    div.className = "rec-item";
    div.innerHTML = `
      <p class="rec-title">${relaxed ? "(非完全匹配) " : ""}我方推荐阵容: ${s.my.join(" → ")}</p>
      <p>阴阳师: ${s.shikigami.join(", ")}</p>
      <p>操作细节: ${s.operation}</p>
      <p>补充说明: ${s.notes}</p>
    `;
    container.appendChild(div);
  });
}

// ===== 初始化 =====
renderQuickButtons("ban-quick", name => {
  currentBan = name;
  renderBan();
  updateRecommendations();
});
renderQuickButtons("enemy-quick", name => {
  if (enemyPicks.length >= 6) return;
  enemyPicks.push(name);
  renderEnemyPicked();
  updateRecommendations();
});
