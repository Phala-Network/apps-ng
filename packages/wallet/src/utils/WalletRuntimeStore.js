import { observable } from 'mobx'
import { cryptoWaitReady } from '@polkadot/util-crypto'
import keyring from '@polkadot/ui-keyring'

export const WalletRuntimeStore = observable.object({
  ecdhChannel: null,
  ecdhShouldJoin: false,
  keypair: null,
  latency: 0,
  info: null,
  error: false,
  pApi: null,
  get channelReady () {
    if (!this.ecdhChannel || !this.ecdhChannel.core.agreedSecret || !this.ecdhChannel.core.remotePubkey) {
      console.warn('ECDH not ready')
      return false
    }
    if (!this.keypair || this.keypair.isLocked) {
      console.warn('Account not ready')
      return false
    }
    if (!this.pApi) {
      console.warn('pRuntime not ready')
      return false
    }
    return true
  },
  checkChannelReady () {
    if (!this.ecdhChannel || !this.ecdhChannel.core.agreedSecret || !this.ecdhChannel.core.remotePubkey) {
      throw new Error('ECDH not ready')
    }
    if (!this.keypair || this.keypair.isLocked) {
      throw new Error('Account not ready')
    }
    if (!this.pApi) {
      throw new Error('pRuntime not ready')
    }
  },
  async query (name, getPayload, contractId = 1) {
    this.checkChannelReady()
    const data = getPayload ? { [name]: getPayload() } : name
    return this.pApi.query(contractId, data)
  },
  async setAccount (accountId) {
    if (accountId) {
      await cryptoWaitReady()
      this.keypair = keyring.getPair(accountId || '')
    }
  }
})

export default WalletRuntimeStore
export const createWalletRuntimeStore = () => WalletRuntimeStore
