import { observer } from "mobx-react"
import { useStore } from "../../store"
import { Page, Card, Spacer } from "@zeit-ui/react"
import { Lock as LockIcon } from '@zeit-ui/react-icons'
import { useTranslation } from 'react-i18next'

const _UnlockRequired = () => {
  const { t } = useTranslation()

  return <Page style={{ minHeight: 'unset' }}>
    <Card shadow>
      <h2>
        <LockIcon size={27} />
        <Spacer inline x={0.8} />
        {t('Wallet locked')}
      </h2>
      <p>{t('Unlock the wallet to continue.')}</p>
    </Card>
  </Page>
}

const UnlockRequired = ({ children }) => {
  const { account } = useStore()
  const { locked } = account

  return locked ? <_UnlockRequired /> : children
}

export default observer(UnlockRequired)
