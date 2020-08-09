import Container from '@/components/Container'
import styled from 'styled-components'
import { Checkbox } from '@zeit-ui/react'
import { InfoFill as InfoFillIcon } from '@zeit-ui/react-icons'
import { observer } from 'mobx-react'
import { useStore } from '@/store'

const HeadWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: flex-end;
  padding: 0 36px 30px;
`

const HeadLine = styled.h3`
  font-weight: 600;
  font-size: 30px;
  line-height: 36px;
  font-feature-settings: 'ss01' on, 'ss05' on;
  margin: 0 24px 0 0;
`

const HeadDesc = styled.p`
  font-size: 16px;
  line-height: 19px;
  color: #F2F2F2;
  margin: 0 0 5px;

  & > svg {
    vertical-align: text-top;
    margin-right: 6px;
  }
`

const CheckboxWrapper = styled.div`
  flex: 1;
  & label {
    display: block !important;
    font-size: 16px !important;
    line-height: 19px !important;
    color: #F2F2F2 !important;
    margin: 0 0 5px !important;
    height: unset !important;
  }

  & label .text {
    font-size: 16px !important;
  }
`

const Head = observer(() => {
  const { wallet } = useStore()
  return (
    <Container>
      <HeadWrapper>
        <HeadLine>Secret assets</HeadLine>
        <CheckboxWrapper>
          <Checkbox
            checked={!wallet.showInvalidAssets}
            onChange={wallet.setShowInvalidAssets}
          >Hide invalid assets</Checkbox>
        </CheckboxWrapper>

        <HeadDesc>
          <InfoFillIcon size={18} />
          These assets are invisible on the chain.
        </HeadDesc>
      </HeadWrapper>
    </Container>
  )
})

export default () => {
  return <>
    <Head />
  </>
}
