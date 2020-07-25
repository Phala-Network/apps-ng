// Copyright 2017-2020 @polkadot/apps authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useContext, useEffect } from 'react';
import { Status as StatusDisplay, StatusContext } from '@polkadot/react-components';
import { useAccounts, useApi, useCall } from '@polkadot/react-hooks';
import { stringToU8a } from '@polkadot/util';
import { xxhashAsHex } from '@polkadot/util-crypto';
import { useTranslation } from '@polkadot/apps/translate';
let prevEventHash;
function filterEvents(allAccounts, t, optionsAll, events) {
  const eventHash = xxhashAsHex(stringToU8a(JSON.stringify(events)));
  if (!optionsAll || !events || eventHash === prevEventHash) {
    return null;
  }
  prevEventHash = eventHash;
  return events
    .map(({ event: { data, method, section } }) => {
      if (section === 'balances' && method === 'Transfer') {
        const account = data[1].toString();
        if (allAccounts.includes(account)) {
          return {
            account,
            action: `${section}.${method}`,
            message: t('transfer received'),
            status: 'event'
          };
        }
      }
      else if (section === 'democracy') {
        const index = data[0].toString();
        return {
          action: `${section}.${method}`,
          message: t('update on #{{index}}', {
            replace: {
              index
            }
          }),
          status: 'event'
        };
      }
      return null;
    })
    .filter((item) => !!item);
}
function Status({ optionsAll }) {
  var _a;
  const { queueAction } = useContext(StatusContext);
  const { api, isApiReady } = useApi();
  const { allAccounts } = useAccounts();
  const { t } = useTranslation();
  const events = useCall(isApiReady && ((_a = api.query.system) === null || _a === void 0 ? void 0 : _a.events), []);
  useEffect(() => {
    const filtered = filterEvents(allAccounts, t, optionsAll, events);
    filtered && queueAction(filtered);
  }, [allAccounts, events, optionsAll, queueAction, t]);
  return (<StatusDisplay />);
}
export default React.memo(Status);
