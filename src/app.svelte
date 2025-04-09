<script>
    import {SignRecording} from './index.js'

    /**
     * @param {{url: string, mime_type: string}} recorded_video
     */
    function download_recording(recorded_video) {
        const link = document.createElement('a')
        link.href = recorded_video.url
        link.download = 'video.webm'
        link.click()
    }
</script>

<main>
    <SignRecording on_recorded={download_recording} />
</main>

<style>
    main {
        padding: 5rem;
        margin: auto;
        max-width: 100rem;
    }
</style>
