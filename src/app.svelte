<script>
    import TagList from './components/tags/tag-list.svelte'

    let words = $state(['mot 1', 'mot 2'])

    /**
     * @param {number} index
     * @param {string} new_word
     */
    function on_updated(index, new_word) {
        const updated_words = [...words]
        updated_words[index] = new_word
        words = updated_words
    }

    /**
     * @param {string} new_word
     */
    function on_new(new_word) {
        words = [...words, new_word]
    }

</script>

<main>
    <TagList texts={words} on_new={on_new} on_updated={on_updated} editable />
</main>

<style>
    main {
        padding: 5rem;
        margin: auto;
        max-width: 100rem;
    }
</style>
