import {writable} from 'svelte/store'

export const ERROR_CODES = {
    'webcam_error': 1,
}

/**
 * @import {Writable} from 'svelte/store'
 * @type {Writable<{code: number, message: string} | null>}
 */
export const error_store = writable(null)
