/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ['class'],
    content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
  	extend: {
  		colors: {
			// === SHADCN/UI CORE COLORS ===
			border: 'hsl(var(--border))',
			input: 'hsl(var(--input))',
			ring: 'hsl(var(--ring))',
			background: 'hsl(var(--background))',
			foreground: 'hsl(var(--foreground))',
			
			// === NEW UNIFIED SYSTEM - COMPLETE SCALES ===
			primary: {
				25: 'var(--primary-25)',
				50: 'var(--primary-50)',
				100: 'var(--primary-100)',
				200: 'var(--primary-200)',
				300: 'var(--primary-300)',
				400: 'var(--primary-400)',
				500: 'var(--primary-500)',
				600: 'var(--primary-600)',
				700: 'var(--primary-700)',
				800: 'var(--primary-800)',
				900: 'var(--primary-900)',
				DEFAULT: 'hsl(var(--primary))',
				foreground: 'hsl(var(--primary-foreground))'
			},
			secondary: {
				25: 'var(--secondary-25)',
				50: 'var(--secondary-50)',
				100: 'var(--secondary-100)',
				200: 'var(--secondary-200)',
				300: 'var(--secondary-300)',
				400: 'var(--secondary-400)',
				500: 'var(--secondary-500)',
				600: 'var(--secondary-600)',
				700: 'var(--secondary-700)',
				800: 'var(--secondary-800)',
				900: 'var(--secondary-900)',
				DEFAULT: 'hsl(var(--secondary))',
				foreground: 'hsl(var(--secondary-foreground))'
			},
			neutral: {
				25: 'var(--neutral-25)',
				50: 'var(--neutral-50)',
				100: 'var(--neutral-100)',
				200: 'var(--neutral-200)',
				300: 'var(--neutral-300)',
				400: 'var(--neutral-400)',
				500: 'var(--neutral-500)',
				600: 'var(--neutral-600)',
				700: 'var(--neutral-700)',
				800: 'var(--neutral-800)',
				900: 'var(--neutral-900)'
			},
			
			// === SEMANTIC COLORS ===
			success: {
				DEFAULT: 'var(--success-bg)',
				foreground: 'var(--success-text)',
				hover: 'var(--success-hover)',
				active: 'var(--success-active)'
			},
			warning: {
				DEFAULT: 'var(--warning-bg)',
				foreground: 'var(--warning-text)',
				hover: 'var(--warning-hover)',
				active: 'var(--warning-active)'
			},
			error: {
				DEFAULT: 'var(--error-bg)',
				foreground: 'var(--error-text)',
				hover: 'var(--error-hover)',
				active: 'var(--error-active)'
			},
			info: {
				DEFAULT: 'var(--info-bg)',
				foreground: 'var(--info-text)',
				hover: 'var(--info-hover)',
				active: 'var(--info-active)'
			},
			
			// === COMPONENT COLORS ===
			sidebar: {
				DEFAULT: 'var(--sidebar-bg)',
				foreground: 'var(--sidebar-text-normal)',
				border: 'var(--sidebar-border)',
				indicator: 'var(--sidebar-indicator)',
				item: 'var(--sidebar-item-normal)',
				'item-hover': 'var(--sidebar-item-hover)',
				'item-active': 'var(--sidebar-item-active)',
				'text-normal': 'var(--sidebar-text-normal)',
				'text-hover': 'var(--sidebar-text-hover)',
				'text-active': 'var(--sidebar-text-active)'
			},
			card: {
				DEFAULT: 'var(--card-background)',
				foreground: 'var(--card-text)',
				border: 'var(--card-border)',
				header: 'var(--card-header)'
			},
			
			// === LEGACY COMPATIBILITY ===
			// Keep old names for gradual migration
			'primary-25': 'var(--primary-25)',
			'primary-50': 'var(--primary-50)',
			'primary-100': 'var(--primary-100)',
			'primary-300': 'var(--primary-300)',
			'primary-600': 'var(--primary-600)',
			'primary-700': 'var(--primary-700)',
			'primary-900': 'var(--primary-900)',
			'primary-950': 'var(--primary-900)', // Map 950 to 900
			'secondary-25': 'var(--secondary-25)',
			'secondary-50': 'var(--secondary-50)',
			'secondary-100': 'var(--secondary-100)',
			'secondary-300': 'var(--secondary-300)',
			'secondary-600': 'var(--secondary-600)',
			'secondary-700': 'var(--secondary-700)',
			'secondary-900': 'var(--secondary-900)',
			'secondary-950': 'var(--secondary-900)', // Map 950 to 900
			
			// Old Portuguese names
			'primaria-500': 'var(--primary-600)',
			'primaria-700': 'var(--primary-700)',
			'secundaria-500': 'var(--secondary-600)',
			sucesso: 'var(--success-bg)',
			aviso: 'var(--warning-bg)',
			perigo: 'var(--error-bg)',
			
			// === SHADCN/UI COMPATIBILITY ===
			destructive: {
				DEFAULT: 'hsl(var(--destructive))',
				foreground: 'hsl(var(--destructive-foreground))'
			},
			muted: {
				DEFAULT: 'hsl(var(--muted))',
				foreground: 'hsl(var(--muted-foreground))'
			},
			accent: {
				DEFAULT: 'hsl(var(--accent))',
				foreground: 'hsl(var(--accent-foreground))'
			},
			popover: {
				DEFAULT: 'hsl(var(--popover))',
				foreground: 'hsl(var(--popover-foreground))'
			},
			
			// === CHART COLORS ===
			chart: {
				'1': 'hsl(var(--chart-1))',
				'2': 'hsl(var(--chart-2))',
				'3': 'hsl(var(--chart-3))',
				'4': 'hsl(var(--chart-4))',
				'5': 'hsl(var(--chart-5))'
			}
		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
} 