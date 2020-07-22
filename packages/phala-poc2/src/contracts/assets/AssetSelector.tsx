import React, { useState } from 'react';
import styled from 'styled-components';
import { Accordion, Icon } from 'semantic-ui-react'
import BN from 'bn.js';

import { BareProps } from '@polkadot/react-components/types';
import { Dropdown, Modal, InputBalance, Input, Button, TxButton } from '@polkadot/react-components';
import { KeyringPair } from '@polkadot/keyring/types';
import { formatBalance } from '@polkadot/util';

import Summary from '../../Summary';
import PRuntime, { encryptObj } from '../../pruntime';
import {EcdhChannel} from '../../pruntime/crypto';
import { useTranslation } from '../../translate';

import * as Models from './models';
import { toApi } from '../../pruntime/models';
import { ss58ToHex } from '../../utils';

interface Props extends BareProps {
  contractId: number;
  accountId: string | null;
  ecdhChannel: EcdhChannel | null;
  pRuntimeEndpoint: string;
  onChange: (asset: Models.AssetMetadata) => void;
  keypair: KeyringPair | null;
}

const mockMetadata: Models.MetadataResp = { metadata: [] };

function formatAssetBalance (asset: Models.AssetMetadata) {
  const formatted = formatBalance(
    asset.totalSupply, { withSi: true, withUnit: asset.symbol });
  const m = formatted.match(/(\d+\.?)(\d+)(\w?( \w+)?)/)!;
  return (
  <>
      {m[1]}<BalancePostfixSpan className='balance-postfix'>{(m[2]+'000').slice(0, 3)}</BalancePostfixSpan>{m[3]}
  </>);
}

type MetadataQueryResult = {Metadata: Models.MetadataResp};

interface AssetOption {
  text: string;
  value: number;
}

const MetadataDetailContainer = styled.div`
  margin-left: 29px;
  margin-top: 5px;
  pre {
    overflow: scroll;
    max-height: 200px;
  }
`;

const BalancePostfixSpan = styled.span`
  color: rgba(78, 78, 78, .4);
`;

