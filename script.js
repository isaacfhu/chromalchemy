let gameState = {
  unlocked: [
    { id: "red", h: 0, s: 70, l: 50 },
    { id: "green", h: 120, s: 70, l: 50 },
    { id: "blue", h: 240, s: 70, l: 50 },
  ],
  currencies: { red: 0, green: 0, blue: 0 },
  combinations: {},
  discoveryOrder: ["red", "green", "blue"],
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

// Find Logic

function nearestColorName(rgb) {}

// Drag & Drop
function onDragStart(e) {}
function onDrop(e) {}

// Render

function render() {
  const sidebar = document.getElementById("color-menu");
  sidebar.innerHTML = "";

  for (const color of gameState.unlocked) {
    const chroma = document.createElement("div");
    chroma.className = "w-15 h-15 rounded-lg m-2 cursor-grab";
    chroma.style.backgroundColor = `hsl(${color.h}, ${color.s}%, ${color.l}%)`;
    chroma.draggable = true;
    chroma.dataset.colorId = color.id;

    chroma.addEventListener("dragstart", onDragStart);

    sidebar.appendChild(chroma);
  }
}

// Game tick

setInterval(() => {}, 1000);

// Save Logic

function save() {}

function load() {}

// Init
load();
render();
