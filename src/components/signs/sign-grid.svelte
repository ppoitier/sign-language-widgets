<script>
    import SignCard from "./sign-card.svelte"

    /**
     * @typedef {import('../../entities/sign.js').Sign} Sign
     *
     * @typedef {Object} SignGridProps
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

    /** @type {SignGridProps} */
    let {signs, on_new_word, on_updated_word} = $props()
</script>

<div>
    {#each signs as sign}
        <SignCard {sign} {on_new_word} {on_updated_word} />
    {/each}
</div>

<style>
    div {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(var(--card-min-width), 1fr));
        justify-content: space-evenly;
        align-items: start;
        gap: 2rem;
        min-height: 24rem;
    }
</style>
