import React from 'react';

import { GetInfoResp } from './pruntime/models';
import { KeyringPair } from '@polkadot/keyring/types';
import PRuntime from './pruntime';
import { EcdhChannel } from './pruntime/crypto';

export interface PhalaSharedStruct {
  pRuntimeEndpoint: string,
  setPRuntimeEndpoint: React.Dispatch<PhalaSharedStruct['pRuntimeEndpoint']>,
  accountId: string | null,
  setAccountId: React.Dispatch<PhalaSharedStruct['accountId']>,
  keypair: KeyringPair | null,
  setKeypair: React.Dispatch<PhalaSharedStruct['keypair']>,
  latency: number,
  setLatency: React.Dispatch<PhalaSharedStruct['latency']>,
  info: GetInfoResp | null,
  setInfo: React.Dispatch<PhalaSharedStruct['info']>,
  error: boolean,
  setError: React.Dispatch<PhalaSharedStruct['error']>,
  pApi: PRuntime,
  ecdhChannel: EcdhChannel,
  setEcdhChannel: React.Dispatch<PhalaSharedStruct['ecdhChannel']>,
  ecdhShouldJoin: boolean,
  setEcdhShouldJoin: React.Dispatch<PhalaSharedStruct['ecdhShouldJoin']>,
  basePath: string,
  setBasePath: React.Dispatch<PhalaSharedStruct['basePath']>,
  createCommand: Function
}

export const PhalaSharedContext = React.createContext<PhalaSharedStruct | null>(null);

export const usePhalaShared = (): PhalaSharedStruct => React.useContext(PhalaSharedContext) as PhalaSharedStruct;
