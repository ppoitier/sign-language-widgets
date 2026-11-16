// Runs MediaPipe's holistic landmarker off the main thread (see `holistic-landmarker.service.js`).
import { FilesetResolver, HolisticLandmarker } from '@mediapipe/tasks-vision'
import { fetch_model } from './model-cache.js'

/** @type {HolisticLandmarker | undefined} */
let landmarker

/**
 * @param {string} wasm_url
 * @param {ArrayBuffer} model
 * @param {'GPU' | 'CPU'} delegate
 */
async function create_landmarker(wasm_url, model, delegate) {
    // `true`: load the ES module build of the wasm (module workers have no `importScripts`).
    const fileset = await FilesetResolver.forVisionTasks(wasm_url, true)
    const created = await HolisticLandmarker.createFromOptions(fileset, {
        baseOptions: { modelAssetBuffer: new Uint8Array(model), delegate },
        runningMode: 'VIDEO',
    })
    // The GPU setup is lazy (on the first detection): warm up on a blank frame, so `ready` means
    // inferences run right away, and a GPU failing only now still falls back to the CPU.
    // Timestamp 0 stays below the `performance.now()` timestamps of the real frames.
    try {
        created.detectForVideo(new OffscreenCanvas(64, 64), 0)
    } catch (error) {
        created.close()
        throw error
    }
    return created
}

self.onmessage = async ({ data }) => {
    try {
        if (data.type === 'init') {
            const model = await fetch_model(data.model_url, (loaded, total) => {
                self.postMessage({ type: 'loading', step: 'downloading', loaded, total })
            })
            self.postMessage({ type: 'loading', step: 'initializing', loaded: model.byteLength, total: model.byteLength })
            let delegate = data.delegate
            try {
                landmarker = await create_landmarker(data.wasm_url, model, delegate)
            } catch (error) {
                if (delegate !== 'GPU') throw error
                console.warn('GPU delegate unavailable, falling back to CPU:', error)
                delegate = 'CPU'
                landmarker = await create_landmarker(data.wasm_url, model, delegate)
            }
            self.postMessage({ type: 'ready', delegate })
        } else if (data.type === 'detect') {
            /** @type {ImageBitmap} */
            const bitmap = data.bitmap
            try {
                if (!landmarker) return
                const start = performance.now()
                const result = landmarker.detectForVideo(bitmap, data.timestamp_ms)
                self.postMessage({ type: 'result', result, frame_time: data.frame_time, inference_ms: performance.now() - start })
            } finally {
                bitmap.close()
            }
        }
    } catch (error) {
        self.postMessage({ type: 'error', message: error instanceof Error ? error.message : String(error) })
    }
}
