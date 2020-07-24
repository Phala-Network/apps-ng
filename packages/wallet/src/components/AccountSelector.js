import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { AccountIndex, Bubble, InputAddress } from '@polkadot/react-components'
import { Balance, Nonce } from '@polkadot/react-query'

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
      <div className='ui--row align-right'>
        <div className='large'>
            <Bubble color='teal' icon='address-card' label='index'>
              <AccountIndex value={accountId} />
            </Bubble>
            <Bubble color='yellow' icon='adjust' label='balance'>
              <Balance params={accountId} />
            </Bubble>
            <Bubble color='yellow' icon='dot-circle' label='transactions'>
              <Nonce params={accountId} />
            </Bubble>
          </div>
        </div>
    </section>
  )
}

export default styled(AccountSelector)`
  align-items: flex-end;

  .summary {
    text-align: center;
  }

  .align-right {
    text-align: right;
  }
`
