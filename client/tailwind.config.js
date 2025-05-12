module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      fontFamily: {
        pixel: ["'Press Start 2P'", "monospace"]
      },
      colors: {
        // RPG theme colors based on the screenshot
        primary: {
          light: '#66d1ff',
          DEFAULT: '#3ec6e0',
          dark: '#1a98b0',
        },
        brown: {
          light: '#c09876',
          DEFAULT: '#a97c50',
          dark: '#8b5e3c',
          panel: '#e6c8a0', // Panel background
          header: '#9e6b49', // Header background
        },
        gold: {
          light: '#ffe147',
          DEFAULT: '#ffd700',
          dark: '#e6c300',
        },
        ui: {
          hp: '#ff5252',
          mp: '#5e9dff',
          exp: '#ffd700',
          dark: '#2d1b00',
        }
      },
      borderWidth: {
        '3': '3px',
        '6': '6px',
      }
    },
  },
  plugins: [],
}; 