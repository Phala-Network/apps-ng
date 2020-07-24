import { autorun, reaction, toJS } from 'mobx'
import React, { useEffect, useState } from 'react'
import { useStore } from '@/store'
import { createWalletStore } from '../utils/WalletStore'
import * as Crypto from '@phala/runtime/crypto'
import PRuntime, { measure, encryptObj } from '@phala/runtime'

const WalletStoreInjector = ({ children }) => {
  const appStore = useStore()
  const [shouldRenderContent, setShouldRenderContent] = useState(false)

  useEffect(() => {
    if (!appStore) {
      return
    }

    clearInterval(appStore.walletRuntime?.intervalRef || 0)

    appStore.walletRuntime = {
      ecdhChannel: null,
      ecdhShouldJoin: false,
      keypair: null,
      latency: 0,
      intervalRef: 0,
      info: null,
      error: false,
      pApi: null
    }

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
}

const WalletLoader = ({ children }) => {
  const { wallet, walletRuntime } = useStore()

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

  useEffect(
    () =>
      reaction(
        () => walletRuntime.pApi,
        () => {
          clearInterval(walletRuntime.intervalRef)
          if (!walletRuntime.pApi) {
            return
          }
          walletRuntime.intervalRef = setInterval(() => {
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
                walletRuntime.latency = (l => l ? l * 0.8 + dt * 0.2 : dt)(walletRuntime.latency)
              })
          }, 1500)
        },
        { fireImmediately: true }),
    []
  )

  return children
}

export default ({ children }) => <WalletStoreInjector>
  <WalletLoader>
    {children}
  </WalletLoader>
</WalletStoreInjector>
