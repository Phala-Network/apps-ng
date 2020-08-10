import { Modal, useInput, Input, Spacer, useToasts } from '@zeit-ui/react'
import React, { useCallback, useState, useMemo, useEffect } from 'react'
import TxButton from '@/components/TxButton'
import { observer } from 'mobx-react'
import { useStore } from '@/store'

import InputAmount, { BN_ZERO } from '@/components/InputAmount'

import { CONTRACT_BALANCE } from '../../utils/constants'
import { ss58ToHex, encryptObj } from '@phala/runtime/utils'
import { toApi } from '@phala/runtime/models'

const ConvertToNativeModal = ({ bindings, setVisible }) => {
  const { account, walletRuntime } = useStore()
  const { ecdhChannel } = walletRuntime

  const [isBusy, setIsBusy] = useState(false)
  const [, setToast] = useToasts()
  const [command, setCommand] = useState('')
  const [disabled, setDisabled] = useState(false)

  const [amount, setAmount] = useState(BN_ZERO)

  useEffect(() => {
    setDisabled(true)
    const pubkeyHex = ss58ToHex(account.address)
    ;(async () => {
      const obj = {
        TransferToChain: {
          dest: pubkeyHex,
          value: amount.toString()
        }
      }
      const cipher = await encryptObj(ecdhChannel, obj)
      const apiCipher = toApi(cipher)
      setCommand(JSON.stringify({ Cipher: apiCipher }))
      setDisabled(false)
    })()
  }, [account.address, amount])

  const reset = useCallback(() => {
    setIsBusy(false)
    setAmount(BN_ZERO)
  }, [setIsBusy, setAmount])

  const onStart = useCallback(() => {
    setIsBusy(true)
  }, [setIsBusy])

  const onFailed = useCallback(e => {
    setIsBusy(false)
    e && console.warn(e)
    setToast({
      text: 'Failed to submit.',
      type: 'error'
    })
  }, [setIsBusy])

  const onSuccess = useCallback(() => {
    setToast({
      text: 'Successfully submitted, the assets will appear soon.'
    })
    onClose()
  }, [onClose])

  const onClose = useCallback(() => {
    if (isBusy) { return }

    setVisible(false)
    reset()
  }, [isBusy, setVisible, reset])

  const doSend = useCallback(() => {
    if (isBusy) { return }
  }, [isBusy])

  return <Modal {...bindings} disableBackdropClick>
    <Modal.Title>convert to native asset</Modal.Title>
    <Modal.Content>
      <InputAmount onChange={setAmount} />
    </Modal.Content>
    <Modal.Action disabled={isBusy} passive onClick={onClose}>Cancel</Modal.Action>
    <TxButton
      accountId={account.address || ''}
      onClick={doSend}
      params={[CONTRACT_BALANCE, command]}
      tx='phalaModule.pushCommand'
      withSpinner
      onStart={onStart}
      onFailed={onFailed}
      onSuccess={onSuccess}
      disabled={disabled}
    >
      Submit
    </TxButton>
  </Modal>
}

export default observer(ConvertToNativeModal)
