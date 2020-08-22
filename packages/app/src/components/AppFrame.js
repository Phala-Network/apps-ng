import { useRouter } from 'next/router'
import React from 'react'
import styled from "styled-components"
import { RouteLink, MENU_ROUTES } from '@/utils/route'
import * as constants from '@/utils/style/constants'
import Container from '@/components/NavContainer'
import PhalaLogo from '@/components/PhalaLogo'
import {
  StopCircle as StopCircleIcon,
  // FileFunction as FileFunctionIcon,
  Settings as SettingsIcon,
  Users as UsersIcon,
  Sidebar as SidebarIcon
} from '@zeit-ui/react-icons'

import { Breadcrumbs } from '@zeit-ui/react'

import Status from './Status'

import CurrentInfoButton from './accounts/CurrentInfoButton'
import { useTranslation } from 'react-i18next'

const AppFrameWrapper = styled.div`
  padding: calc(${constants.NAV_HEIGHT}px + ${constants.CONTAINER_PADDING}px) 0 ${constants.CONTAINER_PADDING}px;
`

const NavBarWrapper = styled.nav`
  width: 100%;
  height: 72px;
  background: rgba(0, 0, 0, 0.9);
  box-shadow: 0 1px 0 rgba(255, 255, 255, .21);
  backdrop-filter: saturate(180%) blur(5px);
  position: fixed;
  left: 0;
  top: 0;
  display: flex;
  place-content: flex-start;
  align-items: flex-end;
  padding: 0 0 17px 0;
  z-index: 100;
  overflow-x: auto;
  box-sizing: border-box;
`

export const NavBarButtonWrapper = styled.div`
  display: flex;
  box-shadow: 0 0 0 1.5px ${props => props.active ? '#FFFFFF' : 'transparent'} inset;
  box-sizing: border-box;
  border-radius: 6px;
  flex-direction: row;
  align-items: flex-end;
  place-content: center;
  padding: 0 15px 7px 12px;
  transition: box-shadow .2s;
  cursor: default;
  z-index: 100;
  
  &:hover, &:active {
    box-shadow: 0 0 0 1.5px #FFFFFF inset;
  }
`

export const NavBarButtonLabel = styled.p`
  font-size: 17px;
  line-height: 20px;
  margin: 0 0 0 12px;
`

const FillFlex = styled.div`
  flex: 1;
`

const NavLogoSpacer = styled.p`
  width: 54px;
`

const NavItemSpacer = styled.p`
  width: 21px;
`

const NavBar = () => {
  const { t } = useTranslation()
  return <NavBarWrapper>
    <Container>
      <PhalaLogo onClick={() => window.open('https://phala.network/', '_blank')} />
      <NavLogoSpacer />
      <NavBarButton href="WALLET" name={t('Wallet')} icon={StopCircleIcon} />
      <NavItemSpacer />
      <NavBarButtonWrapper onClick={() => window.open('/legacy.html', '_blank')}>
        <SidebarIcon size={21} />
        <NavBarButtonLabel>Polkadot UI</NavBarButtonLabel>
      </NavBarButtonWrapper>
      <FillFlex />
      <NavBarButton href="SETTINGS" name={t('Settings')} icon={SettingsIcon} />
      <NavItemSpacer />
      <CurrentInfoButton />
    </Container>
  </NavBarWrapper>
}


const NavBarButton = ({ href, icon, name }) => {
  const router = useRouter()
  const Icon = icon

  return <RouteLink href={href} >
    <NavBarButtonWrapper active={MENU_ROUTES[href] === `/${router?.query.slug?.[0]}`}>
      <Icon size={21} />
      <NavBarButtonLabel>{name}</NavBarButtonLabel>
    </NavBarButtonWrapper>
  </RouteLink>
}

const _Breadcrumbs = styled(Breadcrumbs)`
  margin: 6px auto 12px !important;
  width: 100%;
  place-content: center;
`

const AppFrame = ({ children }) => {
  return <AppFrameWrapper>
    <NavBar />
    {children}
    <_Breadcrumbs separator="" size="small">
      <Breadcrumbs.Item> </Breadcrumbs.Item>
      <Breadcrumbs.Item href="https://github.com/Phala-Network" target="_blank">Github</Breadcrumbs.Item>
      <Breadcrumbs.Item href="https://forum.phala.network/" target="_blank">Forum</Breadcrumbs.Item>
      <Breadcrumbs.Item href="https://t.me/phalanetwork" target="_blank">Telegram</Breadcrumbs.Item>
      <Breadcrumbs.Item href="https://discord.gg/FUtZzYH" target="_blank">Discord</Breadcrumbs.Item>
      <Breadcrumbs.Item href="https://twitter.com/PhalaNetwork" target="_blank">Twitter</Breadcrumbs.Item>
      <Breadcrumbs.Item> </Breadcrumbs.Item>
    </_Breadcrumbs>
  </AppFrameWrapper>
}

export default AppFrame
