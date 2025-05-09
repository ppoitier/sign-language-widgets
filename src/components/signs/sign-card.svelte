<script>
    import VideoActions from "../interaction/video-actions.svelte";
    import Video from "../media/video.svelte"
    import TagList from "../tags/tag-list.svelte"

    /**
     * @typedef {import('../../entities/sign.js').Sign} Sign
     * @typedef {import('svelte').Snippet} Snippet
     *
     * @typedef {Object} SignCardProps
     * @property {Sign} sign - Sign displayed in the card.
     * @property {NewWordCallback} on_new_word - Function called when a new word is added to the sign.
     * @property {UpdatedWordCallback} on_updated_word - Function called when a word of the sign is updated.
     * @property {DeletedWordCallback} on_deleted_word - Function called when a word of the sign is deleted.
     * @property {Snippet | undefined} [video_actions_right] - Video actions added to the top-right corner of the video.
     * @property {Snippet | undefined} [video_actions_left] - Video actions added to the top-left corner of the video.
     * @property {Snippet | undefined} [bottom_right_actions] - Video actions added to the bottom-right corner of the card.
     * @property {boolean} [fluid=false] - If true, the card doesn't have a maximum width anymore.
     */

    /**
     * @callback NewWordCallback
     * @param {string} sign_id
     * @param {string} new_word
     */

    /**
     * @callback UpdatedWordCallback
     * @param {string} sign_id
     * @param {string} word_id
     * @param {string} new_word
     */

    /**
     * @callback DeletedWordCallback
     * @param {string} sign_id
     * @param {string} word_id
     */

    /** @type {SignCardProps} */
    let {sign, on_new_word, on_updated_word, on_deleted_word, video_actions_right, video_actions_left, bottom_right_actions, fluid=false} = $props()
    let word_names = $derived(sign.words.map(w => w.word))

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
        on_updated_word(sign.id, sign.words[index].id, new_word)
    }

    /**
     * @param {number} index
     */
    function handle_deleted_word(index) {
        on_deleted_word(sign.id, sign.words[index].id)
    }

</script>

<div class="sign-card" class:fluid class:highlighted={sign.highlighted}>
    <div class="sign-card_preview">
        <Video url={sign.url} mime_type={sign.mime_type}>
            <VideoActions>
                {@render video_actions_right?.()}
            </VideoActions>
            <VideoActions location="top-left">
                {@render video_actions_left?.()}
            </VideoActions>
        </Video>
    </div>
    <div class="sign-card_actions">
        <TagList texts={word_names}
                 on_updated={handle_updated_word}
                 on_new={handle_new_word}
                 on_deleted={handle_deleted_word}
                 editable={sign.editable}
        />
        {#if sign.with_actions}
            {@render bottom_right_actions?.(sign.id)}
        {/if}
    </div>
</div>

<style>
    .sign-card {
        width: 100%;
        min-width: var(--card-min-width);
        max-width: var(--card-max-width);
        overflow: hidden;
        border-radius: 0.8rem;
        border: 0.1rem solid var(--card-border);
        background-color: var(--card-background);
    }

    .sign-card.fluid {
        max-width: 100%;
    }

    .sign-card.highlighted {
        outline: .3rem solid red;
    }

    .sign-card_actions {
        padding: .5rem 0;
        min-height: 4rem;
        font-size: 1.2rem;
        display: flex;
        justify-content: space-between;
    }
</style>

