import React from 'react'
import { Button, Table } from 'semantic-ui-react'
import styled from 'styled-components'

const AssetsTable = ({ children, ...props }) => {
  return <Table size="large" celled {...props}>
    <Table.Header>
      <Table.Row>
        <Table.HeaderCell />
        <Table.HeaderCell textAlign="center">Total Issuance</Table.HeaderCell>
        <Table.HeaderCell textAlign="center">Balance</Table.HeaderCell>
        <Table.HeaderCell textAlign="center">Actions</Table.HeaderCell>
      </Table.Row>
    </Table.Header>

    <Table.Body>
      {children}
    </Table.Body>
  </Table>
}

export const AssetsTableActionButton = styled(Button)`
  margin: 3px 3px !important;
`

export default AssetsTable
