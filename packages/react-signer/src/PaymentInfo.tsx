// Copyright 2017-2021 @polkadot/react-signer authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SubmittableExtrinsic } from '@polkadot/api/promise/types';
import type { DeriveBalancesAll } from '@polkadot/api-derive/types';
import type { RuntimeDispatchInfo } from '@polkadot/types/interfaces';

import BN from 'bn.js';
import React, { useEffect, useState } from 'react';
import { Description } from "@zeit-ui/react";

import { useApi, useCall, useIsMountedRef } from '@polkadot/react-hooks';
import { formatBalance, isFunction } from '@polkadot/util';

import { useTranslation } from './translate';

interface Props {
  accountId?: string | null;
  className?: string;
  extrinsic?: SubmittableExtrinsic | null;
  isSendable: boolean;
  onChange?: (hasAvailable: boolean) => void;
  tip?: BN;
}

function PaymentInfo ({ accountId, className = '', extrinsic }: Props): React.ReactElement<Props> | null {
  const { t } = useTranslation();
  const { api } = useApi();
  const [dispatchInfo, setDispatchInfo] = useState<RuntimeDispatchInfo | null>(null);
  const balances = useCall<DeriveBalancesAll>(api.derive.balances.all, [accountId]);
  const mountedRef = useIsMountedRef();

  useEffect((): void => {
    accountId && extrinsic && isFunction(extrinsic.paymentInfo) &&
      setTimeout((): void => {
        try {
          extrinsic
            .paymentInfo(accountId)
            .then((info) => mountedRef.current && setDispatchInfo(info))
            .catch(console.error);
        } catch (error) {
          console.error(error);
        }
      }, 0);
  }, [api, accountId, extrinsic, mountedRef]);

  if (!dispatchInfo || !extrinsic) {
    return null;
  }

  return (
    <Description title="fees for submission" content={formatBalance(dispatchInfo.partialFee, { withSiFull: true })} />
  );
}

export default React.memo(PaymentInfo);
