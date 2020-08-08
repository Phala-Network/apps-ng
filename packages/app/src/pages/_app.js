import App from "next/app"
import { ThemeProvider } from "styled-components"
import GlobalStyle from '@/utils/style'
import { useTheme, ZeitProvider, useMediaQuery } from '@zeit-ui/react'
import darkTheme from '@zeit-ui/react/styles/themes/dark'
import 'mobx-react-lite/batchingForReactDom'
import { useCallback } from "react"

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

const _App = ({ Component, pageProps }) => {
  const isMobile = useMediaQuery('mobile')
  const theme = useCallback(() => ({
    ...zeitUiTheme,
    isMobile
  }), [zeitUiTheme])

  return <ZeitProvider theme={theme}>
    <WrappedApp>
      <GlobalStyle />
      <Component {...pageProps} />
    </WrappedApp>
  </ZeitProvider>
}

export default class MyApp extends App {
  render() {
    return <_App {...this.props} />
  }
}
