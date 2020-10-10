import { types, flow } from 'mobx-state-tree'
import { createPersistStore } from '@/store/store'

import { CONTRACT_BALANCE, CONTRACT_ASSETS } from '@phala/wallet/utils/constants'

const anyType = types.custom({
  isTargetType: () => true,
  getValidationMessage: () => '',
  fromSnapshot: val => val,
  toSnapshot: val => val
})

export const createWalletStore = (defaultValue = {}, options = {}) => {
  const WalletStore = types
    .model('WalletStore', {
      assets: types.array(anyType),
      mainAsset: types.maybeNull(anyType),
      showInvalidAssets: types.optional(types.boolean, true),
      error: types.maybeNull(anyType)
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
      get appRuntime () {
        return defaultValue.appRuntime
      },
      get accountId () {
        return self.appAccount.address
      },
      get assetSymbols () {
        const ret = self.assets.map(i => i.metadata.symbol)
        ret.push('PHA')
        return ret
      }
    }))
    .actions(self => ({
      fullUpdate: flow(function* () {
        yield self.updateMainAsset()
        yield self.updateAssets()
      }),
      updateMainAsset: flow(function* () {
        const res = yield self.appRuntime.query(
          CONTRACT_BALANCE,
          'FreeBalance',
          () => ({ account: self.appRuntime.accountIdHex })
        )
        self.mainAsset = {
          ...self.mainAsset, 
          balance: res?.FreeBalance?.balance || '0'
        }
      }),
      updateAssets: flow(function* () {
        const res = yield self.appRuntime.query(
          CONTRACT_ASSETS,
          'ListAssets',
          () => ({ availableOnly: false })
        )
        self.assets = (res?.ListAssets?.assets || []).reverse()
      }),
      toggleShowInvalidAssets () {
        self.showInvalidAssets = !self.showInvalidAssets
      },
      setShowInvalidAssets (e) {
        const value = !e.target.checked
        self.showInvalidAssets = value
      }
    }))

  return createPersistStore('wallet', WalletStore, defaultValue)
}

