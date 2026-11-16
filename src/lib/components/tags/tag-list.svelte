<!--
@component
List of tags. When `editable`, tags can be edited or deleted (see `EditableTag`), and a button adds new ones.
Two tags can't have the same text (ignoring case): such an edit can't be saved.
The parent owns the tags and updates them in the callbacks.

```svelte
<TagList tags={words} editable
         on_added={(text) => add_word(text)}
         on_updated={(id, text) => rename_word(id, text)}
         on_deleted={(id) => remove_word(id)} />
```
-->

<script>
    import Tag from './tag.svelte'
    import EditableTag from './editable-tag.svelte'
    import AddIcon from '../icons/add-icon.svelte'

    /**
     * @typedef {Object} Props
     * @property {import('./tag-item.js').TagItem[]} tags - Tags of the list.
     * @property {boolean} [editable=false] - If true, tags can be edited, deleted and added.
     * @property {(text: string) => void} [on_added] - Called with the text of a new tag.
     * @property {(id: string, text: string) => void} [on_updated] - Called with the id and the new text of an edited tag.
     * @property {(id: string) => void} [on_deleted] - Called with the id of a deleted tag.
     */

    /** @type {Props} */
    let { tags, editable = false, on_added, on_updated, on_deleted } = $props()

    let adding = $state(false)

    /**
     * Validator of a tag's text (see `EditableTag`): two tags can't have the same text, ignoring case.
     * @param {string | undefined} id - Id of the edited tag, `undefined` for a new one.
     * @returns {(text: string) => string | undefined}
     */
    function unique_text(id) {
        return (text) => {
            const lower_text = text.toLocaleLowerCase()
            const is_duplicate = tags.some((tag) => tag.id !== id && tag.text.toLocaleLowerCase() === lower_text)
            return is_duplicate ? 'Déjà présent dans la liste.' : undefined
        }
    }
</script>

<div class="tag-list">
    {#each tags as tag (tag.id)}
        {#if editable}
            <EditableTag text={tag.text}
                         validate={unique_text(tag.id)}
                         on_save={(text) => on_updated?.(tag.id, text)}
                         on_delete={() => on_deleted?.(tag.id)} />
        {:else}
            <Tag text={tag.text} />
        {/if}
    {/each}

    {#if editable}
        {#if adding}
            <!-- Removed once its edit is over (`adding` becomes false). -->
            <EditableTag text="" bind:editing={adding} validate={unique_text(undefined)} on_save={(text) => on_added?.(text)} />
        {:else}
            <button type="button" class="add-button" aria-label="Ajouter" title="Ajouter" onclick={() => adding = true}>
                <AddIcon />
            </button>
        {/if}
    {/if}
</div>

<style>
    .tag-list {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.4em;
    }

    .add-button {
        display: grid;
        place-items: center;
        padding: 0;
        border: none;
        background: none;
        color: var(--tag-color);
        font-size: 1.6em;
        cursor: pointer;
    }

    .add-button:hover {
        color: var(--active-tag-color);
    }

    .add-button:focus-visible {
        outline: 0.1rem solid var(--focus-visible-color);
    }
</style>
