# Experimental Apps for Phala Network

## Preparation

To install dependencies:
```bash
yarn install
```

Make sure you have node.js >= v12 and yarn 2 installed.

## Development

To start a development server at `http://localhost:3000`:
```bash
yarn dev
```

To build a production release:
```bash
yarn build
```

To start a production server with the release built:
```bash
yarn start
```

To export the production release built for static deployment:
```bash
yarn workspace @phala/app exec next export
```
And the output should be found in `packages/app/out`.

## Release

Please follow the above instructions to build a production ready frontend. There are some
additional environment variables to control the default API endpoints:

- `SUBSTRATE_API`: The Substrate websocket rpc endpoint (default: `ws://localhost:9944`)
- `PRUNTIME_API`: The pRuntime (TEE Encalve) http rpc endponint (default: `http://localhost:8000`)
- `APP_PHALA_URL`: This variable overrides the above two. It's equivalent to the following
   set up (default: "")
   ```bash
   SUBSTRATE_API="wss://${APP_PHALA_URL}/ws"
   PRUNTIME_API="https://${APP_PHALA_URL}/tee-api/"
   ```

For example, for Phala Network PoC-3, we build with:

```bash
APP_PHALA_URL=poc3.phala.network yarn build
```
