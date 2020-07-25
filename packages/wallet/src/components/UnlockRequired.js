import { useStore } from '@/store'
import Button from '@polkadot/react-components/Button'
import { Card } from 'semantic-ui-react'
import { toJS } from 'mobx'
import React, { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import AccountSelector from './AccountSelector'
import { observer } from 'mobx-react'
import Unlock from '@polkadot/app-toolbox/Unlock'

function UnlockRequired ({ children }) {
  const store = useStore()
  const { wallet, walletRuntime } = store
  const { accountId } = wallet
  const { keypair } = walletRuntime

  const [unlockModal, setUnlockModal] = useState(false)
  const [unlocked, setUnlocked] = useState(false)

  useEffect(() => {
    keypair?.lock()
    setUnlocked(false)
    setUnlockModal(false)
    if (!accountId?.length) {
      walletRuntime.keypair = null
      return
    }
    walletRuntime.setAccount(accountId)
  }, [accountId])

  const onAccountIdChange = useCallback(newVal => {
    if (newVal === accountId) {
      return
    }
    wallet.setAccount(newVal)
  }, [accountId])

  const onRequestUnlock = useCallback(() => {
    if (keypair?.isLocked) {
      setUnlockModal(true)
    } else {
      walletRuntime.accountId = accountId
      setUnlocked(true)
    }
  }, [keypair?.isLocked, accountId])

  return unlocked
    ? children
    : <>
      <UnlockCard raised>
        <Card.Content extra>
          <UnlockCardTitle>unlock your wallet</UnlockCardTitle>
          <AccountSelector onChange={onAccountIdChange}/>
          {keypair &&
            <UnlockButtonWrapper>
              <Button.Group isCentered className='button-group'>
                <Button
                  isPrimary
                  onClick={onRequestUnlock}
                  label={'Unlock account'}
                  icon='unlock'
                />
              </Button.Group>
            </UnlockButtonWrapper>
          }
        </Card.Content>
      </UnlockCard>
      {unlockModal && (
        <Unlock
          onClose={() => setUnlockModal(false)}
          onUnlock={() => walletRuntime.setAccount(accountId)
            .then(() => {
              walletRuntime.accountId = accountId
              setUnlocked(true)
            })
          }
          pair={keypair}
        />
      )}
    </>
}

const UnlockCard = styled(Card)`
  width: fit-content !important;
  margin: 36px auto !important;
  box-shadow: 0 2px 4px 0 rgba(34,36,38,.12), 0 2px 10px 0 rgba(34,36,38,.15) !important;
`
const UnlockCardTitle = styled.h2`
  width: fit-content !important;
  margin: 12px auto 18px !important;
  text-align: center !important;
`
const UnlockButtonWrapper = styled.div`
  margin: 18px auto 12px;
  text-align: center;
`


export default observer(UnlockRequired)
