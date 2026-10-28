<!--
@component
Responsive grid of cards (e.g. `VideoCard`): a single column on small screens, then as many
columns as fit (each at least `min_column_width` wide), up to `max_columns`.
Columns share the remaining space, so a card is always less than twice `min_column_width` wide
(until `max_columns` is reached). Each card keeps its own height: a tall card doesn't stretch
the others of its row.

```svelte
<CardGrid max_columns={6}>
    {#each videos as video (video.id)}
        <VideoCard src={video.url}>
            <h3>{video.title}</h3>
        </VideoCard>
    {/each}
</CardGrid>
```
-->

<script>
    /**
     * @typedef {import('svelte').Snippet} Snippet
     *
     * @typedef {Object} Props
     * @property {number} [max_columns=8] - Maximum number of columns.
     * @property {string} [min_column_width='24rem'] - Minimum width of a column (CSS length). On screens narrower than that, the single column takes the whole width.
     * @property {string} [gap='1rem'] - Space between the cards (CSS length).
     * @property {Snippet} children - The cards, each one being a cell of the grid.
     */

    /** @type {Props} */
    let { max_columns = 8, min_column_width = '24rem', gap = '1rem', children } = $props()
</script>

<div class="card-grid" style:--max-columns={max_columns} style:--min-column-width={min_column_width} style:--gap={gap}>
    {@render children()}
</div>

<style>
    .card-grid {
        /* The columns set the width of the cards: lift the maximum width of `MediaCard`. */
        --card-max-width: 100%;
        /* The width of `max_columns` columns: columns can't get narrower, so there are never more of them. */
        --column-width: max(var(--min-column-width), (100% - (var(--max-columns) - 1) * var(--gap)) / var(--max-columns));

        display: grid;
        /* `min(100%, ...)` avoids overflowing on screens narrower than one column.
           `auto-fill` keeps empty columns, so a few cards don't stretch over the whole row. */
        grid-template-columns: repeat(auto-fill, minmax(min(100%, var(--column-width)), 1fr));
        gap: var(--gap);
        /* Each card keeps its own height, instead of stretching to the tallest card of its row. */
        align-items: start;
    }
</style>
