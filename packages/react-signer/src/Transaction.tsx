// Copyright 2017-2020 @polkadot/react-signer authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { QueueTx } from '@polkadot/react-components/Status/types';

import BN from 'bn.js';
import React from 'react';
import styled from 'styled-components';
import { registry } from '@polkadot/react-api';

import { useTranslation } from './translate';
import PaymentInfo from './PaymentInfo';
import { Description, Spacer } from '@zeit-ui/react'

interface Props {
  className?: string;
  currentItem: QueueTx;
  isSendable: boolean;
  onError: () => void;
  tip?: BN;
}

function Transaction ({ className, currentItem: { accountId, extrinsic, isUnsigned, payload }, isSendable, onError, tip }: Props): React.ReactElement<Props> | null {
  const { t } = useTranslation();

  if (!extrinsic) {
    return null;
  }

  const { meta, method, section } = registry.findMetaCall(extrinsic.callIndex);
  const args = meta?.args.map(({ name }) => name).join(', ') || '';


  return (
    <>
      <p>{t<string>('The details of the transaction including the type, the description (as available from the chain metadata) as well as any parameters and fee estimations (as available) for the specific type of call.')}</p>
      <Description title="extrinsic" content={`${section}.${method}`} />
      <Spacer y={1} />
      <PaymentInfo
        accountId={accountId}
        className='tx-details'
        extrinsic={extrinsic}
        isSendable={isSendable}
        tip={tip}
      />
    </>
  );
}

export default React.memo(styled(Transaction)`
  .tx-details {
    .ui--Expander-summary {
      font-size: 1.1rem;
      margin: 0 0 0.5rem;
    }

    .highlight {
      font-weight: 600;
    }

    .meta {
      margin-bottom: 0.5rem;
      margin-left: 2rem;
    }

    .meta, .mute {
      opacity: 0.6;
    }
  }
`);
