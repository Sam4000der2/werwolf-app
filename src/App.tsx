import React from 'react'
import './App.css';
import packageInfo from '../package.json'

import Preparation from './components/Preparation';

import Deal from './components/Deal';
import { connect, ConnectedProps } from 'react-redux';
import Play from './components/Play';


const mapStateToProps = (state: RootState) => ({
  currentPage: state.ui.currentPage,
  themeMode: state.ui.themeMode,
})
const connector = connect(mapStateToProps)
const officialRepoURL = "https://github.com/kaktus42/werwolf-app"
const themeColorMetaSelector = 'meta[name="theme-color"]'

const App = ({ currentPage, themeMode }: ConnectedProps<typeof connector>) => {
  React.useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const media = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null
    const themeColorMeta = document.querySelector<HTMLMetaElement>(themeColorMetaSelector)
    const applyTheme = () => {
      const useDarkTheme = themeMode === "dark" || (themeMode === "system" && Boolean(media?.matches))
      const activeTheme = useDarkTheme ? "dark" : "light"
      document.documentElement.setAttribute("data-theme", activeTheme)
      document.documentElement.style.colorScheme = activeTheme

      const browserThemeColor = window.getComputedStyle(document.documentElement)
        .getPropertyValue("--browser-theme-color")
        .trim()
      if (themeColorMeta && browserThemeColor.length > 0) {
        themeColorMeta.setAttribute("content", browserThemeColor)
      }
    }

    applyTheme()

    if (themeMode !== "system" || !media) {
      return
    }

    const handleSystemThemeChange = () => applyTheme()
    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", handleSystemThemeChange)
      return () => media.removeEventListener("change", handleSystemThemeChange)
    }

    media.addListener(handleSystemThemeChange)
    return () => media.removeListener(handleSystemThemeChange)
  }, [themeMode])

  let content
  switch (currentPage) {
    case 'prepare':
      content = <Preparation />
      break
    case 'deal':
      content = <Deal />
      break
    case 'play':
      content = <Play />
      break
    default:
      content = <p>Not implemented</p>
      break
  }

  return (
    <div className="appShell">
      {content}
      <footer className="appFooter">
        Version {packageInfo.version} · <a href={officialRepoURL} target="_blank" rel="noopener noreferrer">Offizielles Repo</a>
      </footer>
    </div>
  )
}

export default connector(App);
