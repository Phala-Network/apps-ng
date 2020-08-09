import { types, flow } from 'mobx-state-tree'
import { cryptoWaitReady } from '@polkadot/util-crypto'
import keyring from '@polkadot/ui-keyring'
import { createPersistStore } from './store'

export const AccountStore = types
  .model('AccountStore', {
    address: types.maybe(types.string),
    locked: types.optional(types.boolean, true),
    keypair: types.maybe(types.custom({
      isTargetType: value => !!value?.address,
      getValidationMessage: () => '',
      fromSnapshot: val => val,
      toSnapshot: val => val
    }))
  })
  .views(self => ({}))
  .actions(self => ({
    setAccount (address) {
      self.locked = true
      self.address = address
    },
    setKeypair: flow(function* (address) {
      if (!address) {
        self.keypair = undefined
        return 
      }
      yield cryptoWaitReady()
      try {
        self.keypair = keyring.getPair(address || '')
      } catch (error) {
        console.warn(address, error)
      }
    }),
    lock () {
      self.locked = true
      self.keypair.lock()
    },
    unlock () {
      self.locked = false
    }
  }))

export const AccountStorePersistOptions = {
  whitelist: ['address']
}

export default () => {
  const store = createPersistStore('account', AccountStore, {}, AccountStorePersistOptions)

  // do reactions here

  return store
}
