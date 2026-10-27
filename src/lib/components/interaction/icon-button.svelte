<!--
@component
Borderless button meant to wrap an icon.

Colors come from the CSS variables `--active-button-color` (hover/focus) and `--focus-visible-color` (focus ring).

```svelte
<IconButton label="Add a sign" onclick={add}>
    <AddIcon />
</IconButton>
```
-->

<script>
    /**
     * @import { Snippet } from 'svelte'
     * @typedef {Object} IconButtonProps
     * @property {Snippet} children - Button content, usually an icon.
     * @property {(event: MouseEvent) => void} [onclick] - Click handler.
     * @property {string} [label='Button'] - Accessible name (`aria-label`) of the button.
     */

    /** @type {IconButtonProps} */
    let {children, onclick, label="Button"} = $props()
</script>

<button class="icon-button" onclick={onclick} aria-label={label}>
    {@render children()}
</button>

<style>
    .icon-button {
        display: inline-block;
        background: none;
        border: none;
        outline: none;
        text-decoration: none;
        font-size: 1em;
    }

    .icon-button:hover, .icon-button:focus {
        color: var(--active-button-color);
    }

    .icon-button:focus-visible {
        outline: .15rem solid var(--focus-visible-color);
    }
</style>
