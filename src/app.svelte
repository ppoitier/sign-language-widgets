<script>
    import VideoImport from './components/interaction/video-import.svelte'
</script>

<main>
    <VideoImport on_imported={(video) => {console.log(video)}}/>
</main>

<style>
    main {
        padding: 5rem;
        margin: auto;
        max-width: 100rem;
    }
</style>
