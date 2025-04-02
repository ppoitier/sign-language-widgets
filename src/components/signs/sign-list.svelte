<script>
    import SignListItem from "./sign-list-item.svelte"

    let entries = [1, 2, 3, 4, 5, 6, 7, 8]
</script>

<table class="sign-list">
    <thead>
    <tr>
        <th scope="col">Aperçu</th>
        <th scope="col">Mots associés</th>
        <th scope="col"></th>
    </tr>
    </thead>
    <tbody>
    {#each entries as entry}
        <SignListItem/>
    {/each}
    </tbody>
</table>

<style>
    .sign-list {
        width: 100%;
        font-size: 1.2rem;
        border-collapse: collapse;
    }

    .sign-list th {
        padding: .5rem;
        border-top: .1rem solid lightgray;
        border-bottom: .25rem solid lightgray;
        font-weight: bold;
        letter-spacing: .2rem;
    }

    .sign-list :global(tr:nth-child(even)) {
        background-color: #ececec;
    }

    .sign-list :global(td) {
        border-bottom: .15rem solid lightgray;
    }

    .sign-list :global(tr:last-child > td) {
        border-bottom: none;
    }

    .sign-list th:nth-child(1),
    .sign-list :global(td:nth-child(1)) {
        width: 40%;
        max-width: 32rem;
    }

    .sign-list :global(td:nth-child(2)) {
        vertical-align: top;
        text-align: left;
    }

    .sign-list th:nth-child(3),
    .sign-list :global(td:nth-child(3)) {
        width: 5rem;
    }
</style>