const workspace = document.getElementById("workspace");

let workspaceItems = []; // {instanceId, colorId, x, y}
let nextInstanceId = 0;

let gameState = {
  unlocked: [
    { id: "Red", h: 0, s: 70, l: 50 },
    { id: "Green", h: 120, s: 70, l: 50 },
    { id: "Blue", h: 240, s: 70, l: 50 },
  ],
  currencies: { Red: 0, Green: 0, Blue: 0 },
  combinations: {},
  discoveryOrder: ["Red", "Green", "Blue"],
};

// Colors Math
function mixHue(h1, h2) {
  const diff = ((h2 - h1 + 540) % 360) - 180;
  return (h1 + diff / 2 + 360) % 360;
}
function mixColors(c1, c2) {
  return {
    h: mixHue(c1.h, c2.h),
    s: 70,
    l: 50,
  };
}

function hslToRgb(h, s, l) {
  s /= 100;
  l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return {
    r: Math.round(255 * f(0)),
    g: Math.round(255 * f(8)),
    b: Math.round(255 * f(4)),
  };
}

function rgbToHex(r, g, b) {
  const toHex = (n) => n.toString(16).padStart(2, "0");
  return "#" + toHex(r) + toHex(g) + toHex(b);
}

// Find Logic

function nearestColorName(rgb) {
  const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
  const result = ntc.name(hex); // [matchedHex, name, isExactMatch]
  return {
    name: result[1],
    hex: result[0],
  };
}

// Drag & Drop
function combine(colorA, colorB) {
  const key = [colorA.id, colorB.id].sort().join("+");

  if (gameState.combinations[key]) {
    console.log("Already discovered", gameState.combinations[key]);
    return gameState.combinations[key];
  }

  const mixed = mixColors(colorA, colorB);
  const rgb = hslToRgb(mixed.h, mixed.s, mixed.l);
  const match = nearestColorName(rgb); // { name, hex }

  gameState.combinations[key] = match.name;

  const alreadyExists = gameState.unlocked.some((c) => c.id === match.name);
  if (!alreadyExists) {
    const newColor = {
      id: match.name,
      h: mixed.h,
      s: mixed.s,
      l: mixed.l,
    };
    gameState.unlocked.push(newColor);
    gameState.currencies[match.name] = 0;
    gameState.discoveryOrder.push(match.name);
    render();
    save();
    console.log("New discovery:", match.name);

    showDiscoveryModal(newColor);
  }

  return match.name;
}

function onSidebarDragStart(e) {
  e.dataTransfer.setData("source", "sidebar");
  e.dataTransfer.setData("colorId", e.target.dataset.colorId);

  const rect = e.target.getBoundingClientRect();
  e.dataTransfer.setData("offsetX", e.clientX - rect.left);
  e.dataTransfer.setData("offsetY", e.clientY - rect.top);
}

function onWorkspaceItemDragStart(e) {
  e.dataTransfer.setData("source", "workspace");
  e.dataTransfer.setData("instanceId", e.target.dataset.instanceId);

  const rect = e.target.getBoundingClientRect();
  e.dataTransfer.setData("offsetX", e.clientX - rect.left);
  e.dataTransfer.setData("offsetY", e.clientY - rect.top);
}

function onWorkspaceDrop(e) {
  e.preventDefault();

  if (e.target !== workspace) return;

  const source = e.dataTransfer.getData("source");
  const workspaceRect = workspace.getBoundingClientRect();

  const offsetX = Number(e.dataTransfer.getData("offsetX")) || 0;
  const offsetY = Number(e.dataTransfer.getData("offsetY")) || 0;

  const x = e.clientX - workspaceRect.left - offsetX;
  const y = e.clientY - workspaceRect.top - offsetY;

  if (source === "sidebar" && e.target.id === "workspace") {
    const colorId = e.dataTransfer.getData("colorId");
    workspaceItems.push({ instanceId: nextInstanceId++, colorId, x, y });
    renderWorkspace();
  } else if (source === "workspace") {
    const instanceId = Number(e.dataTransfer.getData("instanceId"));
    const item = workspaceItems.find((i) => i.instanceId === instanceId);
    if (item) {
      item.x = x;
      item.y = y;
      renderWorkspace();
    }
  }
}

