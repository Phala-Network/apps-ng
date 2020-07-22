// Copyright 2017-2019 @polkadot/app-123code authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import BN from 'bn.js';
import React, { useState } from 'react';
import { Button, InputAddress, InputBalance, TxButton } from '@polkadot/react-components';

import {encryptObj} from './pruntime';
import Summary from './Summary';
import {toApi} from './pruntime/models'
import {EcdhChannel} from './pruntime/crypto';
import {ss58ToHex} from './utils';

interface Props {
  accountId?: string | null;
  assets: boolean;
  assetId?: number;
  assetSymbol?: string;
  ecdhChannel: EcdhChannel | null;
}

export default function Transfer ({ accountId, assets, assetId, assetSymbol, ecdhChannel }: Props): React.ReactElement<Props> {
  const [amount, setAmount] = useState<BN | undefined | null>(null);
  const [recipientId, setRecipientId] = useState<string | null>(null);
  const [command, setCommand] = useState('');
  const [ready, setReady] = useState(false);

  // 2: Balances, 3: Assets
  const contractId = assets ? 3 : 2;
  const symbol = assets ? (assetSymbol || 'Unit') : 'PHA';

  React.useEffect(() => {
    if (!ecdhChannel || !ecdhChannel.core.remotePubkey || !recipientId || !amount || (assets && assetId == undefined)) {
      console.log([ecdhChannel, recipientId, amount]);
      setReady(false);
      return;
    }
    setReady(true);
    console.log('dest', recipientId);
    const pubkeyHex = ss58ToHex(recipientId);
    (async () => {
      let obj;
      if (!assets) {
        obj = {
          Transfer: {
            dest: pubkeyHex,
            value: amount.toString()
          }
        };
      } else {
        obj = {
          Transfer: {
            id: assetId,
            dest: pubkeyHex,
            value: amount.toString()
          }
        };
      }
      console.log('obj', obj)
      const cipher = await encryptObj(ecdhChannel, obj);
      const apiCipher = toApi(cipher);
      setCommand(JSON.stringify({Cipher: apiCipher}));
    })();
  }, [ecdhChannel, recipientId, amount, assetId])

  return (
    <section>
      <h2>transfer</h2>
      <div className='ui--row'>
        <div className='large'>
          <InputAddress
            label='recipient address for this transfer'
            onChange={setRecipientId}
            type='all'
          />
          <InputBalance
            label='amount to transfer'
            onChange={setAmount}
            tokenUnit={symbol}
          />
          <Button.Group>
            <TxButton
              isDisabled={!ready}
              accountId={accountId}
              icon='paper-plane'
              label='make transfer'
              params={[contractId, command]}
              tx='phalaModule.pushCommand'
            />
          </Button.Group>
        </div>
        <Summary className='small'>Make a transfer from any account you control to another account. Transfer fees and per-transaction fees apply and will be calculated upon submission.</Summary>
      </div>
    </section>
  );
}
