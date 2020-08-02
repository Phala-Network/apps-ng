import { useEffect, useState } from 'react'
import { createGlobalStyle } from 'styled-components'
import Head from 'next/head'

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
  
  .ui.modal .content .ui--Labelled-content {
    margin-bottom: 12px;
  }
  .ui.modal .content .labelExtra {
    padding-right: 30px;
  }
  
  .ui.modal .content .ui--Labelled-content .ui.input,
  .ui.modal .content .ui--Labelled-content .ui.search {
    width: calc(100% - 24px)
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
    <GlobalStyle/>
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