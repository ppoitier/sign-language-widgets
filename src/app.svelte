<script>
    import SignGroup from './components/signs/sign-group.svelte'
    import {Sign} from './entities/sign.js'
    import VideoRecording from './components/interaction/video-recording.svelte'
    import MultiSelectField from './components/interaction/multi-select-field.svelte'

    const data = [
        new Sign({
            id: '1',
            url: 'https://give-me-a-sign.ppoitier.com/static/videos/corpus_lsfb/signe_943ee9e5edd9fd578c3ec7fcb544d25f.webm',
            mime_type: 'video/webm',
            words: [{id: '1', word: 'voiture'}, {id: '2', word: 'automobile'}, {id: '3', word: 'auto'}],
            editable: true,
            with_actions: true,
            highlighted: true,
        }),
        new Sign({
            id: '2',
            url: 'https://give-me-a-sign.ppoitier.com/static/videos/corpus_lsfb/signe_943ee9e5edd9fd578c3ec7fcb544d25f.webm',
            mime_type: 'video/webm',
            words: [{id: '1', word: 'voiture'}, {id: '2', word: 'automobile'}, {id: '3', word: 'auto'}],
            editable: true,
        }),
        new Sign({
            id: '3',
            url: 'https://give-me-a-sign.ppoitier.com/static/videos/corpus_lsfb/signe_943ee9e5edd9fd578c3ec7fcb544d25f.webm',
            mime_type: 'video/webm',
            words: [{id: '1', word: 'voiture'}, {id: '2', word: 'automobile'}, {id: '3', word: 'auto'}],
            editable: false,
        }),
        new Sign({
            id: '4',
            url: 'https://give-me-a-sign.ppoitier.com/static/videos/corpus_lsfb/signe_943ee9e5edd9fd578c3ec7fcb544d25f.webm',
            mime_type: 'video/webm',
            words: [{id: '1', word: 'voiture'}, {id: '2', word: 'automobile'}, {id: '3', word: 'auto'}],
            editable: false,
        }),
        new Sign({
            id: '5',
            url: 'https://give-me-a-sign.ppoitier.com/static/videos/corpus_lsfb/signe_943ee9e5edd9fd578c3ec7fcb544d25f.webm',
            mime_type: 'video/webm',
            words: [{id: '1', word: 'voiture'}, {id: '2', word: 'automobile'}, {id: '3', word: 'auto'}],
            editable: true,
        }),
        new Sign({
            id: '6',
            url: 'https://give-me-a-sign.ppoitier.com/static/videos/corpus_lsfb/signe_943ee9e5edd9fd578c3ec7fcb544d25f.webm',
            mime_type: 'video/webm',
            words: [{id: '1', word: 'voiture'}, {id: '2', word: 'automobile'}, {id: '3', word: 'auto'}],
            editable: false,
            with_actions: true,
        }),
        new Sign({
            id: '7',
            url: 'https://give-me-a-sign.ppoitier.com/static/videos/corpus_lsfb/signe_943ee9e5edd9fd578c3ec7fcb544d25f.webm',
            mime_type: 'video/webm',
            words: [{id: '1', word: 'voiture'}, {id: '2', word: 'automobile'}, {id: '3', word: 'auto'}],
            editable: false,
        }),
        new Sign({
            id: '8',
            url: 'https://give-me-a-sign.ppoitier.com/static/videos/corpus_lsfb/signe_943ee9e5edd9fd578c3ec7fcb544d25f.webm',
            mime_type: 'video/webm',
            words: [{id: '1', word: 'voiture'}, {id: '2', word: 'automobile'}, {id: '3', word: 'auto'}],
            editable: true,
        }),
    ]

    /**
     * @param {string} sign_id
     */
    function test_handler(sign_id) {
        console.log('test handler', sign_id)
    }

    let options = $state([
        {id: '1', name: 'Option 1', selected: false},
        {id: '2', name: 'Option 1', selected: false},
        {id: '3', name: 'Option 1', selected: false},
        {id: '4', name: 'Option 1', selected: false},
        {id: '5', name: 'Option 1', selected: false},
        {id: '6', name: 'Option 1', selected: false},
        {id: '7', name: 'Option 1', selected: false},
        {id: '8', name: 'Option 1', selected: false},
        {id: '9', name: 'Option 1', selected: false},
        {id: '10', name: 'Option 1', selected: false},
        {id: '11', name: 'Option 1', selected: false},
        {id: '12', name: 'Option 1', selected: false},
        {id: '13', name: 'Option 1', selected: false},
        {id: '14', name: 'Option 1', selected: false},
        {id: '15', name: 'Option 1', selected: false},
        {id: '16', name: 'Option 1', selected: false},
    ])
</script>

<main>
    <!--{#snippet test(sign_id)}-->
    <!--    <div>-->
    <!--        <button onclick={() => test_handler(sign_id)}>1</button>-->
    <!--        <button onclick={() => test_handler(sign_id)}>2</button>-->
    <!--    </div>-->
    <!--{/snippet}-->

    <!--<SignGroup on_new_word={(sign_id, new_word) => console.log('new word', sign_id, new_word)}-->
    <!--           on_updated_word={(sign_id, word_index, new_word) => console.log('updated word', sign_id, word_index, new_word)}-->
    <!--           signs={data}-->
    <!--           on_sign_info={(sign_id) => (console.log("Ask information about " + sign_id))}-->
    <!--           on_sign_download={(sign_id, extension) => (console.log("Wants to download sign " + sign_id + '.' + extension))}-->
    <!--           on_deleted_word={() => {}}-->
    <!--           on_hide_sign={() => {}}-->
    <!--           on_add_from_sign={() => {}}-->
    <!--           actions={test}-->
    <!--           compact_actions={test}-->
    <!--/>-->

    <VideoRecording on_recorded={() => {}} />

    <MultiSelectField options={options} />

</main>

<style>
    main {
        padding: 5rem;
        margin: auto;
        max-width: 130rem;
    }
</style>
