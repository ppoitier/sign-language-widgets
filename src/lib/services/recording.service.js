/**
 * @typedef {Object} RecordingOptions
 * @property {number} [max_duration] - Maximum length of the recording, in seconds: it then stops by itself. No limit by default.
 * @property {MediaTrackConstraints} [video_constraints] - Applied to the recorded video only (e.g. `{ frameRate: 15 }`): the given stream, and its preview, are not affected. The browser can only lower what the camera delivers.
 * @property {number} [bit_rate=1_500_000] - Targeted video bitrate, in bits per second.
 * @property {string[]} [mime_types] - Formats by preference, the first one supported by the browser is used. Defaults to MP4, then WebM.
 *
 * @typedef {Object} RecordedVideo
 * @property {Blob} blob - The video.
 * @property {number} duration - Measured length of the recording, in seconds. Recorded WebM files have no duration (Chrome reports `Infinity`).
 *
 * @typedef {Object} Recording
 * @property {Promise<RecordedVideo>} done - Resolves with the video once the recording stops (`stop()`, `max_duration` reached, or the stream ended). Rejects if the recording fails.
 * @property {() => void} stop - Stops the recording and releases its tracks. To discard the video, call it and ignore `done`.
 */

// Safari only records MP4, Firefox only WebM.
const DEFAULT_MIME_TYPES = ['video/mp4', 'video/webm;codecs=vp9', 'video/webm']

/**
 * Starts recording a stream (e.g. the webcam stream of `WebcamPreview`).
 * Rejects if the constraints can't be applied or if the browser can't record.
 *
 * ```js
 * const recording = await start_recording(stream, { max_duration: 5, video_constraints: { frameRate: 15 } })
 * const { blob } = await recording.done // After 5 s, or sooner with `recording.stop()`.
 * ```
 *
 * @param {MediaStream} stream
 * @param {RecordingOptions} [options]
 * @returns {Promise<Recording>}
 */
export async function start_recording(stream, { max_duration, video_constraints, bit_rate = 1_500_000, mime_types = DEFAULT_MIME_TYPES } = {}) {
    // Clones are independent tracks: constraining them doesn't change the original stream.
    const tracks = stream.getTracks().map(track => track.clone())
    const release = () => tracks.forEach(track => track.stop())

    /** @type {MediaRecorder} */
    let recorder
    try {
        if (video_constraints) {
            const video_tracks = tracks.filter(track => track.kind === 'video')
            await Promise.all(video_tracks.map(track => track.applyConstraints(video_constraints)))
        }
        const mime_type = mime_types.find(type => MediaRecorder.isTypeSupported(type))
        recorder = new MediaRecorder(new MediaStream(tracks), { mimeType: mime_type, videoBitsPerSecond: bit_rate })
        // Its events are fired later on: the handlers below are set in time.
        recorder.start()
    } catch (error) {
        release()
        throw error
    }

    /** @type {Blob[]} */
    const chunks = []
    const start_time = performance.now()

    /** @type {Promise<RecordedVideo>} */
    const done = new Promise((resolve, reject) => {
        recorder.ondataavailable = event => chunks.push(event.data)
        recorder.onerror = event => {
            clearTimeout(timeout)
            release()
            reject(/** @type {ErrorEvent} */ (event).error ?? event)
        }
        recorder.onstop = () => {
            release()
            resolve({
                blob: new Blob(chunks, { type: recorder.mimeType }),
                duration: (performance.now() - start_time) / 1000,
            })
        }
    })
    function stop() {
        clearTimeout(timeout)
        if (recorder.state !== 'inactive') recorder.stop()
        release()
    }

    const timeout = max_duration === undefined ? undefined : setTimeout(stop, max_duration * 1000)

    return { done, stop }
}
