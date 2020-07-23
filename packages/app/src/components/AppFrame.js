import styled from "styled-components"
import { Menu } from "semantic-ui-react"

const AppFrameWrapper = styled.div`
  display: flex;
  width: 100%;
  min-height: 100vh;
  padding: 0;
  margin: 0;
  flex-flow: column nowrap;
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

const AppFrameContent = styled.div`
  flex: 1;
  height: 0;
  box-sizing: border-box;
  background-color: white;
  margin: 6px 18px 21px;
  border-radius: 12px;
  padding: 15px 21px;
`

const AppFrame = ({ children }) => {
  return (
    <AppFrameWrapper>
      <AppFrameMenu>
        <Menu.Item header>
          Phala Apps
        </Menu.Item>
        <Menu.Item as="a">Wallet</Menu.Item>
        <Menu.Item as="a" position='right'>Settings</Menu.Item>
      </AppFrameMenu>
      <AppFrameContent>
        {children}
      </AppFrameContent>
    </AppFrameWrapper>
  )
}

export default AppFrame
