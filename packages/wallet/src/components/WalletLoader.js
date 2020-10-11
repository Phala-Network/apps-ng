import { reaction } from 'mobx'
import { observer } from 'mobx-react'
import React, { useEffect, useState } from 'react'
import { useStore } from '@/store'
import { createWalletStore } from '../utils/WalletStore'

const StoreInjector = (({ children }) => {
  const appStore = useStore()
  const [shouldRenderContent, setShouldRenderContent] = useState(false)

  useEffect(() => {
    if (!appStore || !appStore.appRuntime) {
      return
    }
    if (typeof appStore.wallet !== 'undefined') {
      return
    }
    appStore.wallet = createWalletStore({
      appSettings: appStore.settings,
      appAccount: appStore.account,
      appRuntime: appStore.appRuntime
    })
  }, [appStore])

  useEffect(
    () =>
      reaction(
        () => appStore.wallet,
        () => {
          if (appStore.wallet && !shouldRenderContent) {
            setShouldRenderContent(true)
          }
        },
        { fireImmediately: true }),
    []
  )

  return shouldRenderContent ? children : null
})

export default observer(({ children }) => {
  const { appRuntime } = useStore()

  return (
    <StoreInjector>
      {appRuntime?.channelReady && children}
    </StoreInjector>
  )
})
