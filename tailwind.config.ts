import type { Config } from 'tailwindcss';

/**
 * Tailwind config for LendLoop.
 * Design tokens are derived from CSS variables declared in globals.css,
 * so the theme can stay in sync with 03_UI_DESIGN.md.
 * @see ./src/app/globals.css
 */
const config: Config = {
  darkMode: ['class'],
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/features/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
  ],
  theme: {
  	container: {
  		center: true,
  		padding: '1rem',
  		screens: {
  			'2xl': '1024px'
  		}
  	},
  	extend: {
  		colors: {
  			bench: '#EDF1EF',
  			surface: '#FFFFFF',
  			ink: '#1B2B33',
  			'ink-soft': '#53656E',
  			line: '#CBD5D1',
  			loop: '#0F766E',
  			tape: '#F5C518',
  			available: '#2F7D4F',
  			onloan: '#3B5B8C',
  			pending: '#9A6A12',
  			danger: '#B3261E',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: 'hsl(var(--card))',
  			'card-foreground': 'hsl(var(--card-foreground))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
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
  		fontFamily: {
  			display: [
  				'var(--font-bricolage)',
  				'sans-serif'
  			],
  			body: [
  				'var(--font-public-sans)',
  				'sans-serif'
  			]
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
  plugins: [require('tailwindcss-animate')],
};

export default config;