function onWorkspaceItemDrop(e) {
  e.preventDefault();
  e.stopPropagation();
  const source = e.dataTransfer.getData("source");
  const targetInstanceId = Number(e.currentTarget.dataset.instanceId);

  let droppedColorId;
  if (source === "sidebar") {
    droppedColorId = e.dataTransfer.getData("colorId");
  } else if (source === "workspace") {
    const droppedInstanceId = Number(e.dataTransfer.getData("instanceId"));
    if (droppedInstanceId === targetInstanceId) return;
    const droppedItem = workspaceItems.find(
      (i) => i.instanceId === droppedInstanceId,
    );
    droppedColorId = droppedItem.colorId;

    workspaceItems = workspaceItems.filter(
      (i) => i.instanceId !== droppedInstanceId,
    );
  }

  const targetItem = workspaceItems.find(
    (i) => i.instanceId === targetInstanceId,
  );

  const targetX = targetItem.x;
  const targetY = targetItem.y;

  const colorA = gameState.unlocked.find((c) => c.id === droppedColorId);
  const colorB = gameState.unlocked.find((c) => c.id === targetItem.colorId);

  workspaceItems = workspaceItems.filter(
    (i) => i.instanceId !== targetInstanceId,
  );

  const resultColorId = combine(colorA, colorB);
  if (resultColorId) {
    workspaceItems.push({
      instanceId: nextInstanceId++,
      colorId: resultColorId,
      x: targetX,
      y: targetY,
    });
  }
  renderWorkspace();
}

// Discovery
function showDiscoveryModal(color) {
  const modal = document.getElementById("discovery-modal");
  const colorBox = document.getElementById("modal-color-box");
  const colorName = document.getElementById("modal-color-name");

  if (!modal) return;

  colorBox.style.backgroundColor = `hsl(${color.h}, ${color.s}%, ${color.l}%)`;
  colorName.textContent = color.id;

  modal.showModal();

  setTimeout(() => {
    if (modal.open) {
      modal.close();
    }
  }, 2000);
}

// Render

function renderWorkspace() {
  const workspace = document.getElementById("workspace");
  workspace.innerHTML = "";
  for (const item of workspaceItems) {
    const color = gameState.unlocked.find((c) => c.id === item.colorId);
    const el = document.createElement("div");

    el.className = "w-15 h-15 rounded-lg absolute cursor-grab";
    el.style.backgroundColor = `hsl(${color.h}, ${color.s}%, ${color.l}%)`;

    el.style.left = `${item.x}px`;
    el.style.top = `${item.y}px`;

    el.draggable = true;
    el.dataset.instanceId = item.instanceId;
    el.addEventListener("dragstart", onWorkspaceItemDragStart);
    el.addEventListener("dragover", (e) => e.preventDefault());
    el.addEventListener("drop", onWorkspaceItemDrop);
    workspace.appendChild(el);
  }
}

function render() {
  const sidebar = document.getElementById("color-menu");
  sidebar.innerHTML = "";

  for (const color of gameState.unlocked) {
    const chroma = document.createElement("div");
    chroma.className = "flex items-center";

    const chromaColor = document.createElement("div");
    chromaColor.className = "w-15 h-15 rounded-lg m-2 cursor-grab";
    chromaColor.style.backgroundColor = `hsl(${color.h}, ${color.s}%, ${color.l}%)`;
    chromaColor.draggable = true;
    chromaColor.dataset.colorId = color.id;

    chromaColor.addEventListener("dragstart", onSidebarDragStart);

    const chromaDisplayName = document.createElement("p");
    chromaDisplayName.textContent = color.id;

    chroma.appendChild(chromaColor);
    chroma.appendChild(chromaDisplayName);

    sidebar.appendChild(chroma);
  }
}

// Game tick

setInterval(() => {
  for (const color of gameState.unlocked) {
    gameState.currencies[color.id] = (gameState.currencies[color.id] || 0) + 1;
  }
}, 1000);

// Save Logic

function save() {
  localStorage.setItem("gameState", JSON.stringify(gameState));
}

function load() {
  const saved = localStorage.getItem("gameState");
  if (saved) {
    gameState = JSON.parse(saved);
  }
}

// Init

workspace.addEventListener("dragover", (e) => e.preventDefault());
workspace.addEventListener("drop", onWorkspaceDrop);

load();
render();
renderWorkspace();
