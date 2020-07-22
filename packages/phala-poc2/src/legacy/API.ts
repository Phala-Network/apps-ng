import axios from 'axios';

import { Item, Order } from './models'

const pruntime = axios.create({
  baseURL: 'http://172.20.20.211:8001/',
  timeout: 5000,
});

async function req(method: string, input: any) {
  const data = {
    input,
    nonce: { id: Math.floor(Math.random() * 65535) }
  };
  const resp = await pruntime.post(method, data);
  const payload = JSON.parse(resp.data.payload);
  if (resp.data.status == 'error') {
    console.error('req: received error', payload);
  }
  console.log('req received payload', payload)
  return payload;
}

async function query(request: string) {
  const result = await req('query', {'request': request});
  return result[request];
}

export async function getItems(): Promise<{items: Array<Item>}> {
  const result = await query('GetItems');
  return result;
}

export async function getItem(id: number): Promise<Item> {
  const result = await getItems();
  return result.items[id];
}

export async function getOrders(): Promise<{orders: Array<Order>}> {
  return await query('GetOrders');
}

export async function getOrder(id: number): Promise<Order> {
  const result = await getOrders();
  return result.orders[id];
}
