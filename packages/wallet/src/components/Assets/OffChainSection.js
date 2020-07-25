import PageLoading from '@/components/PageLoading'
import { toJS } from 'mobx'
import { observer } from 'mobx-react'
import Section from '../Section'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Menu, Table, Button, Icon, Checkbox } from 'semantic-ui-react'
import AssetsTable from './AssetsTable'
import { useStore } from '@/store'
import { Balance } from '@polkadot/react-components'
import BN from 'bn.js'

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
  return <>
    <Button icon labelPosition='left' color="green"><Icon name="chess board" />Transfer on-chain</Button>
    <Button icon labelPosition='left' color="violet"><Icon name="th" />Make new asset</Button>
    <Button icon labelPosition='left' color="blue"><Icon name="send" />Transfer</Button>
  </>
}

const AssetRowAction = ({ asset }) => {
  return <>
    <Button icon labelPosition='left' color="blue"><Icon name="send" />Transfer</Button>
  </>
}

export default OffChainSection
