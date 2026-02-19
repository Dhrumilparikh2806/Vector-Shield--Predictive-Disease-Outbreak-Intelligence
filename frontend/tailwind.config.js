/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: '#0f172a', // Slate-900 like
                surface: '#1e293b',    // Slate-800 like
                primary: '#3b82f6',    // Blue-500
                secondary: '#64748b',  // Slate-500
                risk: {
                    low: '#22c55e',      // Green-500
                    moderate: '#eab308', // Yellow-500
                    high: '#f97316',     // Orange-500
                    critical: '#ef4444', // Red-500
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
