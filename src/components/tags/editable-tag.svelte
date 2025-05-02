<script>
    import {tick} from 'svelte'

    /**
     * Callback function triggered when the tag is saved.
     * @callback SaveHandler
     * @param {string} newText The new text content of the tag.
     * @returns {void}
     */

    /**
     * Props for the tag list component.
     * @type {{
     *  text: string,       // Description: Text content of the tag.
     *  on_save: SaveHandler,  // Description: Callback function invoked when a tag is edited and saved.
     *  on_cancel?: function, // Description: Optional callback function invoked when the editing is canceled.
     *  on_delete?: function, // Description: Optional callback function invoked when a tag is deleted.
     * }}
     */
    let {
        text = 'default tag',
        on_save,
        on_cancel,
        on_delete,
    } = $props()

    /** @type {boolean} */
    let is_editing = $state(false)
    /** @type {string} */
    let edit_text = $state(text)
    /** @type {HTMLInputElement | null} */
    let input_elem = $state(null)

    // Keep local edit_text in sync if the 'text' prop changes externally
    $effect(() => {
        if (!is_editing) {
            edit_text = text
        }
    })

    /**
     * Function called to resize the input element based on its text value.
     * The sizing is not accurate as it is based on a uniform character width.
     */
    function resize_input() {
        if (!input_elem)
            return
        input_elem.style.width = `calc(${edit_text.length}ch + 1.2em)`
    }

    /**
     * Function to start editing the tag.
     */
    function start_editing() {
        edit_text = text
        is_editing = true
        // Wait for the DOM to update, then focus and select the input
        tick().then(() => {
            if (!input_elem) {
                console.error('Unable to access tag input element.')
                return
            }
            resize_input()
            input_elem.focus()
            input_elem.select()
        })
    }

    /**
     * Function called when the editing is over and the text then saved.
     */
    function save_edit() {
        if (!is_editing)
            return

        const trimmed_text = edit_text.trim()
        if (trimmed_text.length < 1) {
            on_delete?.()
        } else if (trimmed_text !== text) {
            on_save(trimmed_text)
            // Note: We don't update 'text' directly here; the parent should update the prop
        } else {
            on_cancel?.()
        }
        is_editing = false
    }

    /**
     * Function called when the editing is canceled.
     */
    function cancel_edit() {
        is_editing = false
        on_cancel?.()
    }

    /**
     * Function called when a key is pressed while editing.
     * @param {KeyboardEvent} event
     */
    function handle_keydown(event) {
        resize_input()
        if (event.key === 'Enter') {
            event.preventDefault()
            save_edit()
        } else if (event.key === 'Escape') {
            cancel_edit()
        }
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Explicit function to focus and edit the tag.
     */
    export function focus() {
        start_editing()
    }
</script>

{#if is_editing}
    <input
            type="text"
            class="tag-input"
            bind:value={edit_text}
            bind:this={input_elem}
            onkeydown={handle_keydown}
            onblur={save_edit}
            aria-label="Edit tag name"
    />
{:else}
    <span
            class="tag"
            onclick={start_editing}
            role="button"
            tabindex="0"
            onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') start_editing() }}
            title="Click or press Enter to edit"
    >
        {text}
    </span>
{/if}

<style>
    .tag {
        display: inline-block;
        padding: .2em .6em;
        border-radius: 0.4em;
        background-color: var(--tag-color);
        color: white;
        cursor: pointer;
        user-select: none;
        transition: background-color 0.2s ease;
    }

    .tag:hover,
    .tag:focus {
        background-color: var(--active-tag-color);
        outline: none; /* Remove default focus outline */
    }

    .tag:focus-visible {
        outline: .1em solid red;
    }

    .tag-input {
        display: inline-block;
        padding: calc(.2em - 1px) calc(.6em - 1px);
        border-radius: 0.4em;
        border: 1px solid var(--active-tag-color);
        font: inherit;
        line-height: inherit;
        background-color: white;
        color: black;
        min-width: 5ch;
    }
</style>