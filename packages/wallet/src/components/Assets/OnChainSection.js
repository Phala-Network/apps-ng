import { observer } from 'mobx-react'
import Section from '../Section'
import React, { useState } from 'react'
import { Button, Icon, Menu, Table } from 'semantic-ui-react'
import AssetsTable from './AssetsTable'
import { Balance, TotalIssuance } from '@polkadot/react-query'
import { useStore } from '@/store'
import TransferModal from '@phala/accounts/Accounts/modals/Transfer'

const OnChainSection = observer(() => {
  const { walletRuntime } = useStore()
  const [transferModal, showTransferModal] = useState(false)

  return <>
    {transferModal && <TransferModal onClose={() => showTransferModal(false)}/>}
    <Section>
      <Menu secondary>
        <Menu.Item>
          <h2>
            On-chain Assets
          </h2>
        </Menu.Item>
        <Menu.Item position="right">
          <Button.Group position='right'>
            {/*<Button onClick={doUpdate} icon labelPosition='left'><Icon name="refresh" />Refresh</Button>*/}
          </Button.Group>
        </Menu.Item>
      </Menu>
      <AssetsTable color="green">
        <Table.Row>
          <Table.Cell textAlign="center" width={1}>PHA</Table.Cell>
          <Table.Cell textAlign="center" width={3}>
            <TotalIssuance />
          </Table.Cell>
          <Table.Cell textAlign="center" width={3}>
            <Balance params={walletRuntime.accountId} />
          </Table.Cell>
          <Table.Cell textAlign="center">
            <Button icon labelPosition='left' color="black"><Icon name="chess board" />Transfer off-chain</Button>
            <Button icon labelPosition='left' color="blue" onClick={() => showTransferModal(true)}><Icon name="send" />Transfer</Button>
          </Table.Cell>
        </Table.Row>
      </AssetsTable>
    </Section>
  </>
})

export default OnChainSection
