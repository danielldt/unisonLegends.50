const fs = require('fs');
const path = require('path');

// Ensure directories exist
const mapDir = path.join(__dirname, '../client/public/images/map');
const uiDir = path.join(__dirname, '../client/public/images/ui');

if (!fs.existsSync(mapDir)) {
  fs.mkdirSync(mapDir, { recursive: true });
}

if (!fs.existsSync(uiDir)) {
  fs.mkdirSync(uiDir, { recursive: true });
}

// Generate map background
const mapBgSvg = `<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#3c2f1d"/>
  <g fill="none" stroke="#6d5c41" stroke-width="2">
    <path d="M0,50 L800,50" />
    <path d="M0,150 L800,150" />
    <path d="M0,250 L800,250" />
    <path d="M0,350 L800,350" />
    <path d="M0,450 L800,450" />
    <path d="M0,550 L800,550" />
    <path d="M50,0 L50,600" />
    <path d="M150,0 L150,600" />
    <path d="M250,0 L250,600" />
    <path d="M350,0 L350,600" />
    <path d="M450,0 L450,600" />
    <path d="M550,0 L550,600" />
    <path d="M650,0 L650,600" />
    <path d="M750,0 L750,600" />
  </g>
  <text x="400" y="300" font-family="Arial" font-size="24" text-anchor="middle" fill="#c4a269">World Map Background</text>
  <circle cx="200" cy="150" r="20" fill="#c4a269" opacity="0.5"/>
  <circle cx="350" cy="250" r="25" fill="#c4a269" opacity="0.5"/>
  <circle cx="600" cy="400" r="30" fill="#c4a269" opacity="0.5"/>
  <path d="M100,100 C200,50 300,150 400,100 S500,150 600,100 S700,150 750,120" stroke="#c4a269" stroke-width="3" fill="none"/>
  <path d="M750,400 C700,450 650,400 600,450 S500,400 400,450 S300,400 200,450 S100,400 50,450" stroke="#c4a269" stroke-width="3" fill="none"/>
</svg>`;

fs.writeFileSync(path.join(mapDir, 'world-map-bg.jpg'), mapBgSvg);


// Generate parchment background
const parchmentBgSvg = `<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#e8dbc6"/>
  <filter id="noise">
    <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/>
    <feColorMatrix type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 0.5 0"/>
    <feComposite operator="in" in2="SourceGraphic" result="monoNoise"/>
  </filter>
  <rect width="100%" height="100%" filter="url(#noise)" fill="#d9c7a8" opacity="0.3"/>
  <rect x="0" y="0" width="400" height="400" fill="transparent" stroke="#c4a269" stroke-width="5" stroke-opacity="0.3"/>
</svg>`;

fs.writeFileSync(path.join(uiDir, 'parchment-bg.jpg'), parchmentBgSvg);


 