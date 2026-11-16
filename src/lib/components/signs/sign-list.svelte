<!--
@component
List of signs, one `SignListItem` per row (the list counterpart of a `CardGrid` of `SignCard`s).

```svelte
<SignList>
    {#each signs as sign (sign.id)}
        <SignListItem src={sign.url} words={sign.words} />
    {/each}
</SignList>
```
-->

<script>
    /**
     * @typedef {Object} Props
     * @property {import('svelte').Snippet} children - The `SignListItem`s of the list.
     */

    /** @type {Props} */
    let { children } = $props()
</script>

<ul class="sign-list">
    {@render children()}
</ul>

<style>
    .sign-list {
        margin: 0;
        padding: 0;
        list-style: none;
        overflow: hidden;
        border: 0.1rem solid var(--card-border);
        border-radius: 0.8rem;
        background-color: var(--card-background);
    }
</style>
