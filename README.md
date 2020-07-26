Experimental Apps for Phala Network
------

To install dependencies:
```bash
yarn install
```

To start a development server:
```bash
APP_PHALA_URL=dp.phala.network yarn dev
```

To build a production release:
```bash
APP_PHALA_URL=dp.phala.network yarn build
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