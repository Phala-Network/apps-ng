import { useRouter } from "next/router"
import { findRouteComponent } from '@/utils/route'
import NotFound from '@/components/NotFound'
import { useMemo } from "react"
import Head from 'next/head'
import { StoreProvider, useStore } from '@/store'
import { observer } from 'mobx-react'

import '@polkadot/apps/initSettings'

import { Api } from "@polkadot/react-api"
import Queue from "@polkadot/react-components/Status/Queue"
import { BlockAuthors, Events } from "@polkadot/react-query"
import Signer from '@polkadot/react-signer'

import AppFrame from './AppFrame'

const AppWrapper = observer(({ children }) => {
  const { settings } = useStore()

  return <Queue>
    <Api url={settings.apiUrl}>
      <BlockAuthors>
        <Events>
          <Signer>
            {children}
          </Signer>
        </Events>
      </BlockAuthors>
    </Api>
  </Queue>
})

function InjectHead () {
  return <Head>
    <title>Phala Apps</title>
  </Head>
}

const AppLoader = props => {
  const router = useRouter()

  const RenderedComponent = useMemo(() => {
    if (!router?.query?.slug) {
      return NotFound
    }
    return findRouteComponent(router.query.slug) || NotFound
  }, [router?.query?.slug])

  return (
    <StoreProvider>
      <AppWrapper>
        <AppFrame>
          <InjectHead />
          <RenderedComponent {...props} />
        </AppFrame>
      </AppWrapper>
    </StoreProvider>
  )
}

export default AppLoader