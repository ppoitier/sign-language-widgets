<!--
@component
Collection of signs with a button to switch between grid and list views.
Also handles the download modal: `on_sign_download` receives the sign id and the chosen file extension.

```svelte
<SignGroup {signs} {on_new_word} {on_updated_word} {on_deleted_word}
           {on_sign_download} {on_sign_info} {on_hide_sign} {on_add_from_sign} />
```
-->

<script>
    import SignGrid from './sign-grid.svelte'
    import SignList from './sign-list.svelte'
    import ListIcon from '../icons/list-icon.svelte'
    import GridIcon from '../icons/grid-icon.svelte'
    import IconButton from '../interaction/icon-button.svelte'
    import VideoDownloadModal from '../interaction/video-download-modal.svelte'

    /**
     * @typedef {import('../../entities/sign.js').Sign} Sign
     * @typedef {import('svelte').Snippet} Snippet
     *
     * @typedef {Object} SignGroupProps
     * @property {Sign[]} signs - Signs that are displayed in the group.
     * @property {NewWordCallback} on_new_word - Function called when a new word is added to a sign.
     * @property {UpdatedWordCallback} on_updated_word - Function called when a word of a sign is updated.
     * @property {DeletedWordCallback} on_deleted_word - Function called when a word of the sign is deleted.
     * @property {SignDownloadCallback} on_sign_download - Function called when the user wants to download a sign.
     * @property {SignActionCallback} on_sign_info - Function called when the user wants information about a sign.
     * @property {SignActionCallback} on_hide_sign - Function called when the user wants to hide a sign.
     * @property {SignActionCallback} on_add_from_sign - Function called when the user wants to create a new sign from a sign.
     * @property {'grid' | 'list'} [mode='grid'] - Initial display mode. The user can switch it with the button.
     * @property {Snippet | undefined} [compact_actions] - Extra actions for each sign in grid mode (bottom-right of the card).
     * @property {Snippet | undefined} [actions] - Extra actions for each sign in list mode (last column of the row).
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
     * @callback SignDownloadCallback
     * @param {string} sign_id
     * @param {string} extension
     */

    /**
     * @callback SignActionCallback
     * @param {string} sign_id
     */

    /** @type {SignGroupProps} */
    let {
        signs,
        on_new_word,
        on_updated_word,
        on_deleted_word,
        on_sign_download,
        on_sign_info,
        on_hide_sign,
        on_add_from_sign,
        mode = 'grid',
        compact_actions,
        actions,
    } = $props()

    let download_modal = $state()

    /**
     * @param {String} sign_id
     */
    function handle_download_button(sign_id) {
        if (download_modal) {
            download_modal.open_modal(sign_id)
        }
    }
</script>

<div class="sign-group">
    <VideoDownloadModal bind:this={download_modal} on_download={on_sign_download}/>

    <div class="sign-group_actions">
        {#if mode === 'list'}
            <IconButton onclick={() => (mode = 'grid')} label="Switch to grid view.">
                <GridIcon/>
            </IconButton>
        {:else}
            <IconButton onclick={() => (mode = 'list')} label="Switch to list view.">
                <ListIcon/>
            </IconButton>
        {/if}
    </div>

    {#if mode === 'list'}
        <SignList {signs} {on_new_word} {on_updated_word} {on_deleted_word} on_download={handle_download_button} on_info={on_sign_info}
                  on_hide={on_hide_sign} on_add_from={on_add_from_sign} {actions}/>
    {:else}
        <SignGrid {signs} {on_new_word} {on_updated_word} {on_deleted_word} on_download={handle_download_button} on_info={on_sign_info}
                  on_hide={on_hide_sign} on_add_from={on_add_from_sign} actions={compact_actions}/>
    {/if}
</div>

<style>
    .sign-group_actions {
        text-align: right;
        font-size: 2.4rem;
        color: red;
    }
</style>

