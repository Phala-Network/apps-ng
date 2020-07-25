import * as Base64 from 'js-base64'
import * as Models from './models'
import { decodePayload, encryptObj, nonce, signQuery } from './utils'
import Axios from 'axios'

class PRuntime {
  constructor ({ endpoint, channel, keypair }) {
    this.endpoint = endpoint
    this.service = Axios.create({
      baseURL: endpoint
    })
    this.channel = channel
    this.keypair = keypair
  }

  // Internally
  async req (path, param = {}) {
    const data = {
      input: param,
      nonce: nonce()
    }
    const resp = await this.service.post(path, data, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    // TODO: validate the signature here
    const payload = JSON.parse(resp.data.payload)
    return payload
  }

  // Sends the request and returns the decoded response
  async reqTyped (path, param = {}) {
    const apiParam = Models.toApi(param)
    const resp = await this.req(path, apiParam)
    return Models.fromApi(resp)
  }

  async setFile (path, data) {
    return this.req('set', {
      path,
      data: Base64.encode(data)
    })
  }

  async getFile (path) {
    const result = await this.req('get', { path })
    return Base64.decode(result.value)
  }

  // API get_info
  async getInfo () {
    return this.reqTyped('get_info')
  }

  // API test
  async test (params) {
    return this.reqTyped('test', params)
  }

  // API query
  async query (contractId, request) {
    const query = {
      contractId: contractId,
      nonce: Math.random() * 65535 | 0,
      request
    }
    const cipher = await encryptObj(this.channel, query)
    const payload = { Cipher: cipher }  // May support plain text in the future.
    const q = signQuery(payload, this.keypair)
    const respPayload = await this.reqTyped('query', q)
    // Decode payload
    return decodePayload(this.channel, respPayload)
  }

  getItems (contractId = 1) {
    return this.query(contractId, 'GetItems')
  }

  async getItem (index, contractId = 1) {
    return (await this.getItems(contractId)).GetItems?.items?.[index] || undefined
  }

  getOrders (contractId = 1) {
    return this.query(contractId, 'GetOrders')
  }

  async getOrder (id, contractId = 1) {
    const { GetOrders: { orders } } = await this.getOrders(contractId)
    return (orders || []).filter(i => id === i.id)?.[0] || undefined
  }
}

export default PRuntime

export * from './utils'
export { PRuntime }
