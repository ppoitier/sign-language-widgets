import { mount } from 'svelte'
import './global.css'

/** @typedef {import('svelte').mount} Component */

import App from './app.svelte'

/** @type {Element | null} */
const target_elem = document.getElementById('app')
if (!target_elem) {
  throw new Error('Element target not found')
}


const app = mount(App, {
  target: target_elem,
})

export default app
