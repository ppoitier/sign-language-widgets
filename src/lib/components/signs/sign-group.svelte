<!--
@component
Signs shown as a grid of `SignCard`s or a list of `SignListItem`s, with buttons to switch between both (`mode`).
The action snippets get the sign: write the buttons directly in the app, where the sign is at hand.

```svelte
<SignGroup {signs} bind:mode
           on_word_added={(sign, text) => add_word(sign, text)}
           on_word_updated={(sign, word_id, text) => rename_word(sign, word_id, text)}
           on_word_deleted={(sign, word_id) => remove_word(sign, word_id)}>
    {#snippet video_actions_right(sign)}
        <VideoAction label="Télécharger" onclick={() => download(sign)}><DownloadIcon /></VideoAction>
    {/snippet}
</SignGroup>
```
-->

<script>
    import CardGrid from '../layout/card-grid.svelte'
    import SignCard from './sign-card.svelte'
    import SignList from './sign-list.svelte'
    import SignListItem from './sign-list-item.svelte'
    import GridIcon from '../icons/grid-icon.svelte'
    import ListIcon from '../icons/list-icon.svelte'

    /**
     * @typedef {import('./sign-item.js').SignItem} SignItem
     * @typedef {import('svelte').Snippet<[SignItem]>} SignSnippet
     *
     * @typedef {Object} Props
     * @property {SignItem[]} signs - Signs of the group.
     * @property {'grid' | 'list'} [mode='grid'] - Bindable. Display of the signs, switched by the user with the buttons.
     * @property {(sign: SignItem, text: string) => void} [on_word_added] - Called with the sign and the text of a new word.
     * @property {(sign: SignItem, word_id: string, text: string) => void} [on_word_updated] - Called with the sign, and the id and new text of an edited word.
     * @property {(sign: SignItem, word_id: string) => void} [on_word_deleted] - Called with the sign and the id of a deleted word.
     * @property {SignSnippet | undefined} [video_actions_left] - Actions added to the top-left corner of each video, given the sign.
     * @property {SignSnippet | undefined} [video_actions_right] - Actions added to the top-right corner of each video, given the sign.
     * @property {SignSnippet | undefined} [actions] - Actions shown next to the words of each sign, given the sign.
     */

    /** @type {Props} */
    let {
        signs,
        mode = $bindable('grid'),
        on_word_added,
        on_word_updated,
        on_word_deleted,
        video_actions_left,
        video_actions_right,
        actions,
    } = $props()

    // Both have the same props.
    const Item = $derived(mode === 'grid' ? SignCard : SignListItem)
</script>

{#snippet items()}
    {#each signs as sign (sign.id)}
        <!-- Snippets of the sign: the given snippets, applied to it. -->
        {#snippet sign_video_actions_left()}{@render video_actions_left?.(sign)}{/snippet}
        {#snippet sign_video_actions_right()}{@render video_actions_right?.(sign)}{/snippet}
        {#snippet sign_actions()}{@render actions?.(sign)}{/snippet}

        <Item src={sign.src} poster={sign.poster} words={sign.words}
              editable={sign.editable} highlighted={sign.highlighted}
              on_word_added={(text) => on_word_added?.(sign, text)}
              on_word_updated={(word_id, text) => on_word_updated?.(sign, word_id, text)}
              on_word_deleted={(word_id) => on_word_deleted?.(sign, word_id)}
              video_actions_left={video_actions_left && sign_video_actions_left}
              video_actions_right={video_actions_right && sign_video_actions_right}
              actions={actions && sign_actions} />
    {/each}
{/snippet}

<div class="sign-group">
    <div class="sign-group_modes">
        <button type="button" class="mode-button" aria-label="Afficher en grille" title="Afficher en grille"
                aria-pressed={mode === 'grid'} onclick={() => mode = 'grid'}>
            <GridIcon />
        </button>
        <button type="button" class="mode-button" aria-label="Afficher en liste" title="Afficher en liste"
                aria-pressed={mode === 'list'} onclick={() => mode = 'list'}>
            <ListIcon />
        </button>
    </div>

    {#if mode === 'grid'}
        <CardGrid min_column_width="32rem">
            {@render items()}
        </CardGrid>
    {:else}
        <SignList>
            {@render items()}
        </SignList>
    {/if}
</div>

<style>
    .sign-group {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .sign-group_modes {
        display: flex;
        justify-content: flex-end;
        gap: 0.4rem;
    }

    .mode-button {
        display: grid;
        place-items: center;
        padding: 0.4rem;
        border: 0.1rem solid var(--button-color);
        border-radius: 0.6rem;
        background: none;
        color: var(--button-color);
        font-size: 2.4rem;
        cursor: pointer;
        transition: background-color 0.2s, color 0.2s;
    }

    .mode-button:hover {
        color: var(--active-button-color);
    }

    .mode-button[aria-pressed='true'] {
        background-color: var(--button-color);
        color: white;
    }

    .mode-button:focus-visible {
        outline: 0.2rem solid var(--focus-visible-color);
    }
</style>
