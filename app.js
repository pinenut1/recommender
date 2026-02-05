// ===== 式神总列表 =====
const SHIKIGAMI_LIST = [
  "不知火","须佐之男","sp荒","因幡辉夜姬","卑弥呼","sp茶几",
  "阎魔","sp不见岳","sp座敷","摩托","鬼吞","一目连","sp禅镜","帝释天",
  "封阳君","sp追月","sp熊","sp蛇","铃鹿御前","面灵气","入内雀","李小狼",
  "祸津神","神无月","龙珏","sp岚","太奶","千姬","云外镜","ssr蛇","sp小白","泷",
  "猫川","月读","缘结神","sp鹿丸","雨女","sp猫","老头",
  "匣子","言灵","初音","鬼金羊","sp雪女","荒骷髅","平将门"
];

// ===== 常用快捷式神 =====
const QUICK_PICKS = [
  "不知火","鬼吞","平将门","封阳君","卑弥呼","荒骷髅","sp禅镜","鬼金羊"
];

// ===== 当前状态 =====
let currentBan = null;
let enemyPicks = [];
let strategies = [];

// ===== 加载策略数据 =====
fetch("strategies.json")
  .then(res => res.json())
  .then(data => {
    strategies = data;
    updateRecommendations();
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

  SHIKIGAMI_LIST.filter(n => n.includes(keyword))
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

// ===== Ban =====
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

document.getElementById("clear-enemy").onclick = () => {
  enemyPicks = [];
  renderEnemyPicked();
  updateRecommendations();
};

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
  if (!currentBan) return;

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

// ===== 渲染敌方 =====
function renderEnemyPicked() {
  const container = document.getElementById("enemy-picked");
  container.innerHTML = "";
  enemyPicks.forEach((name, idx) => {
    const div = document.createElement("div");
    div.className = "picked-item";
    div.innerHTML = `<span>${idx + 1}. ${name}</span> <button class="remove-btn">✕</button>`;
    div.querySelector("button").onclick = () => {
      enemyPicks.splice(idx, 1);
      renderEnemyPicked();
      updateRecommendations();
    };
    container.appendChild(div);
  });
  document.getElementById("enemy-status").textContent =
    `当前已选：${enemyPicks.length} / 6`;
}

// ===== 计算匹配信息 =====
function evaluateStrategy(strategy) {
  let hitCount = 0;
  let distanceSum = 0;

  enemyPicks.forEach((pick, userIndex) => {
    const idx = strategy.enemy.indexOf(pick);
    if (idx !== -1) {
      hitCount++;
      distanceSum += Math.abs(idx - userIndex);
    }
  });

  const hasBan = currentBan && strategy.enemy.includes(currentBan);

  return {
    ...strategy,
    hitCount,
    distanceSum,
    hasBan
  };
}

// ===== 推荐逻辑 =====
function updateRecommendations() {
  const container = document.getElementById("recommendations");
  container.innerHTML = "";
  if (!strategies.length) return;

  const evaluated = strategies.map(evaluateStrategy);

  evaluated.sort((a, b) => {
    // 1️⃣ 命中数量
    if (b.hitCount !== a.hitCount) {
      return b.hitCount - a.hitCount;
    }
    // 2️⃣ ban 优先级（同命中数）
    if (a.hasBan !== b.hasBan) {
      return a.hasBan ? 1 : -1;
    }
    // 3️⃣ 位置距离（仅同命中数）
    return a.distanceSum - b.distanceSum;
  });

  evaluated.forEach(s => {
    const div = document.createElement("div");
    div.className = "rec-item";

    const tags = [];
    tags.push(`命中 ${s.hitCount}`);
    if (s.hasBan) tags.push("包含 ban");

    div.innerHTML = `
      <p class="rec-title">
        我方阵容：${s.my.join(" → ")}
        <span class="tags">[${tags.join(" / ")}]</span>
      </p>
      <p>阴阳师：${s.shikigami?.join(", ") || "—"}</p>
      <p>操作：${s.operation || "—"}</p>
      <p class="notes">${s.notes || ""}</p>
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
