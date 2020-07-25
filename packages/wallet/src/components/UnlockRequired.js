import { useStore } from '@/store'
import Button from '@polkadot/react-components/Button'
import { toJS } from 'mobx'
import React, { useCallback, useEffect, useState } from 'react'
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
    if (!accountId?.length) {
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
      setUnlocked(true)
    }
  }, [keypair?.isLocked])

  return unlocked
    ? children
    : <>
      <AccountSelector onChange={onAccountIdChange}/>
      {keypair &&
      <div className='ui--row'>
        <div className='large'>
          <Button.Group isCentered className='button-group'>
            <Button
              isPrimary
              onClick={onRequestUnlock}
              label={'Unlock account'}
              icon='unlock'
            />
          </Button.Group>
        </div>
      </div>
      }
      {unlockModal && (
        <Unlock
          onClose={() => setUnlockModal(false)}
          onUnlock={() => walletRuntime.setAccount(accountId)
            .then(() => setUnlocked(true))
          }
          pair={keypair}
        />
      )}
    </>

}

export default observer(UnlockRequired)
