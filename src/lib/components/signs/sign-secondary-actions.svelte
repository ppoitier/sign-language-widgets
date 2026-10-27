<script>
    import SignAction from './sign-action.svelte'
    import HideIcon from '../icons/hide-icon.svelte'
    import AddVideoIcon from '../icons/add-video-icon.svelte'

    let {editable = false, on_hide, on_add_from} = $props()
</script>


{#if editable}
    <SignAction color="#eb4034" onclick={on_hide}>
        <HideIcon/>
    </SignAction>
{/if}

<SignAction color="#346beb" onclick={on_add_from}>
    <AddVideoIcon/>
</SignAction>
