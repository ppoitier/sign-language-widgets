
/**
 * Recorder that is able to start and stop a video stream recording.
 * When the recorder stops recording, the recorded video is stored as a `Blob` into the `recording` store.
 *
 * @typedef {Object} RecorderProps
 * @property {MediaStream} stream - Input video stream that is recorded.
 * @property {number} [max_duration=5] - Maximum duration (in seconds) of the recording before automatically
 * stopping the recording.
 * @property {number} [bit_rate=1_500_000] - Targeted bitrate for the resulting recording.
 */
export class Recorder extends EventTarget {
    /** @type BlobPart[] */
    recorded_chunks = []
    /** @type {number | null} */
    timeout_registration = null

    /**
     * @param {RecorderProps} options
     */
    constructor({stream, max_duration = 5, bit_rate = 1_500_000}) {
        super()
        this.max_duration = max_duration
        const mime_types = [
            'video/webm;codecs=vp9,opus',
            'video/webm;codecs=vp8,opus',
            'video/webm', // Fallback
        ]
        this.supported_mime_type = mime_types.find(type => MediaRecorder.isTypeSupported(type))
        if (!this.supported_mime_type) {
            // TODO: better error message
            throw new Error('Unsupported browser.')
        }
        console.log(`Found compatible recording video CODEC: ${this.supported_mime_type}`)
        this.recorder = new MediaRecorder(stream, {bitsPerSecond: bit_rate, mimeType: this.supported_mime_type})
        this.recorder.addEventListener('dataavailable', (event) => {
            if (event.data.size > 0) {
                this.recorded_chunks.push(event.data)
            }
        })
        this.recorder.addEventListener('stop', () => {
            const recording = new Blob(this.recorded_chunks, {
                type: 'video/webm'
            })
            this.recorded_chunks = []
            const event = new CustomEvent('recorded', {detail: {blob: recording}})
            this.dispatchEvent(event)
        })
    }

    /**
     * Start recording the input video stream.
     */
    start() {
        console.log(`Starting recording (codec=${this.supported_mime_type})`)
        this.recorder.start()
        this.timeout_registration = setTimeout(() => {
            this.recorder.stop()
        }, this.max_duration * 1000)
    }

    /**
     * Stop recording the input video stream and send the Blob to the `recording` store.
     * This function is automatically called at the end of the timeout.
     * The timeout is canceled if you call it manually.
     */
    stop() {
        if (this.timeout_registration) {
            clearTimeout(this.timeout_registration)
        }
        this.recorder.stop()
    }
}