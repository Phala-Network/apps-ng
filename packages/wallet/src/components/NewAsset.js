import { useStore } from '@/store'
import React, { useState, useEffect } from 'react'
import { Modal, InputBalance, TxButton, Input } from '@polkadot/react-components'
import { encryptObj } from '@phala/runtime/utils'
import { toApi } from '@phala/runtime/models'

export default function NewAsset ({ onClose, onSuccess }) {
  const [{ isSymbolValid, symbol }, setSymbol] = useState({ isSymbolValid: false, symbol: '' })
  const [commandIssue, setCommandIssue] = useState('')
  const [ready, setReady] = useState(false)
  const [totalSupply, setTotalSupply] = useState()
  const contractId = 3

  const { walletRuntime } = useStore()
  const { ecdhChannel, accountId } = walletRuntime

  const validateSymbol = val => {
    if (!val.toLowerCase().match(/^[a-z]+$/)) {
      return 'bad-symbol'
    }
    if (val.length <= 2) {
      return 'too-short'
    }
    if (val.length > 9) {
      return 'too-long'
    }
    const tokens = walletRuntime.assets
    if (tokens.find(t => t.symbol.toLowerCase() === val.toLowerCase())) {
      return 'conflict-symbol'
    }

    return 'valid'
  }

  const _onChangeSymbol = symbol => {
    symbol = symbol.trim().toUpperCase()
    const valid = validateSymbol(symbol)
    console.log('symbol', symbol, valid)
    const isSymbolValid = (valid === 'valid')
    setSymbol({ isSymbolValid, symbol })
  }

  const createCommand = async obj => {
    if (!ecdhChannel) {
      return ''
    }
    console.log('obj', obj)
    const cipher = await encryptObj(ecdhChannel, obj)
    const apiCipher = toApi(cipher)
    return JSON.stringify({ Cipher: apiCipher })
  }

  useEffect(() => {
    if (!ecdhChannel || !ecdhChannel.core.remotePubkey) {
      console.log(ecdhChannel)
      setReady(false)
      return
    }
    setReady(true)

    if (!isSymbolValid || !totalSupply) {
      setCommandIssue('')
      return
    }
    (async () => {
      const cmd = await createCommand({
        Issue: {
          symbol,
          total: totalSupply?.toString()
        }
      })
      setCommandIssue(cmd)
    })()
  }, [isSymbolValid, symbol, totalSupply, ecdhChannel])

  return (<Modal header={'make new asset'}>
    <Modal.Content>
      <div className='ui--row'>
        <div className='large'>
          <Input
            className='full'
            help={'Enter the symbol of the token you will create.'}
            isError={!isSymbolValid}
            label={'symbol'}
            onChange={_onChangeSymbol}
            value={symbol}
          />
          <InputBalance
            label={'total supply'}
            onChange={setTotalSupply}
            tokenUnit={symbol || 'Unit'}
          />
        </div>
      </div>
    </Modal.Content>
    <Modal.Actions onCancel={onClose}>
      <TxButton
        isDisabled={!ready}
        accountId={accountId}
        icon='paper-plane'
        label='submit'
        params={[contractId, commandIssue]}
        tx='phalaModule.pushCommand'
        onSuccess={onSuccess}
      />
    </Modal.Actions>
  </Modal>)
}
