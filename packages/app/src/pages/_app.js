import App from "next/app"
import { ThemeProvider } from "styled-components"
import GlobalStyle from '@/utils/GlobalStyle'

import 'mobx-react-lite/batchingForReactDom'

const theme = {}

export default class MyApp extends App {
  render() {
    const { Component, pageProps } = this.props
    return (
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <Component {...pageProps} />
      </ThemeProvider>
    )
  }
}
