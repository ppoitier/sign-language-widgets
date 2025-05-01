<script>
    import SignCard from './sign-card.svelte'
    import SignPrimaryActions from './sign-primary-actions.svelte'
    import SignSecondaryActions from './sign-secondary-actions.svelte'

    /**
     * @typedef {import('../../entities/sign.js').Sign} Sign
     *
     * @typedef {Object} SignGridProps
     * @property {Sign[]} signs - Signs that are displayed in the group.
     * @property {NewWordCallback} on_new_word - Function called when a new word is added to a sign.
     * @property {UpdatedWordCallback} on_updated_word - Function called when a word of a sign is updated.
     * @property {DeletedWordCallback} on_deleted_word - Function called when a word of the sign is deleted.
     * @property {OnActionCallback} [on_download] - Function called when the user presses the info button on a sign.
     * @property {OnActionCallback} [on_info] - Function called when the user presses the download button on a sign.
     * @property {OnActionCallback} [on_hide] - Function called when the user presses the hide button on a sign.
     * @property {OnActionCallback} [on_add_from] - Function called when the user presses the 'add from' button on a sign.
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

    /**
     * @callback OnActionCallback
     * @param {string} sign_id
     */

    /** @type {SignGridProps} */
    let {signs, on_new_word, on_updated_word, on_deleted_word, on_download, on_info, on_hide, on_add_from} = $props()
</script>

<div>
    {#each signs as sign}
        {#snippet video_actions_right()}
            <SignPrimaryActions on_download={() => on_download?.(sign.id)} on_info={() => on_info?.(sign.id)}/>
        {/snippet}
        {#snippet video_actions_left()}
            <SignSecondaryActions editable={sign.editable} on_hide={() => on_hide?.(sign.id)}
                                  on_add_from={() => on_add_from?.(sign.id)}/>
        {/snippet}
        <SignCard {sign} {on_new_word} {on_updated_word} {on_deleted_word} {video_actions_right} {video_actions_left}/>
    {/each}
</div>

<style>
    div {
        /* Calculated minimum width for items and ensure a strict max number of columns */
        --item-min-width: calc((var(--container-max-width) - (var(--grid-max-nb-columns) - 1) * var(--grid-gap)) / var(--grid-max-nb-columns));
        --item-min-height: calc(9 / 16 * var(--item-min-width));

        display: grid;
        gap: var(--grid-gap);
        grid-template-columns: repeat(auto-fit, minmax(var(--item-min-width), 1fr));

        max-width: var(--container-max-width);
        margin: 0 auto;
    }
</style>
