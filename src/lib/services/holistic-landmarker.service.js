/**
 * @typedef {import('@mediapipe/tasks-vision').HolisticLandmarkerResult} HolisticLandmarkerResult
 *
 * @typedef {Object} FrameInfo
 * @property {number} frame_time - Time of the processed frame in the video, in seconds.
 * @property {number} inference_ms - Time taken by the model on this frame, in milliseconds.
 * @property {number} pending - Frames sent to the model and not processed yet (only grows with `every_frame`).
 *
 * @typedef {Object} ModelLoading
 * @property {'downloading' | 'initializing'} step - Reading the model file (from the network, or the cache), then preparing it.
 * @property {number} loaded - Bytes of the model read so far.
 * @property {number} total - Size of the model in bytes, 0 if unknown.
 *
 * @typedef {Object} HolisticLandmarkerOptions
 * @property {(result: HolisticLandmarkerResult, info: FrameInfo) => void} on_result - Called with the landmarks of each processed frame.
 * @property {(loading: ModelLoading) => void} [on_loading] - Called as the model loads, until `ready`.
 * @property {(error: Error) => void} [on_error] - Called when a frame can't be processed (after `ready`).
 * @property {boolean} [every_frame=false] - If false, frames are skipped while the model is busy, so results stay live. If true, every frame is queued: none is missed, but results lag behind (and the queue, in memory, grows) when the model is slower than the video.
 * @property {string} [model_url] - URL of the `.task` model. Defaults to Google's float16 holistic landmarker.
 * @property {'GPU' | 'CPU'} [delegate='GPU'] - Where the model runs. Falls back to the CPU when the GPU is unavailable.
 *
 * @typedef {Object} HolisticLandmarking
 * @property {Promise<{ delegate: 'GPU' | 'CPU' }>} ready - Resolves once the model is loaded, with the delegate actually used. Rejects if it can't be loaded.
 * @property {() => void} stop - Stops processing frames and releases the model (queued frames are dropped).
 */

const MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/holistic_landmarker/holistic_landmarker/float16/1/holistic_landmarker.task'
// Keep in sync with the installed `@mediapipe/tasks-vision` version.
const WASM_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.2.0/wasm'

/**
 * Detects face, pose and hand landmarks on the frames of a video (e.g. the `video_element` of
 * `WebcamPreview`). The model runs in a web worker, and is downloaded once (then cached).
 * By default, frames are skipped while the previous one is processed, so results never lag behind;
 * with `every_frame`, all of them are processed, in order.
 *
 * ```js
 * const landmarking = start_holistic_landmarker(video, { on_result: result => draw(result) })
 * await landmarking.ready
 * landmarking.stop() // Later on.
 * ```
 *
 * @param {HTMLVideoElement} video
 * @param {HolisticLandmarkerOptions} options
 * @returns {HolisticLandmarking}
 */
export function start_holistic_landmarker(video, { on_result, on_loading, on_error, every_frame = false, model_url = MODEL_URL, delegate = 'GPU' }) {
    const worker = new Worker(new URL('./holistic-landmarker.worker.js', import.meta.url), { type: 'module' })
    let is_ready = false
    let stopped = false
    /** Frames sent to the worker and not answered yet. */
    let pending = 0
    let last_timestamp = -1
    /** @type {number | undefined} */
    let frame_request

    /** @type {Promise<{ delegate: 'GPU' | 'CPU' }>} */
    const ready = new Promise((resolve, reject) => {
        worker.onmessage = ({ data }) => {
            if (data.type === 'loading') {
                on_loading?.({ step: data.step, loaded: data.loaded, total: data.total })
            } else if (data.type === 'ready') {
                is_ready = true
                resolve({ delegate: data.delegate })
                request_frame()
            } else if (data.type === 'result') {
                pending--
                on_result(data.result, { frame_time: data.frame_time, inference_ms: data.inference_ms, pending })
            } else if (data.type === 'error') {
                const error = new Error(data.message)
                if (!is_ready) return reject(error)
                if (pending > 0) pending--
                on_error?.(error)
            }
        }
        worker.onerror = event => reject(new Error(event.message || 'Holistic landmarker worker failed'))
    })

    function request_frame() {
        if (!stopped) frame_request = video.requestVideoFrameCallback(on_frame)
    }

    /**
     * @param {DOMHighResTimeStamp} _now
     * @param {VideoFrameCallbackMetadata} metadata
     */
    async function on_frame(_now, metadata) {
        request_frame()
        // Skip the frame when the video has no image yet, or while the worker is busy (unless `every_frame`).
        if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return
        if (!every_frame && pending > 0) return
        pending++
        try {
            const bitmap = await createImageBitmap(video)
            if (stopped) return bitmap.close()
            // VIDEO mode requires strictly increasing timestamps.
            const timestamp_ms = Math.max(performance.now(), last_timestamp + 1)
            last_timestamp = timestamp_ms
            worker.postMessage({ type: 'detect', bitmap, timestamp_ms, frame_time: metadata.mediaTime }, [bitmap])
        } catch (error) {
            pending--
            on_error?.(/** @type {Error} */ (error))
        }
    }

    worker.postMessage({ type: 'init', model_url, wasm_url: WASM_URL, delegate })

    return {
        ready,
        stop() {
            stopped = true
            if (frame_request !== undefined) video.cancelVideoFrameCallback(frame_request)
            // Terminating the worker also releases the model, its GPU context and the queued frames.
            worker.terminate()
        },
    }
}
