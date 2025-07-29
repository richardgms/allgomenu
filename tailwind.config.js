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
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			'primaria-50': 'var(--cor-primaria-50)',
  			'primaria-100': 'var(--cor-primaria-100)',
  			'primaria-200': 'var(--cor-primaria-200)',
  			'primaria-300': 'var(--cor-primaria-300)',
  			'primaria-500': 'var(--cor-primaria-500)',
  			'primaria-600': 'var(--cor-primaria-600)',
  			'primaria-700': 'var(--cor-primaria-700)',
  			'primaria-900': 'var(--cor-primaria-900)',
  			'secundaria-500': 'var(--cor-secundaria-500)',
  			'secundaria-600': 'var(--cor-secundaria-600)',
  			'secundaria-700': 'var(--cor-secundaria-700)',
  			'secundaria-800': 'var(--cor-secundaria-800)',
  			'secundaria-900': 'var(--cor-secundaria-900)',
  			'secundaria-100': 'var(--cor-secundaria-100)',
  			'secundaria-300': 'var(--cor-secundaria-300)',
  			'secundaria-400': 'var(--cor-secundaria-400)',
  			sucesso: 'var(--cor-sucesso)',
  			aviso: 'var(--cor-aviso)',
  			perigo: 'var(--cor-perigo)',
  			primary: {
  				light: 'var(--primary-light)',
  				base: 'var(--primary-base)',
  				DEFAULT: 'hsl(var(--primary))',
  				dark: 'var(--primary-dark)',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				light: 'var(--secondary-light)',
  				base: 'var(--secondary-base)',
  				DEFAULT: 'hsl(var(--secondary))',
  				dark: 'var(--secondary-dark)',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			'color-success': 'var(--color-success)',
  			'color-success-light': 'var(--color-success-light)',
  			'color-success-dark': 'var(--color-success-dark)',
  			'color-warning': 'var(--color-warning)',
  			'color-warning-light': 'var(--color-warning-light)',
  			'color-warning-dark': 'var(--color-warning-dark)',
  			'color-error': 'var(--color-error)',
  			'color-error-light': 'var(--color-error-light)',
  			'color-error-dark': 'var(--color-error-dark)',
  			'color-info': 'var(--color-info)',
  			'color-info-light': 'var(--color-info-light)',
  			'color-info-dark': 'var(--color-info-dark)',
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
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
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