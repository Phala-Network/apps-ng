import { observer } from "mobx-react"
import { useStore } from "../../store"
import { Page, Card, Spacer } from "@zeit-ui/react"
import LockIcon from '@zeit-ui/react-icons/lock'

const _UnlockRequired = () => {
  return <Page style={{ minHeight: 'unset' }}>
    <Card shadow>
      <h2>
        <LockIcon size={27} />
        <Spacer inline x={0.8} />
        Wallet locked
      </h2>
      <p>Unlock the wallet to continue.</p>
    </Card>
  </Page>
}

const UnlockRequired = ({ children }) => {
  const { account } = useStore()
  const { locked } = account

  return locked ? <_UnlockRequired /> : children
}

export default observer(UnlockRequired)
