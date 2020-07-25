import { useRouter } from 'next/router'
import React from 'react'
import styled from "styled-components"
import { Menu, Icon } from "semantic-ui-react"
import { RouteLink, MENU_ROUTES } from '@/utils/route'
import Status from './Status'

const AppFrameWrapper = styled.div`
  display: flex;
  width: 100%;
  min-height: 100vh;
  padding: 0;
  margin: 0;
  flex-direction: column;
  background: #e8e8e8;
`

const AppFrameMenu = styled(Menu).attrs({
  secondary: true,
  size: 'large'
})`
  box-sizing: border-box;
  background-color: white !important;
  margin: 15px 18px !important;
  border-radius: 12px !important;
  padding: 9px 6px;

`

const AppFrameMenuWrapper = styled.div`
  position: fixed;
  z-index: 10;
  width: 100%;
  background: #e8e8e8;
`

const AppFrameContent = styled.div`
  height: 0;
  flex: 1;
  box-sizing: border-box;
  background-color: white;
  margin: 96px 18px 21px;
  border-radius: 12px;
  padding: 15px 21px;
`

const AppFrameRouteLink = ({ href, icon, name, position = undefined }) => {
  const router = useRouter()
  return <RouteLink href={href} >
    <Menu.Item position={position} active={MENU_ROUTES[href] === `/${router?.query.slug?.[0]}`} as="a">
      <Icon name={icon} />{name}
    </Menu.Item>
  </RouteLink>
}

const AppFrame = ({ children }) => {
  return (
    <AppFrameWrapper>
      <AppFrameMenuWrapper>
        <AppFrameMenu>
          <Menu.Item header>
            Phala Apps
          </Menu.Item>
          <AppFrameRouteLink href="WALLET" name="Wallet" icon="bullseye" />
          <AppFrameRouteLink href="ACCOUNTS" name="Accounts" icon="id card outline" />
          <AppFrameRouteLink href="SETTINGS" name="Settings" icon="cog" position='right' />
        </AppFrameMenu>
      </AppFrameMenuWrapper>
      <AppFrameContent>
        <Status />
        {children}
      </AppFrameContent>
    </AppFrameWrapper>
  )
}

export default AppFrame
