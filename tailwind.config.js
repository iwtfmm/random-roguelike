/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        // 指挥终端色板
        void: "#070a0f",
        abyss: "#0a0e14",
        panel: "#10151d",
        panel2: "#161c26",
        edge: "#243040",
        // 强调色
        amber: "#c8a45c",
        steel: "#3a8fb7",
        ember: "#8b2c2c",
        chalk: "#d4d4d4",
        muted: "#6b7785",
      },
      fontFamily: {
        display: ['"Noto Serif SC"', "serif"],
        mono: ['"JetBrains Mono"', '"IBM Plex Mono"', "monospace"],
        sans: ['"Noto Sans SC"', "system-ui", "sans-serif"],
      },
      animation: {
        "scanline": "scanline 6s linear infinite",
        "pulse-glow": "pulseGlow 2.4s ease-in-out infinite",
        "flicker": "flicker 0.12s steps(2) infinite",
        "lock-in": "lockIn 0.4s cubic-bezier(0.2, 0.9, 0.3, 1.4) forwards",
        "rise": "rise 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards",
        "drift": "drift 18s linear infinite",
      },
      keyframes: {
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(200,164,92,0.35), 0 0 24px 2px rgba(200,164,92,0.18)" },
          "50%": { boxShadow: "0 0 0 8px rgba(200,164,92,0), 0 0 40px 6px rgba(200,164,92,0.30)" },
        },
        flicker: {
          "0%": { opacity: "1" },
          "100%": { opacity: "0.55" },
        },
        lockIn: {
          "0%": { transform: "scale(0.92)", filter: "brightness(2)" },
          "60%": { transform: "scale(1.04)" },
          "100%": { transform: "scale(1)", filter: "brightness(1)" },
        },
        rise: {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        drift: {
          "0%": { backgroundPosition: "0 0" },
          "100%": { backgroundPosition: "60px 60px" },
        },
      },
    },
  },
  plugins: [],
};
