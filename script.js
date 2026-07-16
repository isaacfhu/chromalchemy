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
function mixHue(h1, h2) {}
function mixColors(c1, c2) {}

function hslToRgb(h, s, l) {}

// Find Logic

function nearestColorName(rgb) {}

// Drag & Drop
function onDragStart(e) {}
function onDrop(e) {}

// Render

function render() {}

// Game tick

setInterval(() => {}, 1000);

// Save Logic

function save() {}

function load() {}

// Init
load();
render();
