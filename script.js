const workspace = document.getElementById("workspace");

let workspaceItems = []; // {instanceId, colorId}
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
    gameState.unlocked.push({
      id: match.name,
      h: mixed.h,
      s: mixed.s,
      l: mixed.l,
    });
    gameState.currencies[match.name] = 0;
    gameState.discoveryOrder.push(match.name);
    render();
    save();
    console.log("New discovery:", match.name);
  }

  return match.name;
}

function onSidebarDragStart(e) {
  e.dataTransfer.setData("source", "sidebar");
  e.dataTransfer.setData("colorId", e.target.dataset.colorId);
}

function onWorkspaceItemDragStart(e) {
  e.dataTransfer.setData("source", "workspace");
  e.dataTransfer.setData("instanceId", e.target.dataset.instanceId);
}

function onWorkspaceDrop(e) {
  e.preventDefault();
  const source = e.dataTransfer.getData("source");

  if (source === "sidebar" && e.target.id === "workspace") {
    const colorId = e.dataTransfer.getData("colorId");
    workspaceItems.push({ instanceId: nextInstanceId++, colorId });
    renderWorkspace();
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
    });
  }
  renderWorkspace();
}

// Render

function renderWorkspace() {
  const workspace = document.getElementById("workspace");
  workspace.innerHTML = "";
  for (const item of workspaceItems) {
    const color = gameState.unlocked.find((c) => c.id === item.colorId);
    const el = document.createElement("div");
    el.className = "w-15 h-15 rounded-lg m-2 inline-block cursor-grab";
    el.style.backgroundColor = `hsl(${color.h}, ${color.s}%, ${color.l}%)`;
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

setInterval(() => {}, 1000);

// Save Logic

function save() {}

function load() {}

// Init

workspace.addEventListener("dragover", (e) => e.preventDefault());
workspace.addEventListener("drop", onWorkspaceDrop);

load();
render();
renderWorkspace();
