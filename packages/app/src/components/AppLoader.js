import { useRouter } from "next/router"
import { Router } from "@/utils/i18n"
import { findRouteComponent } from '@/utils/route'
import { LAYOUT_ROUTE, DEFAULT_ROUTE } from '@/utils/route/utils'
import NotFound from '@/components/NotFound'
import { useState, useEffect, useMemo } from "react"
import Head from 'next/head'
import { StoreProvider, useStore } from '@/store'
import { observer } from 'mobx-react'

import '@/utils/initLegacySettings'

import { Api } from "@polkadot/react-api"
import Queue from "@polkadot/react-components/Status/Queue"
import { BlockAuthors, Events } from "@polkadot/react-query"
import Signer from '@phala/react-signer'

import AppFrame from './AppFrame'
import { defaultApiUrl } from '@/store/settings'

const AppWrapper = observer(({ children }) => {
  const { settings } = useStore()

  useEffect(() => {
    if (settings.apiUrl) { return }

    const timeout = setTimeout(() => {
      settings.applyValues({
        apiUrl: defaultApiUrl
      })
    }, 100)

    // todo: re-create keyring

    return () => clearTimeout(timeout)
  }, [settings.apiUrl])

  return <Queue>
    {!!settings.apiUrl && <Api url={settings.apiUrl}>
      <BlockAuthors>
        <Events>
          <Signer />
          {children}
        </Events>
      </BlockAuthors>
    </Api>}
  </Queue>
})

function InjectHead () {
  return <Head>
    <title>Phala Apps</title>
  </Head>
}

const AppLoader = props => {
  const router = useRouter()

  const slug = useMemo(() => {
    if (!router?.query?.slug?.length) {
      return undefined
    }
    return router.query.slug.slice(1)
  }, [router?.query?.slug])

  useEffect(() => {
    if (!slug?.length) {
      Router.replace(LAYOUT_ROUTE, DEFAULT_ROUTE)
    }
  }, [slug])

  const RenderedComponent = useMemo(() => {
    if (!slug?.length) {
      return null
    }

    return findRouteComponent(slug) || NotFound
  }, [slug])

  return (
    <StoreProvider>
      <AppWrapper>
        <AppFrame>
          <InjectHead />
          {RenderedComponent && <RenderedComponent {...props} />}
        </AppFrame>
      </AppWrapper>
    </StoreProvider>
  )
}

export default AppLoader