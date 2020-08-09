import { useStore } from '@/store'
import { ModalLine } from './TransferOffChain'
import React, { useState, useEffect } from 'react'
import { Modal, Button, InputAddress, InputBalance, TxButton } from '@polkadot/react-components'
import { ss58ToHex, encryptObj } from '@phala/runtime/utils'
import { toApi } from '@phala/runtime/models'

export default function TransferOnChain ({ asset, onClose, onSuccess }) {
  const [amount, setAmount] = useState(null)
  const [recipientId, setRecipientId] = useState(null)
  const [command, setCommand] = useState('')
  const [ready, setReady] = useState(false)
  // 2: Balances, 3: Assets
  const contractId = asset ? 3 : 2
  const symbol = 'PHA'

  const { walletRuntime } = useStore()
  const { ecdhChannel, accountId } = walletRuntime

  useEffect(() => {
    if (!ecdhChannel || !ecdhChannel.core.remotePubkey || !recipientId || !amount || (asset && asset.id === undefined)) {
      console.log([ecdhChannel, recipientId, amount])
      setReady(false)
      return
    }
    setReady(true)
    console.log('dest', recipientId)
    const pubkeyHex = ss58ToHex(recipientId)

  }, [ecdhChannel, recipientId, amount, asset?.id])

  return (<Modal header={'transfer on-chain'}>
    <Modal.Content>
      <div className='ui--row'>
        <div className='large'>
          <InputAddress label='recipient address for this transfer' onChange={setRecipientId} type='all'/>
          <InputBalance label='amount to transfer' onChange={setAmount} tokenUnit={symbol}/>
          <ModalLine>Make a transfer from any account you control to another account. Transfer fees and
            per-transaction fees apply and will be calculated upon submission.</ModalLine>
        </div>
      </div>
    </Modal.Content>
    <Modal.Actions onCancel={onClose}>
      <TxButton
        isDisabled={!ready}
        accountId={accountId}
        icon='paper-plane'
        label='make transfer'
        params={[contractId, command]}
        tx='phalaModule.pushCommand'
        onSuccess={onSuccess}
      />
    </Modal.Actions>
  </Modal>)
}
