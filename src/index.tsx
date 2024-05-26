/* @refresh reload */
import { render } from 'solid-js/web'

import App from './App'

if (import.meta.env.DEV) {
    const scr = document.createElement('script')
    scr.onload = () => {
      // @ts-expect-error
      globalThis.eruda.init()
    }
    scr.src = '//cdn.jsdelivr.net/npm/eruda'
    document.head.append(scr)
}
const root = document.getElementById('root')

render(() => <App />, root as HTMLDivElement)
