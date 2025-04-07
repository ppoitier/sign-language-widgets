<script>
    import CheckboxListIcon from '../icons/checkbox-list-icon.svelte'

    /**
     * @type {{
     *     options: {id: string, name: string, selected: boolean}[]
     *     default_text: string,
     *     id?: string,
     *     search_placeholder?: string,
     * }}
     */
    let {options = $bindable(), default_text = 'All', id = 'multi-select', search_placeholder = 'Search entry...'} = $props()

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

<div class="multi-select" class:opened>
    <div class="multi-select_field">
        <div class="multi-select_option">
            <input type="checkbox" name="{id}_all" id="{id}_all" checked={all_selected} onclick={all_button_clicked}>
            <label for="{id}_all">{default_text}</label>
        </div>
        <button class="multi-select_icon" onclick={() => (opened = !opened)}>
            <CheckboxListIcon/>
        </button>
    </div>
    <div class="multi-select_options">
        <div class="multi-select_option">
            <input type="text" name="{id}_search" id="{id}_search" class="multi-select_search"
                   placeholder={search_placeholder} bind:value={search}/>
        </div>
        {#each filtered_options as option}
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