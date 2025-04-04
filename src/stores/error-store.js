import {writable} from 'svelte/store'

/**
 * @import {Writable} from 'svelte/store'
 * @type {Writable<{code: number, message: string} | null>}
 */
export const error_store = writable(null)
