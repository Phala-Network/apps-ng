import App from "next/app"
import { ThemeProvider } from "styled-components"
import GlobalStyle from '@/utils/style'
import { useTheme, ZeitProvider } from '@zeit-ui/react'
import darkTheme from '@zeit-ui/react/styles/themes/dark'
import 'mobx-react-lite/batchingForReactDom'

const zeitUiTheme = {
  ...darkTheme,
  font: {
    mono: 'Recursive, Menlo, Monaco, Lucida Console, Liberation Mono, DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace',
    sans: 'Recursive, -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif'
  }
}
delete zeitUiTheme.type

const WrappedApp = ({ children }) => {
  const theme = useTheme()

  return <ThemeProvider theme={theme}>
    {children}
  </ThemeProvider>
}

export default class MyApp extends App {
  render() {
    const { Component, pageProps } = this.props
    return <ZeitProvider theme={zeitUiTheme}>
      <WrappedApp>
        <GlobalStyle />
        <Component {...pageProps} />
      </WrappedApp>
    </ZeitProvider>
  }
}
