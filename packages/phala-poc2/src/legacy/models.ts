import BN from 'bn.js';

export interface Item {
  id: number;
  seller: string;
  txref: TxRef;
  details: ItemDetals;
}

export interface ItemDetals {
  category: string;
  datasetLink: string;
  datasetPreview: string;
  description: string;
  name: string;
  price: {PerRow: {price: string}};
}

export interface Order {
  id: number;
  buyer: string;
  txref: TxRef;
  details: OrderDetails;
  state: OrderState;
}

export interface OrderDetails {
  itemId: number;
  queryLink: string;
}

export interface OrderState {
  dataReady: boolean;
  matchedRows: number;
  queryReady: boolean;
  resultPath: string;
  resultReady: boolean;
}

export interface TxRef {
  blocknum: number;
  index: number;
}

export interface CsvTablePreview {
  header: Array<string> | null;
  rows: Array<Array<string>> | null;
}

const decimals = new BN("100000000000000"); // 1e14
const b100 = new BN("100");
export function fmtAmount(amount: string) {
   const bigamount = new BN(amount)
   return bigamount.mul(b100).div(decimals).toNumber() / 100;
}

export function amountFromNL(amount_nl: number): string {
  return new BN(amount_nl * 100).mul(decimals).div(b100).toString();
}

export function defaultItem (): Item {
  return {
    id: 0,
    seller: '',
    txref: { blocknum: 0, index: 0},
    details: {
      category: 'null',
      datasetLink: '/null',
      datasetPreview: '',
      description: '',
      name: '',
      price: {PerRow: {price: '0'}},
    },
  };
}

export function defaultOrder (): Order {
  return {
    id: 0,
    buyer: '',
    txref: { blocknum: 0, index: 0},
    details: {
      itemId: 0,
      queryLink: '/null'
    },
    state: {
      dataReady: false,
      matchedRows: 0,
      queryReady: false,
      resultPath: '/null',
      resultReady: false,
    }
  };
}
