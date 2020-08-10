import { Modal, useInput, Input, Spacer, useToasts } from '@zeit-ui/react'
import React, { useCallback, useState } from 'react'
import TxButton from '@/components/TxButton'
import { observer } from 'mobx-react'
import { useStore } from '@/store'
import InputAmount, { BN_ZERO } from '@/components/InputAmount'

const NativeTransferModal = ({ bindings, setVisible }) => {
  const { account } = useStore()

  const addressInput = useInput('')
  const [isBusy, setIsBusy] = useState(false)
  const [, setToast] = useToasts()

  const [amount, setAmount] = useState(BN_ZERO) 

  const reset = useCallback(() => {
    setIsBusy(false)
    addressInput.reset()
    setAmount(BN_ZERO)
  }, [setIsBusy, addressInput])

  const onStart = useCallback(() => {
    setIsBusy(true)
  }, [setIsBusy])

  const onFailed = useCallback(e => {
    setIsBusy(false)
    setToast({
      text: 'Failed to transfer.',
      type: 'error'
    })
  }, [setIsBusy])

  const onSuccess = useCallback(() => {
    setToast({
      text: 'Transferred.'
    })
    onClose()
  }, [setIsBusy])

  const onClose = useCallback(() => {
    if (isBusy) { return }

    setVisible(false)
    reset()
  }, [isBusy, setVisible, reset])

  const doSend = useCallback(() => {
    if (isBusy) { return }
  }, [isBusy])

  return <Modal {...bindings}>
    <Modal.Title>Transfer</Modal.Title>
    <Modal.Content>
      <Input
        {...addressInput.bindings}
        placeholder="Send to address"
        width="100%"
      />
      <Spacer y={.5} />
      <InputAmount onChange={setAmount} />
    </Modal.Content>
    <Modal.Action disabled={isBusy} passive onClick={onClose}>Cancel</Modal.Action>
    <TxButton
      accountId={account.address || ''}
      onClick={doSend}
      params={[addressInput.state.trim(), amount.toString()]}
      tx='balances.transfer'
      withSpinner
      onStart={onStart}
      onFailed={onFailed}
      onSuccess={onSuccess}
      disabled={!addressInput.state.trim().length}
    >
      Submit
    </TxButton>
  </Modal>
}

export default observer(NativeTransferModal)
