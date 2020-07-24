const path = require('path')
const withImages = require('next-images')
const withPlugins = require('next-compose-plugins')

function resolve (...args) {
  return path.resolve( __dirname, '..', '..', ...args)
}

const withTM = require('next-transpile-modules')([
  resolve('packages'),
  resolve('vendor/polkadot-apps/packages')
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
