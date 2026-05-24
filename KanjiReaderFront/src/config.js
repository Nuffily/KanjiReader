const config = {
  development: {
    apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8099'
  },
  production: {
    apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8099'
  }
}

export default config[import.meta.env.MODE || 'development'];