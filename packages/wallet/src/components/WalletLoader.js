import { autorun, observable, reaction, toJS } from 'mobx'
import { observer } from 'mobx-react'
import React, { useEffect, useState } from 'react'
import { useStore } from '@/store'
import { createWalletStore } from '../utils/WalletStore'
import { createWalletRuntimeStore } from '../utils/WalletRuntimeStore'
import { measure } from '@phala/runtime'
import PageLoading from '@/components/PageLoading'

const StoreInjector = (({ children }) => {
  const appStore = useStore()
  const [shouldRenderContent, setShouldRenderContent] = useState(false)

  useEffect(() => {
    if (!appStore) {
      return
    }

    appStore.walletRuntime = createWalletRuntimeStore({
      appSettings: appStore.settings,
      appAccount: appStore.account
    })

    if (typeof appStore.wallet !== 'undefined') {
      return
    }
    appStore.wallet = createWalletStore({
      appSettings: appStore.settings,
      appAccount: appStore.account
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
  const { wallet, walletRuntime } = appStore

  React.useEffect(() => {
    walletRuntime.initEcdhChannel()
  }, [])

  useEffect(
    () =>
      reaction(
        () => wallet.runtimeEndpointUrl,
        () => {
          walletRuntime.resetNetwork()
      }),
    []
  )

  useEffect(
    () =>
      autorun(
        () => {
          if (!(walletRuntime.ecdhShouldJoin && walletRuntime.ecdhChannel && walletRuntime.info?.ecdhPublicKey)) {
            return
          }
          walletRuntime.joinEcdhChannel()
        }),
    []
  )

  useEffect(
    () =>
      autorun(
        () => {
          if (!(wallet.runtimeEndpointUrl && walletRuntime.ecdhChannel)) {
            return
          }
          walletRuntime.initPApi(wallet.runtimeEndpointUrl)
        }),
    []
  )

  return <>
    <WalletLifecycle />
    {children}
  </>
}

const WalletLifecycle = observer(() => {
  const { walletRuntime } = useStore()

  useEffect(() => {
    if (!walletRuntime?.pApi) { return }
    const doGetInfo = () => {
      measure((() =>
        walletRuntime.pApi.getInfo()
          .then(i => {
            walletRuntime.setInfo(i)
          })
          .catch(e => {
            walletRuntime.setError(e)
            console.warn('Error getting /info', e)
          })
      ))
        .then(dt => {
          walletRuntime.setLatency(dt)
        })
    }
    const interval = setInterval(doGetInfo, 5000)
    doGetInfo()
    return () => clearInterval(interval)
  }, [walletRuntime?.pApi])
  return null
})

export default observer(({ children }) => {
  const { walletRuntime } = useStore()

  return (
    <StoreInjector>
      <WalletInit>
        {walletRuntime?.channelReady ? children : <PageLoading />}
      </WalletInit>
    </StoreInjector>
  )
})
