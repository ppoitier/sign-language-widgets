<!--
@component
Dropdown with a searchable list of checkboxes. The top row toggles every option at once.

Styled with the CSS variables `--field-background`, `--field-border` and `--field-active-background`.

```svelte
<MultiSelectField bind:options default_text="Tous les mots" />
```
-->

<script>
    import CheckboxListIcon from '../icons/checkbox-list-icon.svelte'

    /**
     * @typedef {Object} Props
     * @property {import('./multi-select-option.js').MultiSelectOption[]} options - Bindable list of options. Use `bind:options` to read the selection.
     * @property {string} [default_text='Tout'] - Label of the "select all" row.
     * @property {string} [id='multi-select'] - Prefix for the ids of the "all" and search inputs. Must be unique per page.
     * @property {string} [search_placeholder='Rechercher...'] - Placeholder of the search input.
     */

    /** @type {Props} */
    let {options = $bindable(), default_text = 'Tout', id = 'multi-select', search_placeholder = 'Rechercher...'} = $props()

    let opened = $state(false)
    let search = $state('')
    let all_selected = $derived(options.every(o => o.selected))
    let filtered_options = $derived(options.filter(o => o.name.toLowerCase().includes(search.toLowerCase())))

    function all_button_clicked() {
        if (all_selected) {
            options = options.map(o => ({...o, selected: false}))
        } else {
            options = options.map(o => ({...o, selected: true}))
        }
    }
</script>

<div class={['multi-select', { opened }]}>
    <div class="multi-select_field">
        <div class="multi-select_option">
            <input type="checkbox" name="{id}_all" id="{id}_all" checked={all_selected} onclick={all_button_clicked}>
            <label for="{id}_all">{default_text}</label>
        </div>
        <button class="multi-select_icon" type="button" aria-label="Choisir les options" title="Choisir les options"
                aria-expanded={opened} onclick={() => (opened = !opened)}>
            <CheckboxListIcon/>
        </button>
    </div>
    <!-- Hidden by a transform when closed: `inert` keeps its fields out of the keyboard navigation. -->
    <div class="multi-select_options" inert={!opened}>
        <div class="multi-select_option">
            <input type="text" name="{id}_search" id="{id}_search" class="multi-select_search"
                   aria-label={search_placeholder} placeholder={search_placeholder} bind:value={search}/>
        </div>
        {#each filtered_options as option (option.id)}
            <div class="multi-select_option">
                <input type="checkbox" name={option.id} id={option.id} bind:checked={option.selected}/>
                <label for={option.id}>{option.name}</label>
            </div>
        {/each}
    </div>
</div>

<style>
    .multi-select {
        position: relative;
        display: inline-block;
        min-width: 8em;
    }

    .multi-select_field {
        position: relative;
        display: flex;
        height: 100%;
        background: var(--field-background);
        border: var(--field-border);
        border-radius: .25em;
        isolation: isolate;
        overflow: hidden;
    }

    .multi-select_option {
        flex-grow: 1;
        display: flex;
        align-items: center;
        gap: .5em;
        padding: .2em .2em;
    }

    .multi-select_option:nth-child(n + 3) {
        border-top: var(--field-border);
    }

    .multi-select_search {
        width: 100%;
        font-size: 1em;
        padding: 0 .2em;
    }

    .multi-select_icon {
        outline: none;
        border: none;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        padding: 0 .2em;
        border-left: var(--field-border);
        font-size: 1.2em;
    }

    .multi-select_icon:hover, .multi-select_icon:active {
        background: var(--field-active-background);
    }

    .multi-select_options {
        position: absolute;
        top: 100%;
        left: 0;
        width: 100%;
        max-height: 16em;
        overflow: auto;
        padding: .4rem 0;
        background: var(--field-background);
        border: var(--field-border);
        border-top: none;
        border-bottom-right-radius: .25em;
        border-bottom-left-radius: .25em;
        z-index: 1000;
        transform-origin: top;
        transform: scaleY(0);
        opacity: 0;
        transition: transform .2s, opacity .2s;
    }

    .multi-select.opened > .multi-select_field {
        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;
    }

    .multi-select.opened > .multi-select_options {
        transform: scaleY(1);
        opacity: 1;
    }


</style>