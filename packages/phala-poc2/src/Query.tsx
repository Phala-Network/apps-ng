import React, { useState } from 'react';
import styled from 'styled-components';

import { Button, Bubble, Card } from '@polkadot/react-components';
import { KeyringPair } from '@polkadot/keyring/types';

import Summary from './Summary';
import PRuntime from './pruntime';
import {EcdhChannel} from './pruntime/crypto';
import { ButtonProps } from '@polkadot/react-components/Button/types';

interface Props {
  contractId: number;
  accountId: string | null;
  ecdhChannel: EcdhChannel | null;
  pRuntimeEndpoint: string;
  plans: QueryPlan[];
  keypair: KeyringPair | null;
}

const QuerySection = styled.section`
  margin-bottom: 5px;
`;

export interface QueryPlan {
  query: string;
  buttons: {
    props: ButtonProps; // extends ButtonProps
    getPayload?: () => any;
  }[];
  bubble?: {
    props: any;
    render?: (result: any) => React.ReactNode;
  };
};

export default function Query ({ contractId, accountId, ecdhChannel, pRuntimeEndpoint, plans, keypair }: Props): React.ReactElement<Props> {
  const [queryResult, setQueryResult] = useState<any | null>(null);

  function checkChannelReady(): boolean {
    if (!keypair || keypair.isLocked) {
      alert('Account not ready');
      return false;
    }
    if (!ecdhChannel || !ecdhChannel.core.agreedSecret || !ecdhChannel.core.remotePubkey) {
      alert('ECDH not ready');
      return false;
    }
    return true;
  }

  async function query(name: string, getPayload?: () => any) {
    if (!checkChannelReady()) return;
    let data: any;
    if (getPayload) {
      data = {};
      data[name] = getPayload();
    } else {
      data = name;
    }
    const result: object = await new PRuntime(pRuntimeEndpoint).query(contractId, data, ecdhChannel!, keypair!);
    setQueryResult(result);
  }

  function formatError(error: any): string {
    if (typeof error === 'string') {
      return error;
    } else {
      return JSON.stringify(error);
    }
  }

  return (
    <section>
      <h2>query</h2>
      <div className='ui--row'>
        <div className='large'>
          <QuerySection>
            {
              plans.map((p, idx1) => (
                p.buttons.map((b, idx2) =>
                  <Button
                    {...b.props}
                    onClick={() => query(p.query, b.getPayload)}
                    key={`${idx1}-${idx2}`}
                  />
                )
              )).flat()
            }
          </QuerySection>

          <Card>
            <p><strong>response</strong></p>
            { plans.map(p => ({p, b: p.bubble}))
                   .filter(({p, b}) => (
                     b && queryResult && (queryResult == p.query || queryResult[p.query])))
                   .map(({p, b}, idx) => (
                     <Bubble {...b!.props} key={idx}>
                       {b!.render && b!.render(queryResult[p.query])}
                     </Bubble>))
            }
            { queryResult?.Error && (
              <Bubble color='red' icon='minus-circle' label='error'>
                {formatError(queryResult.Error)}
              </Bubble>
            )}
            { queryResult && (
              <div>
                <code>
                  {JSON.stringify(queryResult)}
                </code>
              </div>
            )}
          </Card>
        </div>
        <Summary className='small'>Query the balance of an account on behalf of the selected identity. The balance of an account is only accessible by the owner.</Summary>
      </div>
    </section>
  );
}