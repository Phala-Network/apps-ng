// import { useStore } from '@/store'
import { LAYOUT_ROUTE } from '@/utils/route'
import NormalPageWrapper from '@/components/NormalPageWrapper'
import { useStore } from '@/store'
import { toJS } from 'mobx'
import { Menu, Container } from 'semantic-ui-react'
import { observer } from 'mobx-react'
import Router, { useRouter } from 'next/router'
import React, { useCallback, useMemo } from 'react'
import styled from 'styled-components'
import Balance from './Balances'
import Assets from './Assets'
import UnlockRequired from './UnlockRequired'

const DEFAULT_PAGE = 'assets'

const PAGES = {
  balances: {
    name: 'Balances',
    key: Symbol('BALANCES_PAGE'),
    component: Balance,
    unlockRequired: true,
    slugName: 'balances'
  },
  assets: {
    name: 'Assets',
    key: Symbol('ASSETS_PAGE'),
    component: Assets,
    unlockRequired: true,
    slugName: 'assets'
  },
  notFound: {
    name: 'Not Found',
    key: Symbol('NOT_FOUND'),
    component: () => 'Not Found.',
    unlockRequired: false,
    slugName: 'notFound'
  }
}

const pushRoute = (page) => Router.push(LAYOUT_ROUTE, `/wallet/${page.slugName}`)

const Tab = ({ currentPage }) => {
  return <Menu pointing secondary>
    <Container>
      {/*<TabItem currentPage={currentPage} page={PAGES.balances} />*/}
      <TabItem currentPage={currentPage} page={PAGES.assets} />
      <TabLogoutItem />
    </Container>
  </Menu>
}

const TabItem = ({ currentPage, page, ...props }) => {
  return <Menu.Item
    name={page.name}
    active={currentPage.key === page.key}
    onClick={() => pushRoute(page)}
    {...props}
  />
}
const TabLogoutItem = observer(() => {
  const { wallet, walletRuntime } = useStore()

  const doLogout = useCallback(() => {
    walletRuntime.accountId = null
    wallet.unsetAccount()
  }, [wallet, walletRuntime])

  return walletRuntime.accountId === wallet.accountId
    ? <Menu.Item
      position='right'
      name='Lock Wallet'
      link
      icon='lock'
      onClick={doLogout}
    />
    : null
})

const Wallet = () => {
  const router = useRouter()
  const page = PAGES[router.query.slug?.[1] || DEFAULT_PAGE] || PAGES.notFound

  const RenderedComponent = useMemo(() => page.component, [page])

  return <WalletWrapper>
    <Tab currentPage={page} />
    <WalletContent>
      <NormalPageWrapper>
        {page.unlockRequired
          ? <UnlockRequired>
            <RenderedComponent />
          </UnlockRequired>
          : <RenderedComponent />}
      </NormalPageWrapper>
    </WalletContent>
  </WalletWrapper>
}

const WalletWrapper = styled.div`
  display: flex;
  box-sizing: border-box;
  flex-flow: column nowrap;
`

const WalletContent = styled.div`
  padding: 12px 12px;
`

export default Wallet
