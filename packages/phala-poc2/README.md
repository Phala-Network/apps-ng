# @polkadot/app-phala-poc2

This is the web ui to demostrate Phala Network (pLIBRA) W3F Grant Milestone 2.

Live version: https://testnet.phala.network/

## Launch

### Preapare

1. Make sure you have yarn installed
2. Strart the blockchain and pRuntime. For the docker image, make sure the port 8080 is published.
3. Change config.ts to point it to the endopoint of pRuntime.
   - Docker default: `http://127.0.0.1:8080/tee-api/`
   - Standalone default: `http://127.0.0.1:8000/`

### Start

1. Start the frontend at the root of phala-polka-apps: `yarn start`
2. In the WebUI, change the Substrate endpoint in "Settings".
   - Docker defulat: `ws://127.0.0.1:8080/ws`
   - Standalone default: `ws://127.0.0.1:9944`

## Overview

```text
├── config.ts             Config (e.g. API endpoints)
├── index.tsx             Main page
├── pruntime              pRuntime API & utilites
│   ├── crypto            Cryptographic utilites
│   │   ├── aead.ts       WebCrypto AEAD-AES-GCM 128
│   │   ├── ecdh.ts       WebCrypto ECDH (secp256r1)
│   │   └── index.ts
│   ├── index.ts          PRuntime API class
│   └── models.ts         Structure definations
├── translate.ts
├── AccountSelector.tsx
├── Query.tsx
├── Summary.tsx
├── SummaryBar.tsx
├── Transfer.tsx
└── utils.ts
```

The demo implements a client for a `Balances`-like module in Phala Network as a confidential smart contract. It supports:

- Establish a secure e2e connection between the browser and the pRuntime inside TEE
- Submit cofidential transferring transaction to the blockchain
- Query the total issuance and the account balance
- Show the connection of pRuntime

For more details about Phala Network, please refer to *TODO*.

## PRuntime class

`PRuntime` handles the secure communication to pRuntime.

High level APIs:

- getInfo: returns a `GetInfoResp` to represent the status of pRuntime. The ECDH pubkey is also included to establish secure connection.
- query: send a query to the specified contract in pRuntime. An `EcdhChannel` is needed to encrypt the query.
- test: used to run various tests in pRuntime

## Send a query

A query is a read-only operation to a confidential contract. It doesn't affect the cotract states. Unlike other blockchains, Phala Network queries are optionally associated with an identity so that the contract can determine if the request is authoriized.

Query is e2e encrypted. So an ECDH channel is needed to initiate a query. Hers's an example to query the balance of an account:

```ts
cosnt api = new PRuntime();
// 1. Cretea an ECDH channel
let ch = await Crypto.newChannel();
// 2. Get the ECDH public key from pRumtime get_info api
const info = await API.getInfo();
// 3. Update the ECDH channel
ch = await Crypto.joinChannel(ch, info?.ecdhPublicKey);
// 4. Get the Substrate keypiar for the selected identity
//  const accountId = "<identity ss58 account id string>"
const keypair = keyring.getPair(accountId);
// 5. Send a query
//  const contractId = 2;
//  const targetAccount = "<query target ss58 account id string>";
const result: object = await api.query(contractId, {
  FreeBalance: {
    account: ss58ToHex(targetAccount)
  }
}, ch!, keypair!);
```

Note that as in Phala confidential contract, a query is signed by an identity. Therefore it makes it possible to only allow the owner of the account to access its balance. If you query with a wrong identity, you will get a `NotAuthorized` error.

In contrast, `TotalIssuance` is a public query. Any identity is accepted:

```ts
const result: object = await new PRuntime().query(
    contractId, 'TotalIssuance', ecdhChannel!, keypair!);
```

## Send a command

A command is a write-only operation to a confidential contract. It may cause a state transition. A command has to be sent to the blockchain first, and gets relayed to the confidential contract in the pRuntime. There's no response to a command.

The command is also e2e encrypted. So an ECDH channel is needed to initiate a command. Hers's an example to transfer the coins:

```ts
// Assume you already got an ECDHChannel as in the previous section
// 1. Create the transaction payload. Note that value is BN in string.
const obj = {
  Transfer: {
    dest: ss58ToHex(recipientId),
    value: amount.toString()
  }
};
// 2. Encrypt the payload
const cipher = await encryptObj(ecdhChannel, obj);
// 3. Convert the payload cipher to API format (JS's camelCase vs pRuntime's sname_case)
const apiCipher = toApi({Cipher: cipher});
// 4. Serialize the payload to JSON string
const payload = JSON.stringify(apiCipher);
// ... Then it's time to submit it to `execute.pushCommand` just as a regular Substrate tx
```

## Secure communication

The communication between the user and the confidential contract is e2e encrypted. This includes:

- the one-way channel (user -> blockchain -> contract) for commands, and
- the two-way channel (user <-> contract) for queries.

The encryption is made by AEAD-AES-GCM 256bits key + 128bits tagging. The secret key is derived from ECDH (secp256r1) key agreement. The client generates an ephemeral keypair each time it creates an ECDH channel. And the contract has it's own keypair that the public key available on the blockchain. The contract publie key and the local ephemeral keypair are sufficient to derive a secret key for AEAD encryption.

(Currently sinnce the RA is not enabled, we get the contract public key from pRuntime's `get_info` API directly. This will be changed soon.)

For more details, please refer to *TODO*.

