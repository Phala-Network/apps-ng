const path = require('path')
const withImages = require('next-images')
const withPlugins = require('next-compose-plugins')

function resolve (...args) {
  return path.resolve( __dirname, '..', '..', ...args)
}

const withTM = require('next-transpile-modules')([
  resolve('packages'),
  resolve('vendor/polkadot-apps/packages'),
  resolve('@zeit-ui/react'),
  resolve('@zeit-ui/react-icons')
])

// const { nextI18NextRewrites } = require('next-i18next/rewrites')
const localeSubpaths = {
  en: 'en',
  zh: 'zh'
}

module.exports = withPlugins([
  withTM,
  withImages
], {
  target: 'serverless',
  env: {
    APP_PHALA_URL: process.env.APP_PHALA_URL
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.node = {
        fs: 'empty'
      }
    }
    return config
  },
  // rewrites: async () => nextI18NextRewrites(localeSubpaths),
  publicRuntimeConfig: {
    localeSubpaths
  },
})
