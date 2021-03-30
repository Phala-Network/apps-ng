import React, { useCallback, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Button from './Button'
import TxButton from '@/components/TxButton'
import { Modal, useModal, useToasts, Spacer } from '@zeit-ui/react'
import { encryptObj } from '@phala/runtime/utils'
import { toApi } from '@phala/runtime/models'
import { observer } from 'mobx-react'
import { useStore } from '@/store'

const TxModal = observer(({
  contractId, payload, onSuccessMsg, modalTitle, modalSubtitle,
  onSuccessCallback, onFailedCallback,
  setVisible, bindings
}) => {
  const { account, appRuntime } = useStore()
  const { ecdhChannel } = appRuntime
  const [isBusy, setIsBusy] = useState(false)
  const [, setToast] = useToasts()
  const [command, setCommand] = useState('')
  const [disabled, setDisabled] = useState(false)

  const { t } = useTranslation()

  useEffect(() => {
    if (!appRuntime?.channelReady) return
    setDisabled(true)
    ;(async () => {
      const cipher = await encryptObj(ecdhChannel, payload)
      const apiCipher = toApi(cipher)
      setCommand(JSON.stringify({ Cipher: apiCipher }))
      setDisabled(false)
    })()
  }, [payload, appRuntime?.channelReady])

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
    if (onFailedCallback) onFailedCallback(e)
  }, [t, setIsBusy])

  const onSuccess = useCallback(() => {
    setToast({
      text: onSuccessMsg
    })
    onClose()
    if (onSuccessCallback) onSuccessCallback()
  }, [t, onClose])

  const onClose = useCallback(() => {
    if (isBusy) { return }

    setVisible(false)
  }, [isBusy])

  const doSend = useCallback(() => {
    if (isBusy) { return }
  }, [isBusy])

  return <Modal {...bindings} disableBackdropClick>
    <Modal.Title>{modalTitle}</Modal.Title>
    <Modal.Subtitle>{modalSubtitle}</Modal.Subtitle>
    <Spacer y={1} />
    <TxButton
      accountId={account.address || ''}
      onClick={doSend}
      params={[contractId, command]}
      tx='phala.pushCommand'
      withSpinner
      onStart={onStart}
      onFailed={onFailed}
      onSuccess={onSuccess}
      disabled={disabled}
    >
      {t('Submit')}
    </TxButton>
    <Modal.Action onClick={onClose}>{t('Cancel')}</Modal.Action>
  </Modal>
})

const PushCommandButton = ({
  contractId, payload,
  onSuccessMsg, modalTitle, modalSubtitle,
  onSuccessCallback, onFailedCallback,
  buttonType, icon, name
}) => {
  const modal = useModal()

  return <>
    <TxModal
      contractId={contractId}
      payload={payload}
      onSuccessMsg={onSuccessMsg}
      modalTitle={modalTitle}
      modalSubtitle={modalSubtitle}
      onSuccessCallback={onSuccessCallback}
      onFailedCallback={onFailedCallback}
      {...modal}
    />
    <Button
      type={buttonType}
      icon={icon}
      name={name}
      onClick={() => modal.setVisible(true)}
    />
  </>
}

export default PushCommandButton
