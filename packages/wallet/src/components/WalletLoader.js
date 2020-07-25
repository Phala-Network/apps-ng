import { autorun, observable, reaction, toJS } from 'mobx'
import { observer } from 'mobx-react'
import React, { useEffect, useState } from 'react'
import { useStore } from '@/store'
import { createWalletStore } from '../utils/WalletStore'
import { createWalletRuntimeStore } from '../utils/WalletRuntimeStore'
import * as Crypto from '@phala/runtime/crypto'
import PRuntime, { measure, encryptObj } from '@phala/runtime'

const StoreInjector = (({ children }) => {
  const appStore = useStore()
  const [shouldRenderContent, setShouldRenderContent] = useState(false)

  useEffect(() => {
    if (!appStore) {
      return
    }

    appStore.walletRuntime = createWalletRuntimeStore()

    if (typeof appStore.wallet !== 'undefined') {
      return
    }
    appStore.wallet = createWalletStore()
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
    Crypto.newChannel()
      .then(ch => {
        walletRuntime.ecdhChannel = ch
        walletRuntime.ecdhShouldJoin = true
      })
  }, [])

  useEffect(
    () =>
      reaction(
        () => wallet.runtimeEndpointUrl,
        () => {
          walletRuntime.error = false
          walletRuntime.latency = 0
          walletRuntime.info = null
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
          Crypto.joinChannel(walletRuntime.ecdhChannel, walletRuntime.info.ecdhPublicKey)
            .then(ch => {
              walletRuntime.ecdhShouldJoin = false
              walletRuntime.ecdhChannel = ch
              console.log('joined channel:', toJS(ch))
            })
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
          walletRuntime.pApi = new PRuntime({
            endpoint: wallet.runtimeEndpointUrl,
            channel: walletRuntime.ecdhChannel,
            keypair: walletRuntime.keypair
          })
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
    const interval = setInterval(() => {
      measure((() =>
        walletRuntime.pApi.getInfo()
          .then(i => {
            walletRuntime.info = i
          })
          .catch(e => {
            walletRuntime.error = true
            console.warn('Error getting /info', e)
          })
      ))
        .then(dt => {
          walletRuntime.latency = parseInt((l => l ? l * 0.8 + dt * 0.2 : dt)(walletRuntime.latency))
        })
    }, 1500)
    return () => clearInterval(interval)
  }, [walletRuntime?.pApi])
  return null
})

export default ({ children }) => (
  <StoreInjector>
    <WalletInit>
      {children}
    </WalletInit>
  </StoreInjector>
)