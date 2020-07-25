import React, { useEffect, useState } from 'react'
import { InputAddress } from '@polkadot/react-components'

function AccountSelector ({ className, onChange }) {
  const [accountId, setAccountId] = useState(null)

  useEffect(
    () => {
      onChange && onChange(accountId)
    },
    [accountId, onChange]
  )

  return (
    <section className={`template--AccountSelector ${className}`}>
      <h2>选择账户</h2>
      <div className='ui--row'>
        <div className='large'>
          <InputAddress
            label='我的默认账户'
            onChange={setAccountId}
            type='account'
          />
        </div>
      </div>
    </section>
  )
}

export default AccountSelector