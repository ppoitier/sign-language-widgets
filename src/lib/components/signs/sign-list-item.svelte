<!--
@component
Row of a `SignList`: the video of a sign (see `VideoPlayer`) next to its words (see `TagList`), and optional
actions on the right. On narrow rows (phones), the words go below the video.
Same props as `SignCard`: when `editable`, words can be added, edited and deleted, and the parent updates
`words` in the callbacks.

```svelte
<SignList>
    {#each signs as sign (sign.id)}
        <SignListItem src={sign.url} words={sign.words} editable
                      on_word_added={(text) => add_word(sign.id, text)}
                      on_word_updated={(word_id, text) => rename_word(sign.id, word_id, text)}
                      on_word_deleted={(word_id) => remove_word(sign.id, word_id)}>
            {#snippet video_actions_right()}
                <VideoAction label="Télécharger" onclick={() => download(sign)}><DownloadIcon /></VideoAction>
            {/snippet}
        </SignListItem>
    {/each}
</SignList>
```
-->

<script>
    import VideoPlayer from '../media/video-player.svelte'
    import TagList from '../tags/tag-list.svelte'

    /**
     * @typedef {import('svelte').Snippet} Snippet
     *
     * @typedef {Object} Props
     * @property {string} src - URL of the video of the sign.
     * @property {string | undefined} [poster] - URL of an image displayed before the video plays.
     * @property {import('../tags/tag-item.js').TagItem[]} [words=[]] - Words associated with the sign.
     * @property {boolean} [editable=false] - If true, words can be added, edited and deleted.
     * @property {boolean} [highlighted=false] - If true, the row is highlighted.
     * @property {(text: string) => void} [on_word_added] - Called with the text of a new word.
     * @property {(word_id: string, text: string) => void} [on_word_updated] - Called with the id and the new text of an edited word.
     * @property {(word_id: string) => void} [on_word_deleted] - Called with the id of a deleted word.
     * @property {Snippet | undefined} [video_actions_left] - Actions added to the top-left corner of the video.
     * @property {Snippet | undefined} [video_actions_right] - Actions added to the top-right corner of the video.
     * @property {Snippet | undefined} [actions] - Actions shown on the right of the row (e.g. approve / reject).
     */

    /** @type {Props} */
    let {
        src,
        poster,
        words = [],
        editable = false,
        highlighted = false,
        on_word_added,
        on_word_updated,
        on_word_deleted,
        video_actions_left,
        video_actions_right,
        actions,
    } = $props()
</script>

<li class={['sign-list-item', { highlighted }]}>
    <div class="sign-list-item_row">
        <div class="sign-list-item_video">
            <VideoPlayer {src} {poster} {video_actions_left} {video_actions_right} />
        </div>
        <div class="sign-list-item_words">
            <TagList tags={words} {editable}
                     on_added={on_word_added}
                     on_updated={on_word_updated}
                     on_deleted={on_word_deleted} />
        </div>
        {#if actions}
            <div class="sign-list-item_actions">
                {@render actions()}
            </div>
        {/if}
    </div>
</li>

<style>
    .sign-list-item {
        /* The layout depends on the width of the row, not of the screen. */
        container-type: inline-size;
        padding: 1rem;
        border-bottom: 0.1rem solid var(--card-border);
    }

    .sign-list-item:last-child {
        border-bottom: none;
    }

    .sign-list-item.highlighted {
        background-color: rgb(250 224 224);
    }

    .sign-list-item_row {
        display: flex;
        align-items: flex-start;
        gap: 1.5rem;
    }

    .sign-list-item_video {
        flex: 0 0 min(40%, 40rem);
        overflow: hidden;
        border-radius: 0.8rem;
    }

    .sign-list-item_words {
        flex: 1;
        font-size: 1.4rem;
    }

    .sign-list-item_actions {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    /* Narrow rows: the video takes the whole width, the words go below. */
    @container (width < 56rem) {
        .sign-list-item_row {
            flex-wrap: wrap;
        }

        .sign-list-item_video {
            flex-basis: 100%;
        }

        .sign-list-item_actions {
            flex-direction: row;
        }
    }
</style>
