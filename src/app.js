import { mount } from 'svelte'
import './global.css'
// @ts-ignore
import App from './app.svelte'

const app = mount(App, {
  target: document.getElementById('app'),
})

export default app
