import { useStore } from '@/store'
import { toJS } from 'mobx'
import { observer } from 'mobx-react'
import React, { useCallback, useEffect, useState } from 'react'
import { Header, Container as _Container, Form, Modal, Button, Icon } from 'semantic-ui-react'
import styled from 'styled-components'

const Container = styled(_Container)`
  padding: 24px 0;
`

const HeaderDivider = styled.div`
  width: 100%;
  height: 15px;
`

const _SettingsPage = () => {
  const { settings } = useStore()

  const [values, setValues] = useState(toJS(settings))
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setValues(toJS(settings))
  }, [settings, settings.apiUrl, settings.phalaTeeApiUrl])

  const handleSave = useCallback(e => {
    if (!(values.phalaTeeApiUrl && values.apiUrl)) { return }
    settings.applyValues(values)
    setOpen(true)
    e.preventDefault()
  }, [settings, values])

  const handleChange = useCallback((e, { name, value: _value }) => {
    setValues(p => ({ ...p, [name]: _value }))
  }, [setValues])

  return <>
    <Modal
      open={open}
      size='small'
    >
      <Header>
        Notification
      </Header>
      <Modal.Content>
        <p>
          Settings have been saved and will take effect after refreshing the page.
        </p>
      </Modal.Content>
      <Modal.Actions>
        <Button color='grey' onClick={() => setOpen(false)}>
          <Icon name='check' /> Got it
        </Button>
        <Button color='green' onClick={() => location.reload(true)}>
          <Icon name='refresh' /> Refresh Page
        </Button>
      </Modal.Actions>
    </Modal>
    <Container>
      <Header as='h2'>Settings</Header>
      <HeaderDivider />
      <Form onSubmit={handleSave}>
        <Form.Input
          error={!values.apiUrl && 'Please enter WebSocket Endpoint URL.'}
          fluid
          value={values.apiUrl}
          name="apiUrl"
          label='WebSocket Endpoint URL'
          placeholder='WebSocket Endpoint'
          onChange={handleChange}
        />
        <Form.Input
          error={!values.phalaTeeApiUrl && 'Please enter Phala TEE API Endpoint.'}
          fluid
          value={values.phalaTeeApiUrl}
          label='Phala TEE API Endpoint'
          name="phalaTeeApiUrl"
          placeholder='Phala TEE API Endpoint'
          onChange={handleChange}
        />
        <Button color='green' type='submit'>Save</Button>
      </Form>
    </Container>
  </>
}

const SettingsPage = observer(_SettingsPage)

export default () => <SettingsPage />
