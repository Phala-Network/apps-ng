import { Modal, useInput, Input, Spacer, useToasts, Popover, Button } from '@zeit-ui/react'
import React, { useCallback, useState, useMemo, useEffect } from 'react'
import TxButton from '@/components/TxButton'
import { observer } from 'mobx-react'
import { useStore } from '@/store'
import { useTranslation } from 'react-i18next'
import { CONTRACT_ASSETS, CONTRACT_BALANCE } from '../../utils/constants'
import { ss58ToHex, encryptObj } from '@phala/runtime/utils'
import { toApi } from '@phala/runtime/models'
import InputAmount, { BN_ZERO } from '@/components/InputAmount'

const TransferModal = ({ asset, bindings, setVisible }) => {
  const { account, walletRuntime } = useStore()
  const { ecdhChannel } = walletRuntime

  const contractId = asset ? CONTRACT_ASSETS : CONTRACT_BALANCE

  const assetId = asset?.id
  const assetSymbol = asset?.symbol || 'PHA'

  const addressInput = useInput('')
  const valueInput = useInput('')
  const [isBusy, setIsBusy] = useState(false)
  const [command, setCommand] = useState('')
  const [, setToast] = useToasts()
  const [addressError, setAddressError] = useState(false)

  const [amount, setAmount] = useState(BN_ZERO) 

  const [innerDisabled, setInnerDisabled] = useState(false)

  const disabled = useMemo(() => !(
    !innerDisabled && !addressError && addressInput.state.trim().length && (parseInt(amount) > 0)
  ), [amount, addressError, addressInput.state, innerDisabled])

  const { t } = useTranslation()

  useEffect(() => {
    setInnerDisabled(true)
    let pubkeyHex
    try {
      pubkeyHex = ss58ToHex(addressInput.state.trim())
      setAddressError(false)
    } catch (error) {
      setInnerDisabled(false)
      setAddressError(true)
    }

    if (pubkeyHex) {
      ;(async () => {
        const obj = asset
          ? {
            Transfer: {
              id: assetId,
              dest: pubkeyHex,
              value: amount.toString()
            }
          }
          : {
            Transfer: {
              dest: pubkeyHex,
              value: amount.toString()
            }
          }
        console.log(obj)
        const cipher = await encryptObj(ecdhChannel, obj)
        const apiCipher = toApi(cipher)
        setCommand(JSON.stringify({ Cipher: apiCipher }))
        setInnerDisabled(false)
      })()
    }
  }, [addressInput.state, ecdhChannel, assetId, amount])

  const reset = useCallback(() => {
    setIsBusy(false)
    addressInput.reset()
    valueInput.reset()
  }, [setIsBusy, addressInput, valueInput])

  const onStart = useCallback(() => {
    setIsBusy(true)
  }, [setIsBusy])

  const onFailed = useCallback(e => {
    setIsBusy(false)
    setToast({
      text: t('Failed to transfer.'),
      type: 'error'
    })
  }, [t, setIsBusy])

  const onSuccess = useCallback(() => {
    setToast({
      text: t('Transferred.')
    })
    onClose()
  }, [t, setIsBusy])

  const onClose = useCallback(() => {
    if (isBusy) { return }

    setVisible(false)
    reset()
  }, [isBusy, setVisible, reset])

  const doSend = useCallback(() => {
    if (isBusy) { return }
  }, [isBusy])

  return <Modal {...bindings}>
    <Modal.Title>{t('secret transfer')}</Modal.Title>
    <Modal.Content>
      <Input
        {...addressInput.bindings}
        placeholder={t('Send to address')}
        width="100%"
        status={addressError ? 'error' : undefined}
      />
      <Spacer y={.5} />
      <InputAmount onChange={setAmount} symbol={assetSymbol} />
    </Modal.Content>
    <Modal.Action disabled={isBusy} passive onClick={onClose}>{t('Cancel')}</Modal.Action>
    {disabled
      ? <Button disabled>Submit</Button>
      : <TxButton
        accountId={account.address || ''}
        onClick={doSend}
        params={[contractId, command]}
        tx='phalaModule.pushCommand'
        withSpinner
        onStart={onStart}
        onFailed={onFailed}
        onSuccess={onSuccess}
      >
        {t('Submit')}
      </TxButton>}
  </Modal>
}

export default observer(TransferModal)
