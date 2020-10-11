import { autorun, observable, reaction, toJS } from 'mobx'
import { observer } from 'mobx-react'
import React, { useEffect, useState } from 'react'
import { useStore } from '@/store'
import { createAppRuntimeStore } from '@/store/runtime'
import { measure } from '@phala/runtime'
import PageLoading from '@/components/PageLoading'

const StoreInjector = (({ children }) => {
  const appStore = useStore()
  const [shouldRenderContent, setShouldRenderContent] = useState(false)

  useEffect(() => {
    if (!appStore) {
      return
    }
    if (typeof appStore.appRuntime !== 'undefined') {
      return
    }
    appStore.appRuntime = createAppRuntimeStore({
      appSettings: appStore.settings,
      appAccount: appStore.account
    })
    window.__store = appStore
  }, [appStore])

  useEffect(
    () =>
      reaction(
        () => appStore.appRuntime,
        () => {
          if (appStore.appRuntime && !shouldRenderContent) {
            setShouldRenderContent(true)
          }
        },
        { fireImmediately: true }),
    []
  )

  return shouldRenderContent ? children : null
})

const RuntimeInit = ({ children }) => {
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
}

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

  return (
    <StoreInjector>
      <RuntimeInit>
        {appRuntime?.channelReady ? children : <PageLoading />}
      </RuntimeInit>
    </StoreInjector>
  )
})
