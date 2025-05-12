import * as fs from 'fs';
import * as path from 'path';

// Create simple placeholder image (base64 encoded SVG)
function createPlaceholderImage(type: string, color: string): string {
  const svgContent = `
  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
    <rect width="64" height="64" fill="#333" rx="5" />
    <text x="32" y="36" font-family="Arial" font-size="12" fill="${color}" text-anchor="middle">${type}</text>
  </svg>
  `;
  
  return `data:image/svg+xml;base64,${Buffer.from(svgContent).toString('base64')}`;
}

// Generate default item images
async function generateItemImages() {
  const itemTypes = [
    { name: 'sword', color: '#FF9900' },
    { name: 'shield', color: '#BBBBBB' },
    { name: 'dagger', color: '#FF5555' },
    { name: 'bow', color: '#AAAA00' },
    { name: 'staff', color: '#9900FF' },
    { name: 'orb', color: '#00AAFF' },
    { name: 'helmet', color: '#CCCCCC' },
    { name: 'armor', color: '#DDDDDD' },
    { name: 'boots', color: '#AAAAAA' },
    { name: 'potion', color: '#FF00FF' },
    { name: 'food', color: '#00AA00' },
    { name: 'scroll', color: '#FFFF99' }
  ];

  const itemDirectory = path.resolve('./public/images/items');
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(itemDirectory)) {
    fs.mkdirSync(itemDirectory, { recursive: true });
  }

  // Generate each item image
  for (const item of itemTypes) {
    const svg = createPlaceholderImage(item.name, item.color);
    const filePath = path.join(itemDirectory, `${item.name}.svg`);
    
    // Convert data URL to SVG content
    const svgContent = Buffer.from(svg.split(',')[1], 'base64').toString();
    fs.writeFileSync(filePath, svgContent);
    
    
  }
}

// Generate default spell images
async function generateSpellImages() {
  const spellTypes = [
    { name: 'flame', color: '#FF0000' },
    { name: 'aqua', color: '#0000FF' },
    { name: 'gale', color: '#AAFFFF' },
    { name: 'terra', color: '#A52A2A' },
    { name: 'ether', color: '#AA00AA' }
  ];

  const spellDirectory = path.resolve('./public/images/spells');
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(spellDirectory)) {
    fs.mkdirSync(spellDirectory, { recursive: true });
  }

  // Generate each spell image
  for (const spell of spellTypes) {
    const svg = createPlaceholderImage(spell.name, spell.color);
    const filePath = path.join(spellDirectory, `${spell.name}.svg`);
    
    // Convert data URL to SVG content
    const svgContent = Buffer.from(svg.split(',')[1], 'base64').toString();
    fs.writeFileSync(filePath, svgContent);
    
    
  }
}

// Main function
async function main() {
  try {
    await generateItemImages();
    await generateSpellImages();
    
  } catch (error) {
    console.error("Error creating default images:", error);
  }
}

// Run main function
main(); 