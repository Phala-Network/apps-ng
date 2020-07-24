import { types } from 'mobx-state-tree'
import { createPersistStore } from '@/store/store'

export const WalletStore = types
  .model('WalletStore', {
    runtimeEndpointUrl: types.optional(types.string, 'https://dp.phala.network/tee-api/')
  })
  .views(self => ({}))
  .actions(self => ({}))

export const createWalletStore = () => createPersistStore('wallet', WalletStore, {}, {})

export default WalletStore
