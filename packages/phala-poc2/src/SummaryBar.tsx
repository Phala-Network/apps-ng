/* eslint-disable @typescript-eslint/camelcase */
// Copyright 2017-2019 @polkadot/app-123code authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { DeriveStakingValidators } from '@polkadot/api-derive/types';
import { BareProps } from '@polkadot/react-components/types';
import { Balance, BlockNumber } from '@polkadot/types/interfaces';

import React from 'react';
import { Button as SButton, Icon } from 'semantic-ui-react';
import { SemanticICONS } from 'semantic-ui-react/dist/commonjs/generic';
import { IdentityIcon as _IdentityIcon, Table } from '@polkadot/react-components';
import { useApi, useCall } from '@polkadot/react-hooks';
import { formatBalance, formatNumber } from '@polkadot/util';

import styled from 'styled-components';


interface Props extends BareProps {
  pRuntimeEndpoint?: string,
  pRuntimeConnected?: boolean,
  pRuntimeLatency?: number,
  pRuntimeInitalized?: boolean,
  pRuntimeBlock?: number,
  pRuntimeECDHKey?: string,
  onChanged?: (val: string) => void;
}

interface EntryProps {
  icon: SemanticICONS;
  label: string;
  children?: React.ReactNode;
}
function Entry ({icon, label, children}: EntryProps): React.ReactElement<EntryProps> {
  return (
    <tr>
      <td><Icon name={icon} /> {label}</td>
      <td>{children}</td>
    </tr>
  );
}
const ParamsTable = styled(Table)`
  width: 100%;
  td .icon {
    margin-right: 10px;
  }
  td:nth-child(2) {
    text-align: right;
  }
  td .button {
    margin-left: 10px;
  }
`;

const IdentityIcon = styled(_IdentityIcon)`
  display: inline-block;
`;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function SummaryBar (props: Props,): React.ReactElement<Props> {
  const { api, systemChain, systemName, systemVersion } = useApi();
  const bestNumber = useCall<BlockNumber>(api.derive.chain.bestNumber, []);
  const bestNumberLag = useCall<BlockNumber>(api.derive.chain.bestNumberLag, []);
  const totalInsurance = useCall<Balance>(api.query.balances.totalIssuance, []);
  const validators = useCall<DeriveStakingValidators>(api.derive.staking?.validators, []);

  function handleSetting() {
    const newVal = prompt('Change pRuntime endpoint', props.pRuntimeEndpoint);
    if (newVal && props.onChanged) {
      props.onChanged(newVal.trim());
    }
  }

  return (
    <section className='ui--row'>
      <div className='large'>
        <h2>高级调试数据</h2>
        <summary>
          <h5>Substrate</h5>
          <ParamsTable header={[]}>
            <Entry icon='tty' label='node'>
              {systemName} v{systemVersion}
            </Entry>
            <Entry icon='chain' label='chain'>
              {systemChain}
            </Entry>
            <Entry icon='code' label='runtime'>
              {api.runtimeVersion.implName} v{api.runtimeVersion.implVersion.toString(10)}
            </Entry>
            <Entry icon='bullseye' label='best #'>
              {formatNumber(bestNumber)} ({formatNumber(bestNumberLag)} lag)
            </Entry>
            {validators && (
              <Entry icon='chess queen' label='validators'>{
                validators.validators.map((accountId, index): React.ReactNode => (
                  <IdentityIcon key={index} size={20} value={accountId} />
                ))
              }</Entry>
            )}
            <Entry icon='circle' label='total tokens'>
              {formatBalance(totalInsurance)}
            </Entry>
          </ParamsTable>
          <h5>pRuntime</h5>
          <ParamsTable header={[]}>
            <Entry icon='tty' label='pRuntime'>
              {props.pRuntimeEndpoint}
              <SButton icon size='tiny' onClick={handleSetting}>
                <Icon name='setting' />
              </SButton>
            </Entry>
            <Entry icon='signal' label='connected'>
              {props.pRuntimeConnected ? `(${Math.round(props.pRuntimeLatency!)}ms)` : 'no'}
            </Entry>
            {props.pRuntimeConnected && (
              <>
                <Entry icon='check circle' label='initlized'>
                  {props.pRuntimeInitalized ? 'yes' : 'no'}
                </Entry>
                <Entry icon='bullseye' label='synced'>
                  {props.pRuntimeBlock}
                </Entry>
                <Entry icon='key' label='ECDH key'>
                  {props.pRuntimeECDHKey?.substring(0, 32) + '...'}
                </Entry>
              </>
            )}
          </ParamsTable>
        </summary>
      </div>
    </section>
  );
}

// inject the actual API calls automatically into props
export default SummaryBar;
