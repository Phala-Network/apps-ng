export default () => {
  require('@skatejs/ssr/register')
  globalThis.Blob = require('cross-blob')
  globalThis.window.location.host = 'http://localhost/'
  globalThis.CSS = { supports: () => false }
  window.isSsr = true
}
