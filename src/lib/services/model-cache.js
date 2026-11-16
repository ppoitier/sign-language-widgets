// Models are downloaded once, then read back from the Cache API (keyed by URL).
// No DOM access: this module is also used by workers.
const CACHE_NAME = 'sign-language-widgets-models-v1'

/** @typedef {(loaded: number, total: number) => void} ProgressCallback - Bytes read so far, and the total (0 if unknown). */

/**
 * @returns {Promise<Cache | null>} The model cache, or `null` when the Cache API is unavailable
 * (insecure context, some private browsing modes).
 */
async function open_cache() {
    if (typeof caches === 'undefined') return null
    try {
        return await caches.open(CACHE_NAME)
    } catch (error) {
        console.warn('Model cache unavailable:', error)
        return null
    }
}

/**
 * Reads a response body, reporting the progress.
 * @param {Response} response
 * @param {ProgressCallback} [on_progress]
 * @returns {Promise<ArrayBuffer>}
 */
async function read_with_progress(response, on_progress) {
    if (!on_progress || !response.body) return response.arrayBuffer()
    const total = Number(response.headers.get('content-length')) || 0
    /** @type {Uint8Array[]} */
    const chunks = []
    let loaded = 0
    on_progress(loaded, total)
    // A reader rather than `for await`: Safari can't iterate streams.
    const reader = response.body.getReader()
    while (true) {
        const { done, value } = await reader.read()
        if (done) break
        chunks.push(value)
        loaded += value.byteLength
        on_progress(loaded, total)
    }
    const bytes = new Uint8Array(loaded)
    let offset = 0
    for (const chunk of chunks) {
        bytes.set(chunk, offset)
        offset += chunk.byteLength
    }
    return bytes.buffer
}

/**
 * Fetches a model file, from the cache when it was already downloaded.
 * Falls back to the network alone when the model can't be cached (e.g. quota exceeded).
 *
 * @param {string} url
 * @param {ProgressCallback} [on_progress] - Called as the model is read (from the network or the cache).
 * @returns {Promise<ArrayBuffer>}
 */
export async function fetch_model(url, on_progress) {
    const cache = await open_cache()
    const cached = await cache?.match(url)
    if (cached) return read_with_progress(cached, on_progress)

    const response = await fetch(url)
    if (!response.ok) {
        throw new Error(`Failed to download the model (HTTP ${response.status}): ${url}`)
    }
    // Written while the original body is read, so the progress follows the download.
    const cached_write = cache?.put(url, response.clone()).catch(error => console.warn('Model could not be cached:', error))
    const model = await read_with_progress(response, on_progress)
    await cached_write
    return model
}
