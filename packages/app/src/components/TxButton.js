// Copyright 2017-2020 @polkadot/react-components authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useCallback, useContext } from 'react'
import { useApi, useToggle } from '@polkadot/react-hooks'
import { assert, isFunction } from '@polkadot/util'
import { StatusContext } from '@polkadot/react-components'
import { Button as _Button } from '@zeit-ui/react'

function TxButton ({ as = _Button, accountId, extrinsic: propsExtrinsic, disabled, isUnsigned, onClick, onFailed, onSendRef, onStart, onSuccess, onUpdate, params, tx, withSpinner, ...props }) {
  const Button = as
  const { api } = useApi()
  const { queueExtrinsic } = useContext(StatusContext)
  const [isSending, , setIsSending] = useToggle(false)
  const needsAccount = !isUnsigned && !accountId
  const _onFailed = useCallback((result) => {
    setIsSending(false)
    onFailed && onFailed(result)
  }, [onFailed, setIsSending])
  const _onSuccess = useCallback((result) => {
    setIsSending(false)
    onSuccess && onSuccess(result)
  }, [onSuccess, setIsSending])
  const _onSend = useCallback(() => {
    let extrinsic
    if (propsExtrinsic) {
      extrinsic = propsExtrinsic
    } else {
      const [section, method] = (tx || '').split('.')
      assert(api.tx[section] && api.tx[section][method], `Unable to find api.tx.${section}.${method}`)
      extrinsic = api.tx[section][method](...(isFunction(params)
        ? params()
        : (params || [])))
    }
    assert(extrinsic, 'Expected generated extrinsic passed to TxButton')
    if (withSpinner) {
      setIsSending(true)
    }
    queueExtrinsic({
      accountId: accountId && accountId.toString(),
      extrinsic,
      isUnsigned,
      txFailedCb: withSpinner ? _onFailed : onFailed,
      txStartCb: onStart,
      txSuccessCb: withSpinner ? _onSuccess : onSuccess,
      txUpdateCb: onUpdate
    })
    onClick && onClick()
  }, [_onFailed, _onSuccess, accountId, api.tx, isUnsigned, onClick, onFailed, onStart, onSuccess, onUpdate, params, propsExtrinsic, queueExtrinsic, setIsSending, tx, withSpinner])
  if (onSendRef) {
    onSendRef.current = _onSend
  }
  return (<Button
    disabled={isSending || disabled || needsAccount}
    onClick={disabled ? onClick : _onSend}
    loading={typeof props.loading !== 'undefined' ? props.loading : isSending}
    {...props}
  />)
}

export default TxButton
