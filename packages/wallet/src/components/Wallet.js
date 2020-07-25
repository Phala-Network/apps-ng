// import { useStore } from '@/store'
import { LAYOUT_ROUTE } from '@/utils/route'
import NormalPageWrapper from '@/components/NormalPageWrapper'
import { Menu, Container } from 'semantic-ui-react'
import { observer } from 'mobx-react'
import Router, { useRouter } from 'next/router'
import React, { useMemo } from 'react'
import styled from 'styled-components'
import Balance from './Balances'
import Assets from './Assets'
import UnlockRequired from './UnlockRequired'

const DEFAULT_PAGE = 'balances'

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
      <TabItem currentPage={currentPage} page={PAGES.balances} />
      <TabItem currentPage={currentPage} page={PAGES.assets} />
    </Container>
    {/*<Menu.Menu position='right'>*/}
    {/*  <Menu.Item*/}
    {/*    name='logout'*/}
    {/*    active={activeItem === 'logout'}*/}
    {/*    onClick={this.handleItemClick}*/}
    {/*  />*/}
    {/*</Menu.Menu>*/}
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

const Wallet = () => {
  const router = useRouter()
  const page = PAGES[router.query.slug?.[1] || DEFAULT_PAGE] || PAGES.notFound

  const RenderedComponent = useMemo(() => page.component, [page])
  // todo: unlockRequired
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
