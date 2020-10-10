import { autorun, observable, reaction, toJS } from 'mobx'
import { observer } from 'mobx-react'
import React, { useEffect, useState } from 'react'
import { useStore } from '@/store'
import { createWalletStore } from '../utils/WalletStore'
import { createAppRuntimeStore } from '../utils/AppRuntimeStore'
import { measure } from '@phala/runtime'
import PageLoading from '@/components/PageLoading'

const StoreInjector = (({ children }) => {
  const appStore = useStore()
  const [shouldRenderContent, setShouldRenderContent] = useState(false)

  useEffect(() => {
    if (!appStore) {
      return
    }

    appStore.appRuntime = createAppRuntimeStore({
      appSettings: appStore.settings,
      appAccount: appStore.account
    })

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

const WalletInit = ({ children }) => {
  const appStore = useStore()
  const { wallet, appRuntime } = appStore

  React.useEffect(() => {
    appRuntime.initEcdhChannel()
  }, [])

  useEffect(
    () =>
      reaction(
        () => wallet.runtimeEndpointUrl,
        () => {
          appRuntime.resetNetwork()
      }),
    []
  )

  useEffect(
    () =>
      autorun(
        () => {
          if (!(appRuntime.ecdhShouldJoin && appRuntime.ecdhChannel && appRuntime.info?.ecdhPublicKey)) {
            return
          }
          appRuntime.joinEcdhChannel()
        }),
    []
  )

  useEffect(
    () =>
      autorun(
        () => {
          if (!(wallet.runtimeEndpointUrl && appRuntime.ecdhChannel)) {
            return
          }
          appRuntime.initPApi(wallet.runtimeEndpointUrl)
        }),
    []
  )

  return <>
    <WalletLifecycle />
    {children}
  </>
}

const WalletLifecycle = observer(() => {
  const { appRuntime } = useStore()

  useEffect(() => {
    if (!appRuntime?.pApi) { return }
    const doGetInfo = () => {
      measure((() =>
        appRuntime.pApi.getInfo()
          .then(i => {
            appRuntime.setInfo(i)
          })
          .catch(e => {
            appRuntime.setError(e)
            console.warn('Error getting /info', e)
          })
      ))
        .then(dt => {
          appRuntime.setLatency(dt)
        })
    }
    const interval = setInterval(doGetInfo, 5000)
    doGetInfo()
    return () => clearInterval(interval)
  }, [appRuntime?.pApi])
  return null
})

export default observer(({ children }) => {
  const { appRuntime } = useStore()

  return (
    <StoreInjector>
      <WalletInit>
        {appRuntime?.channelReady ? children : <PageLoading />}
      </WalletInit>
    </StoreInjector>
  )
})
