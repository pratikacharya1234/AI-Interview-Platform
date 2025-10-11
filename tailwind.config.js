/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // AI Prism Color Scheme - Primary
        obsidian: '#09090B',
        'prism-teal': '#14B8A6',
        'lavender-mist': '#C084FC',
        moonlight: '#F0F9FF',
        
        // Feature Colors
        'jade-success': '#22C55E',
        'amber-glow': '#FBBF24',
        'rose-alert': '#FB7185',
        'azure-info': '#38BDF8',
        
        // Neutral Tones
        graphite: '#18181B',
        silver: '#94A3B8',
        cloud: '#F1F5F9',
        pearl: '#FCFCFD',
        
        // Enhanced Gradients
        'gradient-start': '#14B8A6',
        'gradient-end': '#C084FC',
        'dark-gradient-start': '#09090B',
        'dark-gradient-end': '#1E1E23',
      },
      backgroundImage: {
        'prism-gradient': 'linear-gradient(135deg, #14B8A6 0%, #C084FC 100%)',
        'dark-gradient': 'linear-gradient(135deg, #09090B 0%, #1E1E23 100%)',
        'hero-gradient': 'linear-gradient(135deg, #14B8A6 0%, #C084FC 50%, #38BDF8 100%)',
      },
      boxShadow: {
        'teal-glow': '0 0 20px rgba(20, 184, 166, 0.15)',
        'lavender-glow': '0 0 20px rgba(192, 132, 252, 0.15)',
        'prism-card': '0 4px 6px -1px rgba(20, 184, 166, 0.1), 0 2px 4px -1px rgba(192, 132, 252, 0.06)',
      },
      animation: {
        'pulse-teal': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(20, 184, 166, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(20, 184, 166, 0.4)' },
        },
      },
      fontFamily: {
        'display': ['Inter', 'system-ui', 'sans-serif'],
        'body': ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}