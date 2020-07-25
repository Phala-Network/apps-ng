import { useStore } from '@/store'
import { ss58ToHex } from '@phala/runtime'
import { Balance } from '@polkadot/react-components'
import { observer } from 'mobx-react'
import React from 'react'
import BN from 'bn.js'
// import Transfer from '../Transfer'
// import TransferToChain from '../TransferToChain'
// import Query from '../Query'

function Balances ({}) {
  const store = useStore()
  const queryPlan = [{
    query: 'TotalIssuance',
    buttons: [{
      props: {
        label: 'TotalIssuance',
        icon: 'money bill alternate outline',
        isPrimary: true,
        isNegative: false
      }
    }],
    bubble: {
      props: {
        label: 'total issuance',
        color: 'teal',
        icon: 'money bill alternate outline'
      },
      render (result) {
        return (<Balance balance={new BN(result.totalIssuance)} params={'dummy'}/>)
      }
    }
  }, {
    query: 'FreeBalance',
    buttons: [{
      props: {
        label: 'FreeBalance',
        icon: 'search',
        isPrimary: true,
        isNegative: false
      },
      getPayload () {
        return { account: ss58ToHex(accountId) }
      }
    }, {
      props: {
        label: 'FreeBalance for Bob',
        icon: 'search',
        isPrimary: false,
        isNegative: true
      },
      getPayload () {
        return { account: ss58ToHex('5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty') }
      }
    }],
    bubble: {
      props: {
        label: 'balance',
        color: 'yellow',
        icon: 'adjust'
      },
      render (result) {
        return (<Balance balance={new BN(result.balance)} params={'dummy'}/>)
      }
    }
  }]
  return (<>
    <h1>Balances</h1>
    <p><a onClick={() => console.log(store.walletRuntime.query(
      'Metadata',
      null,
      3
    )) }>query</a></p>
    {/*<Transfer assets={false} accountId={accountId} ecdhChannel={ecdhChannel}/>*/}
    {/*<TransferToChain assets={false} accountId={accountId} ecdhChannel={ecdhChannel}/>*/}
    {/*<Query contractId={2} plans={queryPlan}/>*/}
  </>)
}

export default observer(Balances)