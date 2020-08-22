import Container from '@/components/Container'
import { observer } from 'mobx-react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { useStore } from '@/store'

const HeaderSectionWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: flex-end;
  place-content: space-between;
  padding: 21px 36px 36px;
  ${({ theme: { isXS } }) => isXS && `
    flex-flow: column nowrap;
    align-items: flex-start;
    place-content: space-between;
  `}
`

const Header = styled.h2`
  font-weight: 600;
  font-size: 42px;
  line-height: 50px;
  font-feature-settings: 'ss01' on, 'ss05' on;
  margin: 0;
`

const AccountLine = styled.p`
  font-size: 15px;
  line-height: 18px;
  font-weight: normal;
  letter-spacing: 0.05em;
  font-feature-settings: 'ss01' on, 'ss05' on;
  color: #9B9B9B;
  margin: 0 0 6px;
  max-width: 100%;
  word-break: break-all;
`

const HeaderSection = () => {
  const { account } = useStore()
  const { t } = useTranslation()

  return <Container>
    <HeaderSectionWrapper>
      <Header>{t('Wallet')}</Header>
      <AccountLine>{account.address}</AccountLine>
    </HeaderSectionWrapper>
  </Container>
}

export default observer(HeaderSection)
