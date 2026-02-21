const config = {
  development: {
    apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:8099'
  },
  production: {
    apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:8099'
  }
}

export default config[process.env.NODE_ENV || 'development'];