import { types, flow } from 'mobx-state-tree'

export const CONTRACT_HELLOWORLD = 5;

export const createHelloWorldAppStore = (defaultValue = {}, options = {}) => {
  const HelloWorldAppStore = types
    .model('HelloWorldAppStore', {
      counter: types.maybeNull(types.number)
    })
    .actions(self => ({
      setCounter (num) {
        self.counter = num
      },
      async queryCounter (runtime) {
        return await runtime.query(CONTRACT_HELLOWORLD, 'GetCount')
      }
    }))

  return HelloWorldAppStore.create(defaultValue)
}

