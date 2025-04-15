<script>
    import SignListItem from "./sign-list-item.svelte"

    /**
     * @typedef {import('../../entities/sign.js').Sign} Sign
     *
     * @typedef {Object} SignListProps
     * @property {Sign[]} signs - Signs that are displayed in the group.
     * @property {NewWordCallback} on_new_word - Function called when a new word is added to a sign.
     * @property {UpdatedWordCallback} on_updated_word - Function called when a word of a sign is updated.
     */

    /**
     * @callback NewWordCallback
     * @param {string} sign_id
     * @param {string} new_word
     */

    /**
     * @callback UpdatedWordCallback
     * @param {string} sign_id
     * @param {number} word_index
     * @param {string} new_word
     */

    /** @type {SignListProps} */
    let {signs, on_new_word, on_updated_word} = $props()
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
    {#each signs as sign}
        <SignListItem {sign} {on_new_word} {on_updated_word}/>
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