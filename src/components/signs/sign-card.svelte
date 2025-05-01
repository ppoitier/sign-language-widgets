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
     * @property {Snippet | undefined} [video_actions_right] - Video actions added to the top-right corner of the video.
     * @property {Snippet | undefined} [video_actions_left] - Video actions added to the top-left corner of the video.
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
     * @param {number} word_index
     * @param {string} new_word
     */

    /** @type {SignCardProps} */
    let {sign, on_new_word, on_updated_word, video_actions_right, video_actions_left, fluid=false} = $props()

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

<div class="sign-card" class:fluid>
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
        <TagList texts={sign.words}
                 on_updated={handle_updated_word}
                 on_new={handle_new_word}
                 editable={sign.editable}
        />
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

    .sign-card_actions {
        padding: .5rem 0;
        min-height: 4rem;
        font-size: 1.2rem;
    }
</style>

