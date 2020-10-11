import { autorun, observable, reaction, toJS } from 'mobx'
import { observer } from 'mobx-react'
import React, { useEffect, useState } from 'react'
import { useStore } from '@/store'
import { createAppRuntimeStore } from '@/store/runtime'
import { measure } from '@phala/runtime'
import PageLoading from '@/components/PageLoading'

const StoreInjector = observer(({ children }) => {
  const [shouldInitRuntime, setShouldInitRuntime] = useState(false)

  const appStore = useStore()
  window.__store = appStore

  const keypair = appStore.account?.keypair
  const locked = appStore.account?.locked
  const address = appStore.account?.address

  useEffect(() => {
    if (locked) {
      setShouldInitRuntime(false)
      appStore.appRuntime = undefined
    }
  }, [address, locked])

  useEffect(() => {
    if (!appStore) {
      return
    }
    if (!(!locked && address)) {
      return
    }
    if (shouldInitRuntime) {
      return
    }

    appStore.appRuntime = createAppRuntimeStore({
      appSettings: appStore.settings,
      appAccount: appStore.account
    })
  }, [address, locked, appStore, shouldInitRuntime])

  useEffect(
    () => {
      if (!appStore?.appRuntime) {
        return
      }

      reaction(
        () => appStore.appRuntime,
        () => {
          if (appStore.appRuntime && !shouldInitRuntime) {
            setShouldInitRuntime(true)
          }
        },
        { fireImmediately: true })
    },
    [appStore?.appRuntime]
  )

  return shouldInitRuntime ? <RuntimeInit /> : null
})

const RuntimeInit = observer(({ children }) => {
  const appStore = useStore()
  const { settings, appRuntime } = appStore

  React.useEffect(() => {
    appRuntime.initEcdhChannel()
  }, [])

  useEffect(
    () =>
      reaction(
        () => settings.phalaTeeApiUrl,
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
          if (!(settings.phalaTeeApiUrl && appRuntime.ecdhChannel)) {
            return
          }
          appRuntime.initPApi(settings.phalaTeeApiUrl)
        }),
    []
  )

  return <>
    <RuntimeLifecycle />
    {children}
  </>
})

const RuntimeLifecycle = observer(() => {
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

  return <StoreInjector />
})