function AssetSelector ({ contractId, accountId, ecdhChannel, pRuntimeEndpoint, onChange, keypair}: Props): React.ReactElement<Props> {
  const { t } = useTranslation();

  const [queryResult, setQueryResult] = useState<MetadataQueryResult | null>({
    Metadata: mockMetadata
  });

  async function queryMetadata() {
    const result: object = await new PRuntime(pRuntimeEndpoint).query(
      contractId, 'Metadata', ecdhChannel!, keypair!);
    console.log(1111, result)
    setQueryResult(result as MetadataQueryResult);
  }

  React.useEffect(() => {
    if (!keypair || keypair.isLocked || !ecdhChannel || !ecdhChannel.core.agreedSecret || !ecdhChannel.core.remotePubkey) {
      return;
    }
    queryMetadata();
  }, [keypair, ecdhChannel])

  const [assetId, setAssetId] = useState<number | null>(null);

  function findAsset(result: Models.MetadataResp, id: number): Models.AssetMetadata | null {
    return result.metadata.find(m => m.id == id) || null;
  }
  function selectedAsset(): Models.AssetMetadata | null {
    return queryResult && assetId != null && findAsset(queryResult.Metadata, assetId) || null;
  }
  function selectedIsMine(): boolean {
    if (!accountId) {
      return false;
    }
    const pubkey = ss58ToHex(accountId);
    return selectedAsset()?.owner == pubkey || false;
  }

  function internalOnChange(i: number | null) {
    if (i == null) {
      return;
    }
    setAssetId(i);
    console.log(queryResult, i);
    const asset = findAsset(queryResult!.Metadata, i)!;
    onChange(asset);
  }

  const [expanded, setExpanded] = useState([false, false]);
  function toggleExpanded(i: number) {
    const v = [...expanded];
    v[i] = !expanded[i];
    setExpanded(v);
  }

  async function createCommand (obj: any): Promise<string> {
    if (!ecdhChannel) {
      return '';
    }
    console.log('obj', obj)
    const cipher = await encryptObj(ecdhChannel, obj);
    const apiCipher = toApi(cipher);
    return JSON.stringify({Cipher: apiCipher});
  }

  // Issue Dialog

  const [issueOpen, setIssueOpen] = useState(false);
  const [{isSymbolValid, symbol}, setSymbol] = useState({isSymbolValid: false, symbol: ''});
  const [totalSupply, setTotalSupply] = useState<BN | undefined>();
  const [commandIssue, setCommandIssue] = useState('');

  function validateSymbol (val: string) {
    if (!val.toLowerCase().match(/^[a-z]+$/)) {
      return 'bad-symbol';
    }
    if (val.length <= 2) {
      return 'too-short';
    }
    if (val.length > 9) {
      return 'too-long';
    }
    if (queryResult?.Metadata.metadata) {
      const tokens = queryResult.Metadata.metadata;
      if (tokens.find(t => t.symbol.toLowerCase() == val.toLowerCase())) {
        return 'conflict-symbol';
      }
    }
    return 'valid';
  }
  function _onChangeSymbol (symbol: string) {
    symbol = symbol.trim().toUpperCase();
    const valid = validateSymbol(symbol);
    console.log('symbol', symbol, valid);
    const isSymbolValid = (valid == 'valid');
    setSymbol({isSymbolValid, symbol});
  }
  React.useEffect(() => {
    if (!isSymbolValid || !totalSupply) {
      setCommandIssue('');
      return;
    }
    (async () => {
      const cmd = await createCommand({
        Issue: {
          symbol,
          total: totalSupply?.toString(),
        }
      });
      setCommandIssue(cmd);
    })();
  }, [isSymbolValid, symbol, totalSupply, ecdhChannel]);

  // Destroy Dialog

  const [destroyOpen, setDestroyOpen] = useState(false);
  const [commandDestroy, setCommandDestroy] = useState('');
  React.useEffect(() => {
    if (assetId == null) {
      setCommandDestroy('');
      return;
    }
    (async () => {
      const cmd = await createCommand({
        Destroy: {
          id: assetId
        }
      });
      setCommandDestroy(cmd);
    })();
  }, [assetId, ecdhChannel]);

  function onSearch(data: AssetOption[], query: string): AssetOption[] {
    const lowerQuery = query.toLowerCase();
    return data.filter((data: AssetOption): boolean =>
      data.text.toLowerCase().indexOf(lowerQuery) >= 0
    );
  }

  return (
    <section>
      <div className='ui--row'>
        <div className='large'>

          <Dropdown
            // className='medium'
            help={t('Select an issued asset on the blockchain')}
            isDisabled={!(queryResult?.Metadata?.metadata)}
            label={t('Select asset')}
            options={
              queryResult?.Metadata?.metadata.map((a: Models.AssetMetadata): AssetOption => ({
                text: a.symbol,
                value: a.id
              })) || []
            }
            onSearch={onSearch}
            onChange={internalOnChange}
            value={assetId}

            labelExtra={
              <>
              {<label>{t('total supply')}</label>}
              {queryResult && assetId != null
               && formatAssetBalance(selectedAsset()!)
               || '-'}
              </>
            }
          />

          <MetadataDetailContainer>
            <Accordion fluid styled className='metadata-details'>
              <Accordion.Title
                active={expanded[0]}
                index={0}
                onClick={() => toggleExpanded(0)}
              >
                <Icon name='dropdown' /> Assets Metadata
              </Accordion.Title>
              <Accordion.Content active={expanded[0]}>
                <pre>{JSON.stringify(queryResult, undefined, 2)}</pre>
              </Accordion.Content>
              <Accordion.Title
                active={expanded[1]}
                index={1}
                onClick={() => toggleExpanded(1)}
              >
                <Icon name='dropdown' /> Operations
              </Accordion.Title>
              <Accordion.Content active={expanded[1]}>
                <Button
                  icon='plus'
                  onClick={() => setIssueOpen(true)}
                >
                  create token
                </Button>
                <Button
                  icon='trash'
                  onClick={() => setDestroyOpen(true)}
                  isDisabled={!selectedIsMine()}
                >
                  destroy token
                </Button>
              </Accordion.Content>
            </Accordion>
          </MetadataDetailContainer>
        </div>
        <Summary className='small'>Select an asset or issue your own asset.</Summary>
      </div>

      {issueOpen && (
        <Modal
          header={t('Create Token')}
          size='small'
        >
          <Modal.Content>
            <Input
              className='full'
              help={t('Enter the symbol of the token you will create.')}
              isError={!isSymbolValid}
              label={t('symbol')}
              onChange={_onChangeSymbol}
              value={symbol}
            />
            <InputBalance
              label={t('total supply')}
              onChange={setTotalSupply}
              tokenUnit={symbol || 'Unit'}
            />
          </Modal.Content>
          <Modal.Actions onCancel={() => {setIssueOpen(false)}}>
            <TxButton
              isDisabled={!isSymbolValid || !totalSupply || !commandIssue}
              accountId={accountId}
              icon='paper-plane'
              label={t('Submit')}
              params={[contractId, commandIssue]}
              tx='phalaModule.pushCommand'
              onSuccess={() => {setIssueOpen(false)}}
            />
          </Modal.Actions>
        </Modal>
      )}

      { destroyOpen && (
        <Modal
          header={t('Destroy Token')}
          open={destroyOpen}
          size='small'
        >
          <Modal.Content>
            <p>I confirm to destroy my token '{selectedAsset()?.symbol}' (asset id: {selectedAsset()?.id})</p>
          </Modal.Content>
          <Modal.Actions onCancel={() => {setDestroyOpen(false)}}>
            <TxButton
              isDisabled={!commandDestroy}
              accountId={accountId}
              icon='paper-plane'
              label={t('Confirm')}
              params={[contractId, commandDestroy]}
              tx='phalaModule.pushCommand'
              onSuccess={() => {setDestroyOpen(false)}}
            />
          </Modal.Actions>
        </Modal>
      )}
    </section>
  );
}

export default AssetSelector;