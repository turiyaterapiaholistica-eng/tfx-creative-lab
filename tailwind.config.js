/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './index.html',
        './src/**/*.js',
    ],
    theme: {
        extend: {
            colors: {
                'tf-bg': '#050505',
                'tf-purple': '#8B5CF6',
                'tf-blue': '#3B82F6',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                display: ['"Clash Display"', 'sans-serif'],
            }
        }
    },
    plugins: [],
}
