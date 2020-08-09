import { types, flow } from 'mobx-state-tree'
import { ss58ToHex, hexToSs58 } from '@phala/runtime'
import * as Crypto from '@phala/runtime/crypto'
import PRuntime from '@phala/runtime'
import { toJS } from 'mobx'

import { cryptoWaitReady } from '@polkadot/util-crypto'
import keyring from '@polkadot/ui-keyring'
import { CONTRACT_BALANCE, CONTRACT_ASSETS } from '@phala/wallet/utils/constants'

const anyType = types.custom({
  isTargetType: () => true,
  getValidationMessage: () => '',
  fromSnapshot: val => val,
  toSnapshot: val => val
})

export const createWalletRuntimeStore = (defaultValue = {}) => {
  const WalletRuntimeStore = types
    .model('WalletStore', {
      ecdhChannel: types.maybeNull(anyType),
      ecdhShouldJoin: types.optional(types.boolean, false),
      latency: types.optional(types.number, 0),
      info: types.maybeNull(anyType),
      error: types.maybeNull(anyType),
      pApi: types.maybeNull(anyType),
      assets: types.array(anyType),
      mainAsset: types.maybeNull(anyType),
    })
    .views(self => ({
      get runtimeEndpointUrl () {
        return self.appSettings.phalaTeeApiUrl
      },
      get appSettings () {
        return defaultValue.appSettings
      },
      get appAccount () {
        return defaultValue.appAccount
      },
      get accountId () {
        return self.appAccount.address
      },
      get keypair () {
        return self.appAccount.keypair
      },
      get accountIdHex () {
        if (!self.accountId) { return null }
        return ss58ToHex(self.accountId)
      },
      get channelReady () {
        if (!self.ecdhChannel || !self.ecdhChannel.core.agreedSecret || !self.ecdhChannel.core.remotePubkey) {
          console.warn('ECDH not ready')
          return false
        }
        if (!self.keypair || self.keypair.isLocked) {
          console.warn('Account not ready')
          return false
        }
        if (!self.pApi) {
          console.warn('pRuntime not ready')
          return false
        }
        return true
      },
    }))
    .actions(self => ({
      checkChannelReady () {
        if (!self.ecdhChannel || !self.ecdhChannel.core.agreedSecret || !self.ecdhChannel.core.remotePubkey) {
          throw new Error('ECDH not ready')
        }
        if (!self.keypair || self.keypair.isLocked) {
          throw new Error('Account not ready')
        }
        if (!self.pApi) {
          throw new Error('pRuntime not ready')
        }
      },
      async query (name, getPayload, contractId = 1) {
        self.checkChannelReady()
        const data = getPayload ? { [name]: getPayload() } : name
        return self.pApi.query(contractId, data)
      },
      initEcdhChannel: flow(function* () {
        const ch = yield Crypto.newChannel()
        self.ecdhChannel = ch
        self.ecdhShouldJoin = true
      }),
      joinEcdhChannel: flow(function* () {
        const ch = yield Crypto.joinChannel(self.ecdhChannel, self.info.ecdhPublicKey)
        self.ecdhChannel = ch
        self.ecdhShouldJoin = false
        console.log('joined channel:', toJS(ch))
      }),
      initPApi (endpoint) {
        self.pApi = new PRuntime({
          endpoint,
          channel: self.ecdhChannel,
          keypair: self.keypair
        })
      },
      resetNetwork () {
        self.error = null
        self.latency = 0
        self.info = null
      },
      setInfo (i) {
        self.info = i
      },
      setError (e) {
        self.error = e
      },
      setLatency (dt) {
        self.latency = parseInt((l => l ? l * 0.8 + dt * 0.2 : dt)(self.latency))
      }
    }))

  return WalletRuntimeStore.create(defaultValue)
}

// export const WalletRuntimeStore = observable.object({
//   ecdhChannel: null,
//   ecdhShouldJoin: false,
//   latency: 0,
//   info: null,
//   error: false,
//   pApi: null,
//   assets: [],
//   mainAsset: null,



//   async query (name, getPayload, contractId = 1) {
//     this.checkChannelReady()
//     const data = getPayload ? { [name]: getPayload() } : name
//     return this.pApi.query(contractId, data)
//   },
//   unsetAssets () {
//     this.assets = []
//     this.mainAsset = null
//   },
//   async updateAssetMetadata () {
//     const assetsMeta = ((
//       await this.query('Metadata', null, CONTRACT_ASSETS)
//     )?.Metadata?.metadata || [])
//       .map(i => {
//         i.ownerAccountId = hexToSs58('0x' + i.owner)
//         return i
//       })

//     const mainAssetTotalIssuance = (
//       (
//         await this.query('TotalIssuance', null, CONTRACT_BALANCE)
//       )?.TotalIssuance?.totalIssuance || '0')

//     this.assets = assetsMeta
//     this.mainAsset = {
//       symbol: 'PHA',
//       totalSupply: mainAssetTotalIssuance
//     }
//   },
//   async updateMainAsset () {
//     const res = await this.query('FreeBalance', () => ({ account: this.accountIdHex }), CONTRACT_BALANCE)
//     this.mainAsset.balance = res?.FreeBalance?.balance || "0"
//   },
//   async updateSingleAssets (asset) {
//     const res = await this.query('Balance', () => ({ account: this.accountIdHex, id: asset.id }), CONTRACT_ASSETS)
//     asset.balance = res?.Balance?.balance || "0"
//   },
//   updateAssets () {
//     return Promise.all(this.assets.map(i => this.updateSingleAssets(i)))
//   },
//   async fullUpdate () {
//     await this.updateAssetMetadata()
//     await this.updateMainAsset()
//     await this.updateAssets()
//   }
// })

// export default WalletRuntimeStore
// export const createWalletRuntimeStore = () => WalletRuntimeStore
