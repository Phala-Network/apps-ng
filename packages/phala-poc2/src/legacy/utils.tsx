import React from 'react';
import styled from 'styled-components';
import { Grid, Table } from 'semantic-ui-react';

import Unixfs from 'ipfs-unixfs';
import { DAGNode } from 'ipld-dag-pb';
import multihashing from 'multihashing';
import CID from 'cids'

export function genTablePreview (header: Array<string> | null, rows: Array<Array<string>> | null): React.ReactElement {
  if (!header || !rows) {
    return (<div>暂无预览</div>);
  }
  rows = rows.filter(r => r.length == header.length);
  return (
    <Table celled>
      <Table.Header>
        <Table.Row>
          {header.map((h, idx) => (<Table.HeaderCell key={idx}>{h}</Table.HeaderCell>))}
        </Table.Row>
      </Table.Header>

      <Table.Body>{
        rows.map((r, ridx) => (
          <Table.Row key={ridx}>{
            r.map((v, vidx) => (
              <Table.Cell key={vidx}>{v}</Table.Cell>
            ))
          }</Table.Row>
        ))
      }</Table.Body>
    </Table>
  )
}

export function genDataLabel (name: string, value: string | React.ReactElement, rightClassName: string = '') {
  return (
    <Grid>
      <Grid.Column width={5}>{name}</Grid.Column>
      <Grid.Column width={11} className={rightClassName}>{value}</Grid.Column>
    </Grid>
  )
}

export function genDataLabels (dict: Array<[string, string]>) {
  return <Table celled padded fixed>
    <Table.Body>
      {dict.map(([k, v], idx) => (
        <Table.Row key={idx}>
          <Table.Cell>{k}</Table.Cell>
          <Table.Cell>{v}</Table.Cell>
        </Table.Row>
      ))}
    </Table.Body>
  </Table>
}

const uploaderGetColor = (props: any) => {
  if (props.isDragAccept) {
      return '#00e676';
  }
  if (props.isDragReject) {
      return '#ff1744';
  }
  if (props.isDragActive) {
      return '#2196f3';
  }
  return '#eeeeee';
}

export const UploadContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 20px;
  border-width: 2px;
  border-radius: 2px;
  border-color: ${props => uploaderGetColor(props)};
  border-style: dashed;
  background-color: #fafafa;
  color: #bdbdbd;
  outline: none;
  transition: border .24s ease-in-out;
  margin-bottom: 10px;
`;

function readFileAsync(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    let reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  })
}

export function readTextFileAsync(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    let reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.onerror = reject;
    reader.readAsText(file);
  })
}

export async function fileToIpfsPath (file: File): Promise<string> {
  const arrayBuff = await readFileAsync(file);
  const buffer = Buffer.from(arrayBuff);
  const unixFs = new Unixfs('file', buffer);
  const node = new DAGNode(unixFs.marshal());
  const serialized = new Uint8Array(node.serialize());
  const hash = multihashing(serialized, 'sha2-256');
  const cid = new CID(0, 'dag-pb', hash);
  
  return '/ipfs/' + cid;
}

export const accountToPubkey: {[key: string]: string} = {
  // alice
  '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY': 'd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d',
  // bob
  '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty': '8eaf04151687736326c9fea17e25fc5287613693c912909cb226aa4794f26a48',
}

export const pubkeyToAccount: {[key: string]: string} = {
  // alice
  'd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d': '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
  // bob
  '8eaf04151687736326c9fea17e25fc5287613693c912909cb226aa4794f26a48': '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
}

export const pubkeyToCompany: {[key: string]: string} = {
  // alice
  'd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d': '烧钱的独角兽',
  // bob
  '8eaf04151687736326c9fea17e25fc5287613693c912909cb226aa4794f26a48': 'Zuckbook Inc',
}

export function isSamePerson(accountId: string, pubkey: string): boolean {
  return accountToPubkey[accountId] == pubkey;
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

