import PageLoading from '@/components/PageLoading'
import { TxButton } from '@polkadot/react-components'
import { observer } from 'mobx-react'
import styled from 'styled-components'
import { CONTRACT_ASSETS } from '../../utils/constants'
import TransferOnChain from '../TransferOnChain'
import NewAsset from '../NewAsset'
import Section from '../Section'
import Transfer from '../Transfer'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Menu, Table, Button, Icon, Checkbox, Popup } from 'semantic-ui-react'
import _AssetsTable, { AssetsTableActionButton } from './AssetsTable'
import { useStore } from '@/store'
import { Balance } from '@polkadot/react-components'
import BN from 'bn.js'
import { encryptObj } from '@phala/runtime/utils'
import { toApi } from '@phala/runtime/models'

const AssetsTable = styled(_AssetsTable)`
  margin-top: calc(1em - 20px) !important;
`

const OffChainSection = observer(() => {
  const { walletRuntime, wallet } = useStore()
  const [loading, setLoading] = useState(true)

  const doUpdate = useCallback(async () => {
    setLoading(true)
    await walletRuntime.fullUpdate()
    setLoading(false)
  }, [walletRuntime])

  useEffect(() => {
    doUpdate && doUpdate()
  }, [doUpdate])

  return (
    <Section>
      <Menu secondary>
        <Menu.Item>
          <h2>
            Off-chain Assets
          </h2>
        </Menu.Item>
        <Menu.Item>
          <Checkbox label="Hide invalid assets" onChange={wallet.toggleShowInvalidAssets} checked={!wallet.showInvalidAssets}/>
        </Menu.Item>
        <Menu.Item position="right">
          <Button.Group>
            <Button onClick={doUpdate} icon labelPosition='left'><Icon name="refresh" />Refresh</Button>
          </Button.Group>
        </Menu.Item>
      </Menu>

      {loading && <PageLoading />}
      <AssetsTable color="black">
        <AssetRow asset={walletRuntime.mainAsset} forcedShown={true}>
          <MainAssetRowAction />
        </AssetRow>
        {walletRuntime.assets.map((i, idx) => <AssetRow asset={i} key={`OffChainSection-${idx}-${i.symbol}`}>
          <AssetRowAction asset={i} />
        </AssetRow>)}
      </AssetsTable>
    </Section>
  )
})

const AssetRow = observer(({ asset, children, forcedShown = false }) => {
  const { wallet: { showInvalidAssets } } = useStore()

  const totalSupply = useMemo(() => new BN(asset?.totalSupply || "0"), [asset?.totalSupply])
  const balance = useMemo(() => new BN(asset?.balance || "0"), [asset?.balance])

  if (!asset) { return null }
  if (balance.isZero() && (!forcedShown && !showInvalidAssets) ) { return null }

  return <Table.Row>
    <Table.Cell textAlign="center" width={1}>
      {asset.symbol}
    </Table.Cell>
    <Table.Cell textAlign="center" width={3}>
      <Balance balance={totalSupply} params={'dummy'} />
    </Table.Cell>
    <Table.Cell textAlign="center" width={3}>
      <Balance balance={balance} params={'dummy'} />
    </Table.Cell>
    <Table.Cell textAlign="center">
      {children}
    </Table.Cell>
  </Table.Row>
})

const MainAssetRowAction = () => {
  const [transferChainModal, showTransferChainModal] = useState(false)
  const [newAssetModal, setNewAssetModal] = useState(false)
  const [transferModal, showChainModal] = useState(false)

  return <>
    {transferChainModal && <TransferOnChain
      onClose={() => showTransferChainModal(false)}
      onSuccess={() => {
        alert('Success!')
        showTransferChainModal(false)
      }}
    />}
    {newAssetModal && <NewAsset
      onClose={() => setNewAssetModal(false)}
      onSuccess={() => {
        alert('Success!')
        setNewAssetModal(false)
      }}
    />}
    {transferModal && <Transfer
      onClose={() => showChainModal(false)}
      onSuccess={() => {
        alert('Success!')
        showChainModal(false)
      }}
    />}
    <>
      <AssetsTableActionButton icon labelPosition='left' color="green" onClick={() => showTransferChainModal(true)}><Icon name="chess board" />Transfer on-chain</AssetsTableActionButton>
      <AssetsTableActionButton icon labelPosition='left' color="violet" onClick={() => setNewAssetModal(true)}><Icon name="th" />Make new asset</AssetsTableActionButton>
      <AssetsTableActionButton icon labelPosition='left' color="blue" onClick={() => showChainModal(true)}><Icon name="send" />Transfer</AssetsTableActionButton>
    </>
  </>
}

const AssetRowAction = ({ asset }) => {
  const [transferModal, showChainModal] = useState(false)

  return <>
    {transferModal && <Transfer
      asset={asset}
      onClose={() => showChainModal(false)}
      onSuccess={() => {
        alert('Success!')
        showChainModal(false)
      }}
    />}
    <AssetsTableActionButton icon labelPosition='left' color="blue" onClick={() => showChainModal(true)}><Icon name="send" />Transfer</AssetsTableActionButton>
    <DestroyAssetButton asset={asset} />
  </>
}

const DestroyAssetButton = ({ asset }) => {
  const { walletRuntime: { accountId } } = useStore()

  return <>
    {accountId === asset.ownerAccountId &&
      <Popup
        content={<DestroyAsset asset={asset} />}
        on='click'
        pinned
        trigger={<AssetsTableActionButton icon labelPosition='left' color="red"><Icon name="delete" />Destroy</AssetsTableActionButton>}
      />}
  </>
}

const DestroyAsset = ({ asset }) => {
  const [command, setCommand] = useState(null)
  const { walletRuntime: { ecdhChannel, accountId } } = useStore()

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
    if (typeof asset?.id !== 'number') {
      setCommand(null)
      return
    }
    createCommand({
      Destroy: {
        id: asset?.id
      }
    })
      .then(setCommand)
  }, [asset?.id, ecdhChannel])

  return <>
    Click
    <TxButton
      isDisabled={!command}
      accountId={accountId}
      icon='paper-plane'
      label="Confirm"
      color="red"
      params={[CONTRACT_ASSETS, command]}
      tx='phalaModule.pushCommand'
      onSuccess={() => alert('Success')}
    />
    to continue.
  </>
}

export default OffChainSection
