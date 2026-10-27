<div class="grid-container">
    <div class="grid-item"></div>
    <div class="grid-item"></div>
    <div class="grid-item"></div>
    <div class="grid-item"></div>
    <div class="grid-item"></div>
    <div class="grid-item"></div>
    <div class="grid-item"></div>
    <div class="grid-item"></div>
</div>


<style>
    .grid-container {
        --container-max-width: 1000px;
        --grid-gap: 10px;
        --grid-max-nb-columns: 4;

        /* Calculated minimum width for items and ensure a strict max number of columns */
        --item-min-width: calc((var(--container-max-width) - (var(--grid-max-nb-columns) - 1) * var(--grid-gap)) / var(--grid-max-nb-columns));
        --item-min-height: calc(9 / 16 * var(--item-min-width));

        display: grid;
        gap: var(--grid-gap);
        grid-template-columns: repeat(auto-fit, minmax(var(--item-min-width), 1fr));

        max-width: var(--container-max-width);
        margin: 0 auto;
    }

    .grid-item {
        display: block;
        width: 100%;
        min-width: var(--item-min-width);
        min-height: var(--item-min-height);
        background: red;
    }
</style>
