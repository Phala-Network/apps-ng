import React from 'react';
import * as base64 from 'base64-js';
import styled from 'styled-components';

import { Button, Input } from '@polkadot/react-components';
import { BareProps } from '@polkadot/react-components/types';
import Unlock from '@polkadot/app-toolbox/Unlock';

import { stringToU8a } from '@polkadot/util';
import keyring from '@polkadot/ui-keyring';
import { cryptoWaitReady } from '@polkadot/util-crypto';

import AccountSelector from './AccountSelector';
import SummaryBar from './SummaryBar';
import { useTranslation } from './translate';
import PRuntime from './pruntime';
import { usePhalaShared, PhalaSharedStruct } from './context';

const EcdhTable = styled.table`
  width: 100%;
  td:nth-child(1) {
    text-align: right;
  }
  td:nth-child(2) {
    font-family: monospace;
  }
`;

const UnlockPrompt = styled.section`
  div.large {
    background: #e8e8e8;
    .button-group {
      margin: 20px 0;
    }
  }
`;

function Settings(props: BareProps): React.ReactElement<BareProps> {
  const {
    ecdhChannel, info, latency, pRuntimeEndpoint,
    setPRuntimeEndpoint,
    accountId, setAccountId,
    keypair, setKeypair,
    pApi
  } = usePhalaShared() as PhalaSharedStruct;

  const { t } = useTranslation();


  const [message, setMessage] = React.useState('');

  async function testSign() {
    const data = stringToU8a(message);
    const msgB64 = base64.fromByteArray(data);
    await pApi.test({
      testEcdh: { 
        pubkeyHex: ecdhChannel?.localPubkeyHex,
        messageB64: msgB64,
      }
    })
    console.log('Sent test: ', ecdhChannel?.localPubkeyHex, msgB64);
  }

  React.useEffect(() => {
    (async () => {
      await cryptoWaitReady();
      if (accountId) {
        const pair = keyring.getPair(accountId || '');
        setKeypair(pair);
      }
    })();
  }, [accountId]);
  const [showUnlock, setShowUnlock] = React.useState(false);
  function _toggleUnlock () {
    setShowUnlock(!showUnlock);
  }
  function _onUnlock () {
    _toggleUnlock();
    setKeypair(keypair);  // re-notify the locking change
  }

  // utilities

  function shortKey(key: string = '', len: number = 32): string {
    if (key.startsWith('0x')) {
      key = key.substring(2);
    }
    if (!key) {
      return ''
    }
    return key.substring(0, len) + '...';
  }

  return (
    <>
      <AccountSelector onChange={setAccountId} />
      {keypair && keypair.isLocked &&
        <UnlockPrompt className='ui--row'>
          <div className='large'>
            <Button.Group isCentered className='button-group'>
              <Button
                isPrimary
                onClick={_toggleUnlock}
                label={t('Unlock account')}
                icon='unlock'
              />
            </Button.Group>
          </div>
        </UnlockPrompt>
      }

      <SummaryBar
        pRuntimeEndpoint={pRuntimeEndpoint}
        pRuntimeConnected={latency != null}
        pRuntimeLatency={latency}
        pRuntimeInitalized={info?.initialized}
        pRuntimeBlock={info?.blocknum}
        pRuntimeECDHKey={info?.ecdhPublicKey}
        onChanged={setPRuntimeEndpoint}
      />

      <section>
        <h2>ECDH测试</h2>
        <div className='ui--row'>
          <div className='large'>
            <div>
              <Input
                className='full'
                label={t('message')}
                onChange={setMessage}
                onEnter={testSign}
                placeholder={t('any text')}
                value={message}
              />
            </div>
            <div>
              <EcdhTable>
                <tbody>
                  <tr><td>ECDH Public</td><td>{shortKey(ecdhChannel?.localPubkeyHex)}</td></tr>
                  <tr><td>ECDH Private</td><td>{shortKey(ecdhChannel?.localPrivkeyHex)}</td></tr>
                  <tr><td>pRuntime Public</td><td>{shortKey(info?.ecdhPublicKey)}</td></tr>
                  <tr><td>Derived Secret</td><td>{shortKey(ecdhChannel?.agreedSecretHex)}</td></tr>
                </tbody>
              </EcdhTable>
            </div>
          </div>
        </div>
      </section>

      {showUnlock && (
        <Unlock
          onClose={_toggleUnlock}
          onUnlock={_onUnlock}
          pair={keypair}
        />
      )}
    </>
  );
}

export default Settings;