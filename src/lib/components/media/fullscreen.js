import { createSubscriber } from 'svelte/reactivity'
import { on } from 'svelte/events'

const subscribe = createSubscriber(update => on(document, 'fullscreenchange', update))

/**
 * Reactive: reading it in a `$derived` or the template updates on every fullscreen change.
 * @returns {Element | null} The element currently in fullscreen, if any.
 */
export function get_fullscreen_element() {
    if (typeof document === 'undefined') return null
    subscribe()
    return document.fullscreenElement
}

/**
 * Leaves fullscreen if it is active, otherwise puts `element` in fullscreen.
 * @param {Element} element
 */
export async function toggle_fullscreen(element) {
    if (document.fullscreenElement) {
        await document.exitFullscreen()
    } else {
        await element.requestFullscreen()
    }
}
