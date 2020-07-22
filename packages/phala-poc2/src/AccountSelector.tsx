// Copyright 2017-2020 @polkadot/app-123code authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { AccountIndex, Bubble, InputAddress } from '@polkadot/react-components';
import { Balance, Nonce } from '@polkadot/react-query';

interface Props {
  className?: string;
  onChange: (accountId: string | null) => void;
}

function AccountSelector ({ className, onChange }: Props): React.ReactElement<Props> {
  const [accountId, setAccountId] = useState<string | null>(null);

  useEffect(
    (): void => {
      onChange(accountId);
    },
    [accountId, onChange]
  );

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
  );
}

export default React.memo(styled(AccountSelector)`
  align-items: flex-end;

  .summary {
    text-align: center;
  }

  .align-right {
    text-align: right;
  }
`);
