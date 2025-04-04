<script>
    import SignGrid from './sign-grid.svelte'
    import SignList from './sign-list.svelte'
    import ListIcon from '../icons/list-icon.svelte'
    import GridIcon from '../icons/grid-icon.svelte'
    import IconButton from '../interaction/icon-button.svelte';

    let mode = $state('list')
</script>

<div class="sign-group">
    <div class="sign-group_actions">
        {#if mode === 'list'}
            <IconButton onclick={() => (mode = 'grid')} label="Switch to grid view.">
                <GridIcon/>
            </IconButton>
        {:else}
            <IconButton onclick={() => (mode = 'list')} label="Switch to list view.">
                <ListIcon/>
            </IconButton>
        {/if}
    </div>

    {#if mode === 'list'}
        <SignList/>
    {:else}
        <SignGrid/>
    {/if}
</div>

<style>
    .sign-group_actions {
        text-align: right;
        font-size: 4rem;
        color: red;
    }
</style>

