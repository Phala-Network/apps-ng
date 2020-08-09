import { Modal, useInput, Input, Spacer, useToasts } from '@zeit-ui/react'
import React, { useCallback, useState, useMemo } from 'react'
import TxButton from '@/components/TxButton'
import { observer } from 'mobx-react'
import { useStore } from '@/store'
import getUnitAmount from '@/utils/getUnitAmount'

const ConvertToTeeModal = ({ bindings, setVisible }) => {
  const { account } = useStore()
  const valueInput = useInput('')
  const [isBusy, setIsBusy] = useState(false)
  const [, setToast] = useToasts()

  const amount = useMemo(() => {
    const [, _value] = getUnitAmount(valueInput.state)
    return _value.toString()
  }, [valueInput.state])

  const reset = useCallback(() => {
    setIsBusy(false)
    valueInput.reset()
  }, [setIsBusy, valueInput])

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
  }, [setIsBusy])

  const onClose = useCallback(() => {
    if (isBusy) { return }

    setVisible(false)
    reset()
  }, [isBusy, setVisible, reset])

  const doSend = useCallback(() => {
    if (isBusy) { return }
  }, [isBusy])

  return <Modal {...bindings} disableBackdropClick>
    <Modal.Title>convert to secret asset</Modal.Title>
    <Modal.Content>
      <Input
        {...valueInput.bindings}
        placeholder="Amount"
        labelRight="Unit"
        width="100%"
      />
    </Modal.Content>
    <Modal.Action disabled={isBusy} passive onClick={onClose}>Cancel</Modal.Action>
    <TxButton
      accountId={account.address || ''}
      onClick={doSend}
      params={[amount ? amount.toString() : '']}
      tx='phalaModule.transferToTee'
      withSpinner
      onStart={onStart}
      onFailed={onFailed}
      onSuccess={onSuccess}
    >
      Submit
    </TxButton>
  </Modal>
}

export default observer(ConvertToTeeModal)
