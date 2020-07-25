import React from 'react'
import { Table } from 'semantic-ui-react'

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

export default AssetsTable
