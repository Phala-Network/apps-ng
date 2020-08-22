import App from "next/app"
import { ThemeProvider } from "styled-components"
import GlobalStyle from '@/utils/style'
import { useTheme, ZeitProvider, useMediaQuery } from '@zeit-ui/react'
import darkTheme from '@zeit-ui/react/styles/themes/dark'
import 'mobx-react-lite/batchingForReactDom'
import { useCallback } from "react"
import { appWithTranslation } from '@/utils/i18n'

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
  const isXS = useMediaQuery('xs')
  const isSM = useMediaQuery('sm')
  const isMD = useMediaQuery('md')
  const isLG = useMediaQuery('lg')
  const isXL = useMediaQuery('xl')

  const theme = useCallback(() => ({
    ...zeitUiTheme,
    isMobile,
    isXS,
    isSM,
    isMD,
    isLG,
    isXL,
    mediaQueryMatch: `${isXS ? 'xs' : '' }${isSM ? 'sm' : '' }${isMD ? 'md' : '' }${isLG ? 'lg' : '' }${isXL ? 'xl' : '' }`
  }), [
    zeitUiTheme,
    isMobile,
    isXS,
    isSM,
    isMD,
    isLG,
    isXL
  ])

  return <ZeitProvider theme={theme}>
    <WrappedApp>
      <GlobalStyle />
      <Component {...pageProps} />
    </WrappedApp>
  </ZeitProvider>
}

class PhalaApp extends App {
  render() {
    return <_App {...this.props} />
  }
}

export default appWithTranslation(PhalaApp)
