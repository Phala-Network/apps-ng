// Copyright 2017-2019 @polkadot/app-123code authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

// some types, AppProps for the app and I18nProps to indicate
// translatable strings. Generally the latter is quite "light",
// `t` is inject into props (see the HOC export) and `t('any text')
// does the translation
import { AppProps } from '@polkadot/react-components/types';
import Tabs from '@polkadot/react-components/Tabs';

// external imports (including those found in the packages/*
// of this repo)
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Route, Switch } from 'react-router';
import styled from 'styled-components';

// local imports and components
import BalancesTab from './contracts/balances';
import AssetsTab from './contracts/assets';
import SettingsTab from './SettingsTab';
import { useTranslation } from './translate';

import PRuntime, { measure, encryptObj } from './pruntime';
import Crypto, { EcdhChannel } from './pruntime/crypto';
import { toApi } from './pruntime/models';
import config from './config';
import { PhalaSharedContext, PhalaSharedStruct, usePhalaShared } from './context';
import List from './List';
import Items from './Items';
import NewOrder from './NewOrder';
import Result from './Result'

interface Props extends AppProps {}

const Banner = styled.div`
  padding: 0 0.5rem 0.5rem;
  margin-top: 10px;
  margin-bottom: 20px;

  .box {
    background: #fff6e5;
    border-left: 0.25rem solid darkorange;
    border-radius: 0 0.25rem 0.25rem 0;
    box-sizing: border-box;
    padding: 1rem 1.5rem;

    .info {
      max-width: 50rem;
    }
  }
`;

function PhalaPoc2 (props: Props): React.ReactElement<Props> {
  const [basePath, setBasePath] = useState<PhalaSharedStruct['basePath']>('/phala-poc2')
  const [pRuntimeEndpoint, setPRuntimeEndpoint] = useState<PhalaSharedStruct['pRuntimeEndpoint']>(config.pRuntimeEndpoint);
  const [accountId, setAccountId] = useState<PhalaSharedStruct['accountId']>(null);
  const [keypair, setKeypair] = useState<PhalaSharedStruct['keypair']>(null);
  const [latency, setLatency] = useState<PhalaSharedStruct['latency']>(0);
  const [info, setInfo] = useState<PhalaSharedStruct['info']>(null);
  const [error, setError] = useState<boolean>(false);

  const [ecdhChannel, setEcdhChannel] = useState<EcdhChannel | null>(null);
  const [ecdhShouldJoin, setEcdhShouldJoin] = useState(false);

  React.useEffect(() => {
    setError(false);
    setLatency(0);
    setInfo(null);
  }, [pRuntimeEndpoint])

  React.useEffect(() => {
    Crypto.newChannel()
      .then(ch => {
        setEcdhChannel(ch)
        setEcdhShouldJoin(true)
      })
  }, []);

  React.useEffect(() => {
    if (!(ecdhShouldJoin && ecdhChannel && info?.ecdhPublicKey)) {
      return
    }
    Crypto.joinChannel(ecdhChannel, info.ecdhPublicKey)
      .then(ch => {
        setEcdhChannel(ch);
        setEcdhShouldJoin(false);
        console.log('joined channel:', ch);
      })
  }, [setEcdhShouldJoin, info?.ecdhPublicKey]);

  const pApi = useMemo(() => {
    if (!(pRuntimeEndpoint && ecdhChannel && keypair)) {
      return
    }
    return new PRuntime({
      endpoint: pRuntimeEndpoint,
      channel: ecdhChannel as EcdhChannel,
      keypair: keypair
    })
  }, [pRuntimeEndpoint, ecdhChannel, keypair]);

  React.useEffect(() => {
    if (!pApi) {
      return
    }

    const interval: number = setInterval(() => {
      measure((() =>
        pApi.getInfo()
          .then(i => setInfo(i))
          .catch(e => {
            setError(true);
            console.warn('Error getting /info', e);
          })
      ))
        .then(dt => setLatency(l => l ? l * 0.8 + dt * 0.2 : dt))
    }, 1000);

    return () => clearTimeout(interval);
  }, [pApi])

  const createCommand = useCallback(async (obj) => {
    if (!ecdhChannel) {
      return '';
    }
    console.log('obj', obj)
    const cipher = await encryptObj(ecdhChannel, obj);
    const apiCipher = toApi(cipher);
    return JSON.stringify({Cipher: apiCipher});
  }, [ecdhChannel]) as Function;

  const contextValue = useMemo(() => ({
    basePath, setBasePath,
    pRuntimeEndpoint, setPRuntimeEndpoint,
    accountId, setAccountId,
    keypair, setKeypair,
    latency, setLatency,
    info, setInfo,
    error, setError,
    ecdhChannel, setEcdhChannel,
    pApi,
    createCommand
  }), [
    basePath, setBasePath,
    pRuntimeEndpoint, setPRuntimeEndpoint,
    accountId, setAccountId,
    keypair, setKeypair,
    latency, setLatency,
    info, setInfo,
    error, setError,
    ecdhChannel, setEcdhChannel,
    ecdhShouldJoin, setEcdhShouldJoin,
    pApi,
    createCommand
  ]);

  return <PhalaSharedContext.Provider value={contextValue as PhalaSharedStruct}>
    <_PhalaPoc2 {...props} />
  </PhalaSharedContext.Provider>
}

function _PhalaPoc2 ({ className, basePath: basePathProp }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();

  const {
    pRuntimeEndpoint,
    accountId,
    keypair,
    ecdhChannel,
    setBasePath
  } = usePhalaShared() as PhalaSharedStruct;

  useEffect(() => { setBasePath && setBasePath(basePathProp) }, [setBasePath, basePathProp])

  return (
    <main className={className}>
      <Tabs
          basePath={basePathProp}
          hidden={(keypair && !keypair.isLocked) ? ['balances'] : ['assets', 'balances']}
          items={[
            {
              isRoot: true,
              name: 'items',
              text: t('浏览')
            },
            {
              name: 'list',
              text: t('发布')
            },
            // {
            //   name: 'orders',
            //   text: t('Orders')
            // },
            // {
            //   name: 'assets',
            //   text: t('Assets')
            // },
            // {
            //   name: 'balances',
            //   text: t('Balances')
            // },
            {
              name: 'settings',
              text: t('设置')
            }
          ]}
        />
      <Switch>
        <Route path={`${basePathProp}/balances`}>
          <BalancesTab
            accountId={accountId}
            ecdhChannel={ecdhChannel}
            pRuntimeEndpoint={pRuntimeEndpoint}
            keypair={keypair}
          />
        </Route>
        <Route path={`${basePathProp}/assets`}>
          <AssetsTab
            accountId={accountId}
            ecdhChannel={ecdhChannel}
            pRuntimeEndpoint={pRuntimeEndpoint}
            keypair={keypair}
          />
        </Route>
        <Route path={`${basePathProp}/settings`}>
          <Banner>
            <div className='box'>
              <div className='info'>
                <p><strong>Phala Network POC2测试网络</strong></p>
                <p>仅供测试。本测试网络可能随时会被重置。pRuntime当前运行于开发模式，因此无法保证其保密性。</p>
                <p>请先选择一个账户。</p>
              </div>
            </div>
          </Banner>
          <SettingsTab />
        </Route>
        <Route path={`${basePathProp}/list`} exact component={List} />
        
        <Route path={`${basePathProp}/list/orders/new/:value`} component={NewOrder} />
        
        <Route path={`${basePathProp}/list/result/:type/:value`} component={Result} />
        <Route component={Items} exact path={`${basePathProp}`} />
      </Switch>
    </main>
  );
}

export default PhalaPoc2;
