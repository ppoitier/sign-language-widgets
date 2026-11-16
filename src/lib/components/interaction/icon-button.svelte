<!--
@component
Borderless button meant to wrap an icon. `label` is its accessible name and tooltip.
Over a video (corner actions), use `VideoAction` instead: it stays readable on any image.

Colors come from the CSS variables `--active-button-color` (hover/focus) and `--focus-visible-color` (focus ring).

```svelte
<IconButton label="Ajouter un signe" onclick={add}>
    <AddIcon />
</IconButton>
```
-->

<script>
    /**
     * @typedef {Object} Props
     * @property {import('svelte').Snippet} children - Button content, usually an icon.
     * @property {string} label - Accessible name (`aria-label`) and tooltip of the button.
     * @property {(event: MouseEvent) => void} [onclick] - Click handler.
     */

    /** @type {Props} */
    let { children, label, onclick } = $props()
</script>

<button type="button" class="icon-button" aria-label={label} title={label} {onclick}>
    {@render children()}
</button>

<style>
    .icon-button {
        display: inline-block;
        background: none;
        border: none;
        outline: none;
        color: inherit;
        text-decoration: none;
        font-size: 1em;
        cursor: pointer;
    }

    .icon-button:hover, .icon-button:focus {
        color: var(--active-button-color);
    }

    .icon-button:focus-visible {
        outline: .15rem solid var(--focus-visible-color);
    }
</style>
