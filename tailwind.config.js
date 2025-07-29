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
  			border: 'oklch(var(--border))',
  			input: 'oklch(var(--input))',
  			ring: 'oklch(var(--ring))',
  			background: 'oklch(var(--background))',
  			foreground: 'oklch(var(--foreground))',
  			// Sistema moderno de cores
  			'primary-25': 'var(--primary-25)',
  			'primary-50': 'var(--primary-50)',
  			'primary-100': 'var(--primary-100)',
  			'primary-300': 'var(--primary-300)',
  			'primary-600': 'var(--primary-600)',
  			'primary-700': 'var(--primary-700)',
  			'primary-900': 'var(--primary-900)',
  			'primary-950': 'var(--primary-950)',
  			'secondary-25': 'var(--secondary-25)',
  			'secondary-50': 'var(--secondary-50)',
  			'secondary-100': 'var(--secondary-100)',
  			'secondary-300': 'var(--secondary-300)',
  			'secondary-600': 'var(--secondary-600)',
  			'secondary-700': 'var(--secondary-700)',
  			'secondary-900': 'var(--secondary-900)',
  			'secondary-950': 'var(--secondary-950)',
  			// Aliases para compatibilidade legada
  			'primaria-500': 'var(--primary-600)',
  			'primaria-700': 'var(--primary-700)',
  			'secundaria-500': 'var(--secondary-600)',
  			sucesso: 'var(--badge-success-bg)',
  			aviso: 'var(--badge-warning-bg)',
  			perigo: 'var(--badge-danger-bg)',
  			primary: {
  				light: 'var(--primary-light)',
  				base: 'var(--primary-base)',
  				DEFAULT: 'oklch(var(--primary))',
  				dark: 'var(--primary-dark)',
  				foreground: 'oklch(var(--primary-foreground))'
  			},
  			secondary: {
  				light: 'var(--secondary-light)',
  				base: 'var(--secondary-base)',
  				DEFAULT: 'oklch(var(--secondary))',
  				dark: 'var(--secondary-dark)',
  				foreground: 'oklch(var(--secondary-foreground))'
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
  				DEFAULT: 'oklch(var(--destructive))',
  				foreground: 'oklch(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'oklch(var(--muted))',
  				foreground: 'oklch(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'oklch(var(--accent))',
  				foreground: 'oklch(var(--accent-foreground))'
  			},
  			popover: {
  				DEFAULT: 'oklch(var(--popover))',
  				foreground: 'oklch(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'oklch(var(--card))',
  				foreground: 'oklch(var(--card-foreground))'
  			},
  			chart: {
  				'1': 'oklch(var(--chart-1))',
  				'2': 'oklch(var(--chart-2))',
  				'3': 'oklch(var(--chart-3))',
  				'4': 'oklch(var(--chart-4))',
  				'5': 'oklch(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'oklch(var(--sidebar-background))',
  				foreground: 'oklch(var(--sidebar-foreground))',
  				primary: 'oklch(var(--sidebar-primary))',
  				'primary-foreground': 'oklch(var(--sidebar-primary-foreground))',
  				accent: 'oklch(var(--sidebar-accent))',
  				'accent-foreground': 'oklch(var(--sidebar-accent-foreground))',
  				border: 'oklch(var(--sidebar-border))',
  				ring: 'oklch(var(--sidebar-ring))'
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