import { createGlobalStyle } from 'styled-components'
import Head from 'next/head'

const GlobalStyle = createGlobalStyle`
  body, html {
    padding: 0;
    margin: 0;
  }
`

export default () => <>
  <GlobalStyle />
  <Head>
    <link rel="stylesheet" href="//cdn.jsdelivr.net/npm/semantic-ui@2.4.2/dist/semantic.min.css" />
  </Head>
</>
