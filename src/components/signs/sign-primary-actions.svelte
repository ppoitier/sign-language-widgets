<script>
    import SignAction from "./sign-action.svelte";
    import DownloadIcon from "../icons/download-icon.svelte";
    import InfoIcon from "../icons/info-icon.svelte";

    let {on_download, on_info} = $props()
</script>


<SignAction onclick={on_download}>
    <DownloadIcon/>
</SignAction>

<SignAction onclick={on_info}>
    <InfoIcon/>
</SignAction>
