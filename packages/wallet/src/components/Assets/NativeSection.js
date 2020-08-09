import { observer } from "mobx-react"
import styled from "styled-components"
import Container from "@/components/Container"
import { Balance as BalanceQuery } from '@polkadot/react-query'
import { useStore } from "@/store"
import Button from './Button'

import {
  Link2 as LinkIcon,
  InfoFill as InfoFillIcon,
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
  Send as SendIcon,
  MinusSquare as MinusSquareIcon
} from '@zeit-ui/react-icons'


const LeftDecorationWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  place-content: flex-start;
  margin: 0 36px 0 0;
`

const LeftDecorationTop = styled.div`
  width: 2px;
  height: 24px;
  background: #040035;
`
const LeftDecorationBottom = styled.div`
  width: 2px;
  flex: 1;
  background: #040035;
`
const LeftDecorationIcon = styled.div`
  width: 24px;
  height: 24px;
  margin: 3px 0;
`

const LeftDecoration = () => {
  return <LeftDecorationWrapper>
    <LeftDecorationTop />
    <LeftDecorationIcon>
      <LinkIcon color="#040035" size="24" />
    </LeftDecorationIcon>
    <LeftDecorationBottom />
  </LeftDecorationWrapper>
}

const InfoWrapper = styled.div`
  color: #040035;
  --zeit-icons-background: #73FF9A;
  padding: 24px 0 21px;
  flex: 1;
`
const InfoHead = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: flex-end;
  margin: 0 0 21px;
`
const InfoHeadMain = styled.h4`
  font-weight: 600;
  font-size: 27px;
  line-height: 32px;
  margin: 0 21px 0 0;
`
const InfoHeadDesc = styled.p`
  font-weight: normal;
  font-size: 16px;
  line-height: 19px;
  color: #000000;
  margin: 0 0 4px;

  & > svg {
    vertical-align: text-top;
    margin-right: 6px;
  }
`
const Balance = styled.div`
  display: flex;
  flex-direction: column;
`
const BalanceHead = styled.h5`
  color: #040035;
  opacity: 0.64;
  margin: 0;
`
const BalanceValue = styled(BalanceQuery)`
  font-weight: 600;
  font-size: 36px;
  line-height: 43px;
  color: #040035;
  text-indent: -1px;
  margin: 0;

  & .ui--FormatBalance-value > .ui--FormatBalance-postfix {
    opacity: 1;
    font-weight: inherit;
  }
`


const Info = observer(() => {
  const { account } = useStore()

  return <InfoWrapper>
    <InfoHead>
      <InfoHeadMain>
        PHA
      </InfoHeadMain>
      <InfoHeadDesc>
        <InfoFillIcon size={18} />
        These assets are visible on the chain.
      </InfoHeadDesc>
    </InfoHead>
    <Balance>
      <BalanceHead>balance</BalanceHead>
      <BalanceValue params={account.address} />
    </Balance>
  </InfoWrapper>
})

const NativeSectionWrapper = styled.div`
  width: 100%;
  background: #73FF9A;
  margin: 0 0 42px;
`

const NativeSectionInnerWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  padding: 0 36px 0 24px;
`

const NativeSection = () => {
  return <NativeSectionWrapper>
    <Container>
      <NativeSectionInnerWrapper>
        <LeftDecoration />
        <Info />
        <Button.Group>
          <Button type="primaryDark" icon={EyeOffIcon} name="Convert to Secret PHA" />
          <Button type="secondaryDark" icon={SendIcon} name="Transfer" />
          {/* <Button type="primaryLight" icon={EyeIcon} name="Convert to PHA" />
          <Button type="secondaryLight" icon={SendIcon} name="Secret Transfer" />
          <Button type="remove" icon={MinusSquareIcon} name="Destroy Token" /> */}
        </Button.Group>
      </NativeSectionInnerWrapper>
    </Container>
  </NativeSectionWrapper>
}

export default observer(NativeSection)
