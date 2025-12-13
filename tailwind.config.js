/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    royal: '#004aad', // Trust/Manifold
                    lilac: '#bd5aff', // Vision/AI
                },
                primary: {
                    DEFAULT: '#004aad',
                    foreground: '#ffffff',
                },
                secondary: {
                    DEFAULT: '#f3f4f6',
                    foreground: '#111827',
                },
                accent: {
                    purple: '#bd5aff', // Updated to Brand Lilac
                    yellow: '#fbbf24',
                },
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
