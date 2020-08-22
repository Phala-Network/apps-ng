import { useTranslation } from 'react-i18next'
import Button from './Button'
import React, { useCallback, useState, useMemo, useEffect } from 'react'
import {
  MinusSquare as MinusSquareIcon
} from '@zeit-ui/react-icons'
import TxButton from '@/components/TxButton'
import { Modal, useModal, useToasts, Spacer } from '@zeit-ui/react'
import { CONTRACT_ASSETS } from '../../utils/constants'
import { encryptObj } from '@phala/runtime/utils'
import { toApi } from '@phala/runtime/models'
import { observer } from 'mobx-react'
import { useStore } from '@/store'

const DestroyModal = observer(({ id, symbol, bindings, setVisible }) => {
  const { account, walletRuntime } = useStore()
  const { ecdhChannel } = walletRuntime
  const [isBusy, setIsBusy] = useState(false)
  const [, setToast] = useToasts()
  const [command, setCommand] = useState('')
  const [disabled, setDisabled] = useState(false)

  const { t } = useTranslation()

  useEffect(() => {
    setDisabled(true)
    ;(async () => {
      const obj = {
        Destroy: { id }
      }
      const cipher = await encryptObj(ecdhChannel, obj)
      const apiCipher = toApi(cipher)
      setCommand(JSON.stringify({ Cipher: apiCipher }))
      setDisabled(false)
    })()
  }, [id])

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
      text: t('Successfully destroyed, the assets will disappear soon.')
    })
    onClose()
  }, [t, onClose])

  const onClose = useCallback(() => {
    if (isBusy) { return }

    setVisible(false)
  }, [isBusy])

  const doSend = useCallback(() => {
    if (isBusy) { return }
  }, [isBusy])

  return <Modal {...bindings} disableBackdropClick>
    <Modal.Title>{t('Confirm')}</Modal.Title>
    <Modal.Subtitle>{t('do you want to destroy the secret token({{symbol}})?', { symbol })}</Modal.Subtitle>
    <Spacer y={1} />
    <TxButton
      accountId={account.address || ''}
      onClick={doSend}
      params={[CONTRACT_ASSETS, command]}
      tx='phalaModule.pushCommand'
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

const DestroyButton = ({ id, symbol }) => {
  const modal = useModal()
  const { t } = useTranslation()

  return <>
    <DestroyModal id={id} symbol={symbol} {...modal} />
    <Button
      type="remove"
      icon={MinusSquareIcon}
      name={t('Destroy Token')}
      onClick={() => modal.setVisible(true)}
    />
  </>
}

export default DestroyButton
