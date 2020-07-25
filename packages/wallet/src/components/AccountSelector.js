import React, { useEffect, useState } from 'react'
import { InputAddress as Input } from '@polkadot/react-components'
import styled from 'styled-components'

const InputAddress = styled(Input)`
  margin-right: 9px;
`

function AccountSelector ({ onChange }) {
  const [accountId, setAccountId] = useState(null)

  useEffect(
    () => {
      onChange && onChange(accountId)
    },
    [accountId, onChange]
  )

  return (
    <InputAddress
      label='Accounts'
      onChange={setAccountId}
      type='account'
    />
  )
}

export default AccountSelector