import React, { useEffect, useCallback, useState } from 'react'
import styled from 'styled-components'
import { useApi, useAccountInfo } from '@polkadot/react-hooks'
import useAccounts from '@polkadot/react-hooks/useAccounts'
import {
  NavBarButtonWrapper,
  NavBarButtonLabel
} from '../AppFrame'
import UnlockIcon from '@zeit-ui/react-icons/unlock'
import LockIcon from '@zeit-ui/react-icons/lock'
import {
  Modal,
  useModal,
  Loading,
  Select,
  Text,
  Tag,
  Spacer,
  useTheme,
  Input,
  useInput,
  useToasts
} from '@zeit-ui/react'
import { useStore } from '../../store'
import { observer } from 'mobx-react'
import { reaction } from 'mobx'
import KeyIcon from '@zeit-ui/react-icons/key'

const AccountSelectorItem = ({ address }) => {
  const accountInfo = useAccountInfo(address)
  const { name } = accountInfo

  if (!name) {
    return address
  }

  return <>
    <Tag type="lite">{name.toUpperCase()}</Tag>
    <Spacer inline x={.4} />
    {address}
  </>
}

const AccountSelector = observer((props) => {
  const { allAccounts, hasAccounts } = useAccounts()
  const { account } = useStore()
  const { address } = account

  if (!hasAccounts) {
    return <Text blockquote>
      You don't have any accounts.
    </Text>
  }

  return <>
    <Select
      width="100%"
      initialValue={address}
      placeholder="select account..."
      onChange={val => account.setAccount(val)}
      {...props}
    >
      {allAccounts.map((i, idx) => (
        <Select.Option
          key={`AccountSelector-${idx}`}
          value={i}>
            <AccountSelectorItem address={i} />
        </Select.Option>
      ))}
    </Select>
  </>
})

const LockedModal = observer(({ setVisible, bindings }) => {
  const { isMobile } = useTheme()

  const { account } = useStore()
  const { keypair } = account

  const {
    state: password,
    reset: resetPassword,
    bindings: passwordBindings
  } = useInput('')

  const [isBusy, setIsBusy] = useState(false)
  const [, setToast] = useToasts()

  const onUnlocked = useCallback(() => {
    setVisible(false)
    account.unlock()
    reset()
  }, [reset, account, setVisible])

  const doUnlock = useCallback((e) => {
    e?.preventDefault && e.preventDefault()
    if (isBusy) { return }
    if (!keypair) { return }

    if (!keypair.isLocked) {
      onUnlocked()
      return
    }

    setIsBusy(true)

    setTimeout(() => {
      try {
        keypair.decodePkcs8(password)
      } catch (e) {
        setIsBusy(false)
        setToast({
          type: 'error',
          text: e?.message || e || 'Failed to unlock.'
        })
      }

      onUnlocked()
    }, 0)
  }, [keypair, isBusy, password, onUnlocked])

  const reset = useCallback(() => {
    resetPassword()
    setIsBusy(false)
  }, [resetPassword, setIsBusy])

  const onClose = useCallback(() => {
    if (isBusy) { return }

    setVisible(false)
    reset()
  }, [isBusy, setVisible, reset])

  return (
    <Modal
      {...bindings}
      width={isMobile ? 'calc(100vw - 24px)' : '540px'}
      onClose={onClose}
    >
      <Modal.Title>Wallet locked</Modal.Title>
      <Modal.Subtitle>Select an account to continue.</Modal.Subtitle>
      <Modal.Content>
        <AccountSelector disabled={isBusy} />
        {(!!account.keypair && account.keypair.isLocked) && <>
          <Spacer y={.5} />
          <form onSubmit={doUnlock}>
            <Input.Password
              {...passwordBindings}
              disabled={isBusy}
              width="100%"
              icon={<KeyIcon />}
              type="submit"
            />
          </form>
        </>}
      </Modal.Content>
      <Modal.Action passive onClick={onClose}>Cancel</Modal.Action>
      <Modal.Action loading={isBusy} onClick={(keypair && !isBusy) ? doUnlock : undefined} disabled={!keypair}>Unlock</Modal.Action>
    </Modal>
  )
})

const UnlockedModal = observer(({ setVisible, bindings }) => {
  const { account } = useStore()

  const doLock = useCallback(() => {
    account.lock()
    setVisible(false)
  }, [account])

  return (
    <Modal {...bindings}>
      <Modal.Title>Wallet is unlocked</Modal.Title>
      <Modal.Subtitle>Do you want to lock the wallet?</Modal.Subtitle>
      <Modal.Action passive onClick={() => setVisible(false)}>Cancel</Modal.Action>
      <Modal.Action onClick={doLock}>Lock</Modal.Action>
    </Modal>
  )
})

const LoadingWrapper = styled.div`
  width: 27px;
  height: 18px;
`

const AccountName = ({ address }) => {
  const accountInfo = useAccountInfo(address)
  const { name } = accountInfo

  if (!name) {
    return null
  }

  return name.toUpperCase()
}

const CurrentInfoButton = () => {
  const { isApiConnected, isApiReady } = useApi()
  const unlockedModal = useModal()
  const lockedModal = useModal()

  const { account } = useStore()
  const { locked, address } = account

  useEffect(() => {
    if (!isApiReady || !isApiConnected) { return }

    return reaction(
      () => account.address,
      address => {
        account.setKeypair(address)
      },
      { fireImmediately: true }
    )
  }, [isApiReady, isApiConnected])

  if (!isApiReady || !isApiConnected) {
    return <NavBarButtonWrapper>
      <LoadingWrapper>
        <Loading />
      </LoadingWrapper>
    </NavBarButtonWrapper>
  }

  return <>
    <UnlockedModal {...unlockedModal} />
    <LockedModal {...lockedModal} />
    {locked
      ? <NavBarButtonWrapper onClick={() => lockedModal.setVisible(true)}>
        <LockIcon size={21} />
        <NavBarButtonLabel>Locked</NavBarButtonLabel>
      </NavBarButtonWrapper>
      : <NavBarButtonWrapper onClick={() => unlockedModal.setVisible(true)}>
        <UnlockIcon size={21} />
        <NavBarButtonLabel>
          <AccountName address={address} />
        </NavBarButtonLabel>
        {/* todo */}
      </NavBarButtonWrapper>}

  </>
}

export default observer(CurrentInfoButton)
