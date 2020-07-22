import { Balance } from '@polkadot/react-components';
import { KeyringPair } from '@polkadot/keyring/types';

import React from 'react';
import BN from 'bn.js';

import Transfer from "../../Transfer";
import Query, { QueryPlan } from "../../Query";
import { EcdhChannel } from '../../pruntime/crypto';
import { ss58ToHex } from '../../utils';

import * as Models from './models';
import AssetSelector from './AssetSelector';

interface Props {
  accountId: string | null;
  ecdhChannel: EcdhChannel | null;
  pRuntimeEndpoint: string;
  keypair: KeyringPair | null;
}

export default function AssetsTab ({accountId, ecdhChannel, pRuntimeEndpoint, keypair}: Props): React.ReactElement<Props> {
  const [[assetId, assetSymbol], setAsset] = React.useState([0, 'TTT']);

  function findAsset(result: Models.MetadataResp): Models.AssetMetadata | null {
    return result.metadata.find(m => m.id == assetId!) || null;
  }
  const queryPlan: QueryPlan[] = [{
    query: 'Metadata',
    buttons: [{
      props: {
        label: 'TotalSupply',
        icon: 'money-bill-alt',
        isPrimary: true,
        isNegative: false,
      }
    }],
    bubble: {
      props: {
        label: 'total supply',
        color: 'teal',
        icon: 'money-bill-alt',
      },
      render (result: Models.MetadataResp) {
        return (<Balance balance={new BN(findAsset(result)!.totalSupply)} params={'dummy'} />);
      }
    }
  }, {
    query: 'Balance',
    buttons: [{
        props: {
          label: 'Balance',
          icon: 'search',
          isPrimary: true,
          isNegative: false,
        },
        getPayload(): Models.BalanceReq {
          return { id: assetId!, account: ss58ToHex(accountId!) }
        },
      }, {
        props: {
          label: 'Balance for Bob',
          icon: 'search',
          isPrimary: false,
          isNegative: true,
        },
        getPayload(): Models.BalanceReq {
          return { id: assetId!, account: ss58ToHex('5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty') }
        },
      }],
    bubble: {
      props: {
        label: 'balance',
        color: 'yellow',
        icon: 'adjust',
      },
      render (result: Models.BalanceResp) {
        return (<Balance balance={new BN(result.balance)} params={'dummy'} />);
      }
    }
  }];

  return (
    <>
      <h1>Assets</h1>
      <AssetSelector
        accountId={accountId}
        ecdhChannel={ecdhChannel}
        pRuntimeEndpoint={pRuntimeEndpoint}
        contractId={3}
        onChange={m => setAsset([m.id, m.symbol])}
        keypair={keypair}
      />
      <Query
        contractId={3}
        accountId={accountId}
        ecdhChannel={ecdhChannel}
        pRuntimeEndpoint={pRuntimeEndpoint}
        plans={queryPlan}
        keypair={keypair}
      />
      <Transfer
        assets={true}
        assetId={assetId}
        assetSymbol={assetSymbol}
        accountId={accountId}
        ecdhChannel={ecdhChannel}
      />
    </>
  );
}