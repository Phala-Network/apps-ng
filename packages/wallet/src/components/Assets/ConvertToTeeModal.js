import { Modal, useToasts } from '@zeit-ui/react'
import React, { useCallback, useState } from 'react'
import TxButton from '@/components/TxButton'
import { observer } from 'mobx-react'
import { useStore } from '@/store'
import InputAmount, { BN_ZERO } from '@/components/InputAmount'
import { useTranslation } from 'react-i18next'

const ConvertToTeeModal = ({ bindings, setVisible }) => {
  const { account } = useStore()
  const [isBusy, setIsBusy] = useState(false)
  const [, setToast] = useToasts()

  const [amount, setAmount] = useState(BN_ZERO)

  const { t } = useTranslation()

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
      text: t('Failed to submit.'),
      type: 'error'
    })
  }, [t, setIsBusy])

  const onSuccess = useCallback(() => {
    setToast({
      text: t('Successfully submitted, the assets will appear soon.')
    })
    onClose()
  }, [t, onClose])

  const onClose = useCallback(() => {
    if (isBusy) { return }

    setVisible(false)
    reset()
  }, [isBusy, setVisible, reset])

  const doSend = useCallback(() => {
    if (isBusy) { return }
  }, [isBusy])

  return <Modal {...bindings} disableBackdropClick>
    <Modal.Title>{t('convert to secret asset')}</Modal.Title>
    <Modal.Content>
      <InputAmount onChange={setAmount} placeholder={t('Amount')} />
    </Modal.Content>
    <Modal.Action disabled={isBusy} passive onClick={onClose}>{t('Cancel')}</Modal.Action>
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
      {t('Submit')}
    </TxButton>
  </Modal>
}

export default observer(ConvertToTeeModal)
