import { types } from 'mobx-state-tree'
import { createPersistStore } from '@/store/store'

export const createWalletStore = (defaultValue = {}, options = {}) => {
  const WalletStore = types
    .model('WalletStore', {
      showInvalidAssets: types.optional(types.boolean, true)
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
      }
    }))
    .actions(self => ({
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

