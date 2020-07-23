const path = require('path')
const withImages = require('next-images')
const withPlugins = require('next-compose-plugins')
const webpack = require('webpack')

function resolve (...args) {
  return path.resolve( __dirname, '..', '..', ...args)
}

const withTM = require('next-transpile-modules')([
  resolve('packages'),
  resolve('vendor/polkadot-apps/packages'),
  resolve('node_modules/react-syntax-highlighter/dist')
])

module.exports = withPlugins([
  withTM,
  withImages
], {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.node = {
        fs: 'empty'
      }
    }
    return config
  }
})
