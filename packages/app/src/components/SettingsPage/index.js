import { useStore } from '@/store'
import { observer } from 'mobx-react'
import React, { useCallback, useEffect } from 'react'
import {
  Page,
  Input,
  useInput,
  Card,
  Spacer,
  Button,
  useToasts,
  useModal,
  Modal,
  Text
} from '@zeit-ui/react'
import { useTranslation } from 'react-i18next'

const _SettingsPage = () => {
  const { settings } = useStore()

  const apiUrlInput = useInput('')
  const phalaTeeApiUrlInput = useInput('')

  const [, setToast] = useToasts()
  const successModal = useModal()

  const { t } = useTranslation()

  useEffect(() => {
    apiUrlInput.setState(settings.apiUrl)
    phalaTeeApiUrlInput.setState(settings.phalaTeeApiUrl)
  }, [
    settings.apiUrl,
    settings.phalaTeeApiUrl
  ])

  const doSave = useCallback(e => {
    e.preventDefault()
    if (!(apiUrlInput.state && phalaTeeApiUrlInput.state)) {
      setToast({
        type: "error",
        text: r('Invalid input!')
      })

      return
    }
    settings.applyValues({
      apiUrl: apiUrlInput.state,
      phalaTeeApiUrl: phalaTeeApiUrlInput.state
    })
    successModal.setVisible(true)
  }, [apiUrlInput.state, phalaTeeApiUrlInput.state, successModal, settings])

  return <Page size="small" style={{ minHeight: 'unset' }}>
    <Modal {...successModal.bindings}>
      <Modal.Title>{t('Success')}</Modal.Title>
      <Modal.Content>
        <Text>
          {t('Settings have been saved. Reload the page to take effect.')}
        </Text>
      </Modal.Content>
      <Modal.Action passive onClick={() => successModal.setVisible(false)}>{t('Cancel')}</Modal.Action>
      <Modal.Action onClick={() => location.reload()}>{t('Reload')}</Modal.Action>
    </Modal>
    <Page.Content>
      <h2>{t('Settings')}</h2>
      <Spacer y={1.5} />
      <Card>
        <h5>{t('WebSocket Endpoint URL')}</h5>
        <Input
          {...apiUrlInput.bindings}
          width="100%"
        />
        <Spacer y={1.5} />
        <h5>{t('Phala TEE API Endpoint')}</h5>
        <Input
          {...phalaTeeApiUrlInput.bindings}
          width="100%"
        />
      </Card>
      <Spacer y={1.5} />
      <Button
        type="secondary"
        auto
        onClick={doSave}
      >
        {t('Save')}
      </Button>
    </Page.Content>
  </Page>
}

const SettingsPage = observer(_SettingsPage)

export default () => <SettingsPage />
