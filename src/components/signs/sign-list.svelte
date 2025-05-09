<script>
    import SignListItem from './sign-list-item.svelte'
    import SignPrimaryActions from './sign-primary-actions.svelte'
    import SignSecondaryActions from './sign-secondary-actions.svelte'

    /**
     * @typedef {import('../../entities/sign.js').Sign} Sign
     * @typedef {import('svelte').Snippet} Snippet
     *
     * @typedef {Object} SignListProps
     * @property {Sign[]} signs - Signs that are displayed in the group.
     * @property {NewWordCallback} on_new_word - Function called when a new word is added to a sign.
     * @property {UpdatedWordCallback} on_updated_word - Function called when a word of a sign is updated.
     * @property {DeletedWordCallback} on_deleted_word - Function called when a word of the sign is deleted.
     * @property {OnActionCallback} [on_download] - Function called when the user presses the info button on a sign.
     * @property {OnActionCallback} [on_info] - Function called when the user presses the download button on a sign.
     * @property {OnActionCallback} [on_hide] - Function called when the user presses the hide button on a sign.
     * @property {OnActionCallback} [on_add_from] - Function called when the user presses the 'add from' button on a sign.
     * @property {Snippet | undefined} [actions]
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

    /** @type {SignListProps} */
    let {signs, on_new_word, on_updated_word, on_deleted_word, on_download, on_info, on_hide, on_add_from, actions} = $props()
</script>

<table class="sign-list">
    <thead>
    <tr>
        <th scope="col">Aperçu</th>
        <th scope="col">Mots associés</th>
        <th scope="col"></th>
    </tr>
    </thead>
    <tbody>
    {#each signs as sign}
        {#snippet video_actions_right()}
            <SignPrimaryActions on_download={() => on_download?.(sign.id)} on_info={() => on_info?.(sign.id)}/>
        {/snippet}
        {#snippet video_actions_left()}
            <SignSecondaryActions editable={sign.editable} on_hide={() => on_hide?.(sign.id)}
                                  on_add_from={() => on_add_from?.(sign.id)}/>
        {/snippet}
        <SignListItem {sign} {on_new_word} {on_updated_word} {on_deleted_word} {video_actions_right} {video_actions_left} main_actions={actions}/>
    {/each}
    </tbody>
</table>

<style>
    .sign-list {
        width: 100%;
        font-size: 1.2rem;
        border-collapse: collapse;
    }

    .sign-list th {
        padding: .5rem;
        border-top: .1rem solid lightgray;
        border-bottom: .25rem solid lightgray;
        font-weight: bold;
        letter-spacing: .2rem;
    }

    .sign-list :global(tr:nth-child(even)) {
        background-color: #ececec;
    }

    .sign-list :global(td) {
        border-bottom: .15rem solid lightgray;
    }

    .sign-list :global(tr:last-child > td) {
        border-bottom: none;
    }

    .sign-list th:nth-child(1),
    .sign-list :global(td:nth-child(1)) {
        width: 40%;
    }

    .sign-list :global(td:nth-child(2)) {
        vertical-align: top;
        text-align: left;
    }

    .sign-list th:nth-child(3),
    .sign-list :global(td:nth-child(3)) {
        width: 5rem;
    }
</style>