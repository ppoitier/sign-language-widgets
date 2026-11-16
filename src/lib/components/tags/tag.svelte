<!--
@component
Read-only label, colored with the CSS variable `--tag-color`.

```svelte
<Tag text="bonjour" />
```
-->

<script>
    /**
     * @typedef {Object} Props
     * @property {string} text - Text of the tag.
     */

    /** @type {Props} */
    let { text } = $props()
</script>

<span class="tag">{text}</span>

<style>
    .tag {
        display: inline-block;
        padding: 0.2em 0.6em;
        border-radius: 0.4em;
        background-color: var(--tag-color);
        color: white;
    }
</style>
