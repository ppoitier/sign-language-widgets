<script>
    import SignGroup from './components/signs/sign-group.svelte'
    import {Sign} from './entities/sign.js'

    const data = [
        new Sign({
            id: '1',
            url: 'https://give-me-a-sign.ppoitier.com/static/videos/corpus_lsfb/signe_943ee9e5edd9fd578c3ec7fcb544d25f.webm',
            mime_type: 'video/webm',
            words: ['voiture', 'automobile', 'auto'],
        }),
        new Sign({
            id: '2',
            url: 'https://give-me-a-sign.ppoitier.com/static/videos/corpus_lsfb/signe_943ee9e5edd9fd578c3ec7fcb544d25f.webm',
            mime_type: 'video/webm',
            words: ['voiture', 'automobile', 'auto'],
        }),
        new Sign({
            id: '3',
            url: 'https://give-me-a-sign.ppoitier.com/static/videos/corpus_lsfb/signe_943ee9e5edd9fd578c3ec7fcb544d25f.webm',
            mime_type: 'video/webm',
            words: ['voiture', 'automobile', 'auto'],
        }),
        new Sign({
            id: '4',
            url: 'https://give-me-a-sign.ppoitier.com/static/videos/corpus_lsfb/signe_943ee9e5edd9fd578c3ec7fcb544d25f.webm',
            mime_type: 'video/webm',
            words: ['voiture', 'automobile', 'auto'],
        }),
        new Sign({
            id: '5',
            url: 'https://give-me-a-sign.ppoitier.com/static/videos/corpus_lsfb/signe_943ee9e5edd9fd578c3ec7fcb544d25f.webm',
            mime_type: 'video/webm',
            words: ['voiture', 'automobile', 'auto'],
        }),
        new Sign({
            id: '6',
            url: 'https://give-me-a-sign.ppoitier.com/static/videos/corpus_lsfb/signe_943ee9e5edd9fd578c3ec7fcb544d25f.webm',
            mime_type: 'video/webm',
            words: ['voiture', 'automobile', 'auto'],
        }),
        new Sign({
            id: '7',
            url: 'https://give-me-a-sign.ppoitier.com/static/videos/corpus_lsfb/signe_943ee9e5edd9fd578c3ec7fcb544d25f.webm',
            mime_type: 'video/webm',
            words: ['voiture', 'automobile', 'auto'],
        }),
        new Sign({
            id: '8',
            url: 'https://give-me-a-sign.ppoitier.com/static/videos/corpus_lsfb/signe_943ee9e5edd9fd578c3ec7fcb544d25f.webm',
            mime_type: 'video/webm',
            words: ['voiture', 'automobile', 'auto'],
        }),
    ]
</script>

<main>
    <SignGroup on_new_word={(sign_id, new_word) => console.log('new word', sign_id, new_word)}
               on_updated_word={(sign_id, word_index, new_word) => console.log('updated word', sign_id, word_index, new_word)}
               signs={data}
    />

    <!--    <TestGrid/>-->

</main>

<style>
    main {
        padding: 5rem;
        margin: auto;
        max-width: 130rem;
    }
</style>
