import { useEffect, useState } from 'react'
import { createGlobalStyle } from 'styled-components'
import { CssBaseline, useMediaQuery } from '@zeit-ui/react'
import Head from 'next/head'
// import PolkadotStyle from '@polkadot/react-components/styles'
import * as constants from './constants'

const GlobalStyle = createGlobalStyle`
  body, html {
    padding: 0;
    margin: 0;
    ${({ isMobile }) => !isMobile && `
      min-width: ${constants.PAGE_MIN_WIDTH}px;
    `}
  }
  
  html {
    overflow-x: auto;
  }

  * {
    box-sizing: border-box;
  }
  
  #__next {
    ${({ isMobile }) => !isMobile && `
      min-width: ${constants.PAGE_MIN_WIDTH}px;
    `}
    overflow-x: auto;
    min-height: 100vh;
  }

  #zeit-ui-modal .content footer button.btn {
    min-width: unset;
  }

  #zeit-ui-modal .content .wrapper {
    max-width: calc(100vw - 24px);
  }
`

export default () => {
  const isMobile = useMediaQuery('mobile')
  const [width, setWidth] = useState('device-width')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleWidth = () => {
        setWidth(screen.width <= 1024 ? 1024 : 'device-width')
      }
      handleWidth()
      window.addEventListener('resize', handleWidth)
      return () => window.removeEventListener('resize', handleWidth)
    }
  }, [])

  return <>
    {/* <PolkadotStyle uiHighlight="#469c22" /> */}
    <GlobalStyle isMobile={isMobile} />
    <CssBaseline />
    <Head>
      {/* <link rel="stylesheet" href="//cdn.jsdelivr.net/npm/@fortawesome/fontawesome-svg-core@1.2.30/styles.css"/> */}
      {/* <link rel="stylesheet" href="//cdn.jsdelivr.net/npm/semantic-ui@2.4.2/dist/semantic.min.css"/> */}
      <link rel="stylesheet" href="//fonts.loli.net/css2?family=Recursive:wght@400;600&display=swap" />
      <meta
        name="viewport"
        content={`width=${isMobile ? 'device-width' : width}`}
      />
    </Head>
  </>
}