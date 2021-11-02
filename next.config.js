require('dotenv').config({ path: '.env.local' })
const webpack = require('webpack')

module.exports = {
  experimental: {
    externalDir: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.target = 'electron-renderer'
      config.node = {
        __dirname: true,
      }
    }
    config.plugins.push(new webpack.EnvironmentPlugin(process.env))
    return config
  },
}
