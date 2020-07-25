import { types } from 'mobx-state-tree'
import { createPersistStore } from '@/store/store'

export const WalletStore = types
  .model('WalletStore', {
    runtimeEndpointUrl: types.optional(types.string, 'https://dp.phala.network/tee-api/'),
    accountId: types.optional(types.string, ''),
    showInvalidAssets: types.optional(types.boolean, true)
  })
  .views(self => ({}))
  .actions(self => ({
    setAccount (accountId) {
      if (!accountId?.length) {
        return
      }
      self.accountId = accountId
    },
    unsetAccount () {
      self.accountId = ''
    },
    toggleShowInvalidAssets () {
      self.showInvalidAssets = !self.showInvalidAssets
    }
  }))

export const createWalletStore = () => createPersistStore('wallet', WalletStore, {}, {})

export default WalletStore
