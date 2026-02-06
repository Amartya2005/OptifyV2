/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}", // <--- key line
    ],
    theme: {
        extend: {
            colors: {
                brand: '#000000',
                accent: '#00cc66',
            }
        },
    },
    plugins: [],
}