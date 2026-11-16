<!--
@component
Card showing the video of a sign (see `VideoCard`) and its words (see `TagList`).
When `editable`, words can be added, edited and deleted: the parent updates `words` in the callbacks.

```svelte
<SignCard src={sign.url} words={sign.words} editable
          on_word_added={(text) => add_word(sign.id, text)}
          on_word_updated={(word_id, text) => rename_word(sign.id, word_id, text)}
          on_word_deleted={(word_id) => remove_word(sign.id, word_id)}>
    {#snippet video_actions_right()}
        <VideoAction label="Télécharger" onclick={() => download(sign)}><DownloadIcon /></VideoAction>
    {/snippet}
</SignCard>
```
-->

<script>
    import VideoCard from '../media/video-card.svelte'
    import TagList from '../tags/tag-list.svelte'

    /**
     * @typedef {import('svelte').Snippet} Snippet
     *
     * @typedef {Object} Props
     * @property {string} src - URL of the video of the sign.
     * @property {string | undefined} [poster] - URL of an image displayed before the video plays.
     * @property {import('../tags/tag-item.js').TagItem[]} [words=[]] - Words associated with the sign.
     * @property {boolean} [editable=false] - If true, words can be added, edited and deleted.
     * @property {boolean} [highlighted=false] - If true, the card is outlined.
     * @property {(text: string) => void} [on_word_added] - Called with the text of a new word.
     * @property {(word_id: string, text: string) => void} [on_word_updated] - Called with the id and the new text of an edited word.
     * @property {(word_id: string) => void} [on_word_deleted] - Called with the id of a deleted word.
     * @property {Snippet | undefined} [video_actions_left] - Actions added to the top-left corner of the video.
     * @property {Snippet | undefined} [video_actions_right] - Actions added to the top-right corner of the video.
     * @property {Snippet | undefined} [actions] - Actions shown next to the words (e.g. approve / reject).
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

<VideoCard {src} {poster} {highlighted} {video_actions_left} {video_actions_right}>
    <div class="sign-card_content">
        <TagList tags={words} {editable}
                 on_added={on_word_added}
                 on_updated={on_word_updated}
                 on_deleted={on_word_deleted} />
        {#if actions}
            <div class="sign-card_actions">
                {@render actions()}
            </div>
        {/if}
    </div>
</VideoCard>

<style>
    .sign-card_content {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 0.5rem;
        min-height: 3rem;
    }

    .sign-card_actions {
        display: flex;
        gap: 0.4rem;
    }
</style>
