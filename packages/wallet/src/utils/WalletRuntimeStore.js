import { ss58ToHex } from '@phala/runtime'
import { observable, toJS } from 'mobx'
import { cryptoWaitReady } from '@polkadot/util-crypto'
import keyring from '@polkadot/ui-keyring'
import { CONTRACT_BALANCE, CONTRACT_ASSETS } from '@phala/wallet/utils/constants'

export const WalletRuntimeStore = observable.object({
  ecdhChannel: null,
  ecdhShouldJoin: false,
  keypair: null,
  accountId: null,
  latency: 0,
  info: null,
  error: false,
  pApi: null,
  assets: [],
  mainAsset: null,
  get accountIdHex () {
    if (!this.accountId) { return null }
    return ss58ToHex(this.accountId)
  },
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
  },
  unsetAssets () {
    this.assets = []
    this.mainAsset = null
  },
  async updateAssetMetadata () {
    const assetsMeta = ((
      await this.query('Metadata', null, CONTRACT_ASSETS)
    )?.Metadata?.metadata || [])

    const mainAssetTotalIssuance = (
      (
        await this.query('TotalIssuance', null, CONTRACT_BALANCE)
      )?.TotalIssuance?.totalIssuance || '0')

    this.assets = assetsMeta
    this.mainAsset = {
      symbol: 'PHA',
      totalSupply: mainAssetTotalIssuance
    }
  },
  async updateMainAsset () {
    const res = await this.query('FreeBalance', () => ({ account: this.accountIdHex }), CONTRACT_BALANCE)
    this.mainAsset.balance = res?.FreeBalance?.balance || "0"
  },
  async updateSingleAssets (asset) {
    const res = await this.query('Balance', () => ({ account: this.accountIdHex, id: asset.id }), CONTRACT_ASSETS)
    asset.balance = res?.Balance?.balance || "0"
  },
  updateAssets () {
    return Promise.all(this.assets.map(i => this.updateSingleAssets(i)))
  },
  async fullUpdate () {
    await this.updateAssetMetadata()
    await this.updateMainAsset()
    await this.updateAssets()
  }
})

export default WalletRuntimeStore
export const createWalletRuntimeStore = () => WalletRuntimeStore
