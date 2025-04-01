import {writable} from 'svelte/store'

/**
 * @type {Writable<{code: int, message: str} | null>}
 */
export const error_store = writable(null)
