require('dotenv').config({ path: '.env.local' })
const withPWA = require('next-pwa')
const webpack = require('webpack')

module.exports = withPWA({
  pwa: {
    dest: 'public',
    disable: process.env.NODE_ENV === 'development',
  },
  webpack: (config) => {
    config.target = 'electron-renderer'
    config.plugins.push(
      new webpack.EnvironmentPlugin(process.env)
    )
    return config
  }
})
