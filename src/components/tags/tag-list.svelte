<script>
    import Tag from './tag.svelte'
    import EditableTag from './editable-tag.svelte'
    import AddIcon from '../icons/add-icon.svelte'
    import {tick} from 'svelte'

    /**
     * Callback function triggered when a tag is saved.
     * @callback SaveHandler
     * @param {number} index The index of the tag being saved.
     * @param {string} newText The new text content of the tag.
     * @returns {void}
     */

    /**
     * Callback function triggered when a tag is added.
     * @callback AddHandler
     * @param {string} newText The text content of the new tag.
     * @returns {void}
     */

    /**
     * Props for the tag list component.
     * @type {{
     *  texts: string[],       // Description: Array of tags.
     *  on_save: SaveHandler,  // Description: Callback function invoked when a tag is edited and saved.
     *  on_new: AddHandler,    // Description: Callback function invoked when a tag is added.
     *  editable?: boolean,    // Description: If true, allows tags to be edited. Defaults to false.
     * }}
     */
    let {texts, on_save, on_new, editable = false} = $props()
    let editing_new_tag = $state(false)
    let new_tag_text = $state('')
    let new_tag = $state(null)

    /**
     * Called when the new tag button is pressed.
     * It opens the new tag input field.
     */
    function on_button_pressed() {
        editing_new_tag = true
        tick().then(() => {
            if (!new_tag) {
                throw new Error('Cannot find new tag element.')
            }
            new_tag.focus()
        })
    }

    /**
     * Called when the value of the new tag is saved.
     * @param {string} saved_text The new text of the new tag.
     */
    function on_new_tag_saved(saved_text) {
        editing_new_tag = false
        new_tag_text = ''
        on_new(saved_text)
    }
</script>

<div class="tag-list">
    {#each texts as text, index}
        {#if editable}
            <EditableTag {text} on_save={() => on_save(index, text)}/>
        {:else}
            <Tag {text}/>
        {/if}
    {/each}
    {#if editing_new_tag}
        <EditableTag bind:this={new_tag} text={new_tag_text} on_save={on_new_tag_saved}
                     on_cancel={() => (editing_new_tag = false)}/>
    {/if}
    {#if editable}
        <button class="add-tag-button" aria-label="Add tag" onclick={on_button_pressed}>
            <AddIcon/>
        </button>
    {/if}
</div>

<style>
    .tag-list {
        display: flex;
        flex-wrap: wrap;
        gap: .4em;
        padding: .2em .5em;
    }

    .add-tag-button {
        all: unset;
        display: grid;
        place-items: center;
        font-size: 1.6em;
        color: var(--tag-color);
    }

    .add-tag-button:hover, .add-tag-button:active {
        color: var(--active-tag-color);
    }

    .add-tag-button:focus-visible {
        outline: .1em solid red;
    }
</style>
