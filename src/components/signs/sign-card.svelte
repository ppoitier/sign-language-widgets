<script>
    import Video from "../media/video.svelte"
    import TagList from "../tags/tag-list.svelte"

    /**
     * @typedef {import('../../entities/sign.js').Sign} Sign
     *
     * @typedef {Object} SignCardProps
     * @property {Sign} sign - Sign that is displayed in the card.
     * @property {NewWordCallback} on_new_word - Function called when a new word is added to the sign.
     * @property {UpdatedWordCallback} on_updated_word - Function called when a word of the sign is updated.
     */

    /**
     * @callback NewWordCallback
     * @param {string} sign_id
     * @param {string} new_word
     */

    /**
     * @callback UpdatedWordCallback
     * @param {string} sign_id
     * @param {number} word_index
     * @param {string} new_word
     */

    /** @type {SignCardProps} */
    let {sign, on_new_word, on_updated_word} = $props()

    /**
     * @param {string} new_word
     */
    function handle_new_word(new_word) {
        on_new_word(sign.id, new_word)
    }

    /**
     * @param {number} index
     * @param {string} new_word
     */
    function handle_updated_word(index, new_word) {
        on_updated_word(sign.id, index, new_word)
    }

</script>

<div class="sign-card">
    <div class="sign-card_preview">
        <Video url={sign.url} mime_type={sign.mime_type} />
    </div>
    <div class="sign-card_actions">
        <TagList texts={sign.words}
                 on_updated={handle_updated_word}
                 on_new={handle_new_word}
                 editable={true}
        />
    </div>
</div>

<style>
    .sign-card {
        width: 100%;
        max-width: var(--card-max-width);
        min-width: var(--card-min-width);
        overflow: hidden;
        border-radius: 0.8rem;
        border: 0.1rem solid var(--card-border);
        background-color: var(--card-background);
    }

    .sign-card_actions {
        padding: .5rem 0;
        min-height: 4rem;
        font-size: 1.2rem;
    }
</style>

