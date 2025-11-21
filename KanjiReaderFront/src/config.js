const config = {
  development: {
    apiUrl: 'http://127.0.0.1:8099'
  }
}

export default config[process.env.NODE_ENV || 'development'];