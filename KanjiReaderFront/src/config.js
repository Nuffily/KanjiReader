const config = {
  development: {
    apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8099'
  },
  production: {
    apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8099'
  }
}

// In Vite, use import.meta.env.MODE instead of NODE_ENV
export default config[import.meta.env.MODE || 'development'];