import { useEffect, useState } from 'react'
import { createGlobalStyle } from 'styled-components'
import Head from 'next/head'
import PolkadotStyle from '@polkadot/react-components/styles'

const GlobalStyle = createGlobalStyle`
  body, html {
    padding: 0;
    margin: 0;
    min-width: 1280px;
  }
  
  html {
    overflow-x: auto;
  }
  
  #__next {
    min-width: 1280px;
    overflow-x: auto;
  }
`

export default () => {
  const [width, setWidth] = useState('device-width')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleWidth = () => {
        setWidth(screen.width <= 1280 ? 1280 : 'device-width')
      }
      handleWidth()
      window.addEventListener('resize', handleWidth)
      return () => window.removeEventListener('resize', handleWidth)
    }
  }, [])

  return <>
    <GlobalStyle />
    <PolkadotStyle uiHighlight="#469c22" />
    <Head>
      <link rel="stylesheet" href="//cdn.jsdelivr.net/npm/@fortawesome/fontawesome-svg-core@1.2.30/styles.css"/>
      <link rel="stylesheet" href="//cdn.jsdelivr.net/npm/semantic-ui@2.4.2/dist/semantic.min.css"/>
      <meta
        name="viewport"
        content={`width=${width}`}
      />
    </Head>
  </>
}