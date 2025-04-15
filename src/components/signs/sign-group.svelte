<script>
    import SignGrid from './sign-grid.svelte'
    import SignList from './sign-list.svelte'
    import ListIcon from '../icons/list-icon.svelte'
    import GridIcon from '../icons/grid-icon.svelte'
    import IconButton from '../interaction/icon-button.svelte'

    /**
     * @typedef {import('../../entities/sign.js').Sign} Sign
     *
     * @typedef {Object} SignGroupProps
     * @property {Sign[]} signs - Signs that are displayed in the group.
     * @property {NewWordCallback} on_new_word - Function called when a new word is added to a sign.
     * @property {UpdatedWordCallback} on_updated_word - Function called when a word of a sign is updated.
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

    /** @type {SignGroupProps} */
    let {signs, on_new_word, on_updated_word} = $props()
    /** @type {string} */
    let mode = $state('grid')
</script>

<div class="sign-group">
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
        <SignList {signs} {on_new_word} {on_updated_word}/>
    {:else}
        <SignGrid {signs} {on_new_word} {on_updated_word}/>
    {/if}
</div>

<style>
    .sign-group_actions {
        text-align: right;
        font-size: 2.4rem;
        color: red;
    }
</style>

