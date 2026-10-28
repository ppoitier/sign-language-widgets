<!--
@component
Tag whose text can be edited in place: click it (or press Enter) to edit, then Enter or leaving
the field saves, Escape cancels. Saving an empty text deletes the tag.
The parent updates `text` in `on_save`. With `validate`, an invalid text can't be saved: Enter shows
the error, and leaving the field cancels the edit.

```svelte
<EditableTag text={word.text} on_save={(text) => rename(word.id, text)} on_delete={() => remove(word.id)} />
```
-->

<script>
    /**
     * @typedef {Object} Props
     * @property {string} text - Text of the tag.
     * @property {boolean} [editing=false] - If true, the text field is shown (and focused). Bindable: becomes false once the edit is over.
     * @property {(text: string) => void} on_save - Called with the new text (trimmed) when an edit is saved.
     * @property {() => void} [on_delete] - Called when an edit is saved with an empty text.
     * @property {() => void} [on_cancel] - Called when an edit is canceled, or saved without changes.
     * @property {(text: string) => string | undefined} [validate] - Called with the typed text (trimmed, not empty): returns an error message (in French) if it can't be saved.
     */

    /** @type {Props} */
    let { text, editing = $bindable(false), on_save, on_delete, on_cancel, validate } = $props()

    // Text of the field: follows `text`, and is overridden while typing.
    let draft = $derived(text)
    const new_text = $derived(draft.trim())
    // Saving without changes is always allowed (it cancels the edit).
    const error_message = $derived(new_text && new_text !== text ? validate?.(new_text) : undefined)

    function start_editing() {
        draft = text
        editing = true
    }

    function save() {
        // The field can also lose focus after an Enter/Escape, once the edit is already over.
        if (!editing) return
        if (error_message) {
            cancel()
            return
        }
        editing = false

        if (!new_text) {
            on_delete?.()
        } else if (new_text !== text) {
            on_save(new_text)
        } else {
            on_cancel?.()
        }
    }

    function cancel() {
        editing = false
        draft = text
        on_cancel?.()
    }

    /** @param {KeyboardEvent & { currentTarget: HTMLInputElement }} event */
    function handle_keydown(event) {
        if (event.key === 'Enter') {
            event.preventDefault()
            if (error_message) {
                // Shows the browser's validation bubble with the error.
                event.currentTarget.reportValidity()
            } else {
                save()
            }
        } else if (event.key === 'Escape') {
            cancel()
        }
    }

    /** @param {HTMLInputElement} input */
    function focus_and_select(input) {
        input.focus()
        input.select()
    }

    /** @param {HTMLInputElement} input */
    function sync_validity(input) {
        // Re-run when `error_message` changes: the field is `:invalid` while there is an error.
        input.setCustomValidity(error_message ?? '')
    }
</script>

{#if editing}
    <input type="text"
           class="tag-input"
           size={Math.max(draft.length, 4)}
           aria-label="Modifier le texte"
           bind:value={draft}
           onkeydown={handle_keydown}
           onblur={save}
           {@attach focus_and_select}
           {@attach sync_validity} />
{:else}
    <button type="button" class="tag" title="Cliquer pour modifier" onclick={start_editing}>
        {text}
    </button>
{/if}

<style>
    .tag {
        display: inline-block;
        padding: 0.2em 0.6em;
        border: none;
        border-radius: 0.4em;
        background-color: var(--tag-color);
        color: white;
        font: inherit;
        cursor: pointer;
        transition: background-color 0.2s ease;
    }

    .tag:hover {
        background-color: var(--active-tag-color);
    }

    .tag:focus-visible {
        outline: 0.1em solid var(--focus-visible-color);
    }

    .tag-input {
        display: inline-block;
        /* Same size as the tag: its padding minus the border. */
        padding: calc(0.2em - 1px) calc(0.6em - 1px);
        border: 1px solid var(--active-tag-color);
        border-radius: 0.4em;
        background-color: white;
        color: black;
        font: inherit;
    }

    .tag-input:invalid {
        border-color: #c92a2a;
        outline-color: #c92a2a;
    }
</style>
