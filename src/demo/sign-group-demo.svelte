<script>
    import SignGroup from '../lib/components/signs/sign-group.svelte'
    import VideoAction from '../lib/components/media/video-action.svelte'
    import VideoDownloadDialog from '../lib/components/media/video-download-dialog.svelte'
    import DownloadIcon from '../lib/components/icons/download-icon.svelte'
    import InfoIcon from '../lib/components/icons/info-icon.svelte'
    import HideIcon from '../lib/components/icons/hide-icon.svelte'
    import AddVideoIcon from '../lib/components/icons/add-video-icon.svelte'
    import { create_sample_signs, add_word, rename_word, remove_word } from './sample-signs.js'

    /** @typedef {import('../lib/components/signs/sign-item.js').SignItem} SignItem */

    let signs = $state(create_sample_signs())
    /** @type {'grid' | 'list'} */
    let mode = $state('grid')
    let last_action = $state('')

    let download_open = $state(false)
    /** @type {SignItem | undefined} */
    let download_sign = $state()

    /** @param {SignItem} sign */
    function ask_download(sign) {
        download_sign = sign
        download_open = true
    }

    /** @param {SignItem} sign */
    function hide(sign) {
        signs = signs.filter((s) => s.id !== sign.id)
        last_action = `masquer ${sign.id}`
    }
</script>

<div class="demo">
    <p>Affichage : {mode} — dernière action : {last_action || 'aucune'}</p>

    <SignGroup {signs} bind:mode
               on_word_added={add_word}
               on_word_updated={rename_word}
               on_word_deleted={remove_word}>
        {#snippet video_actions_right(sign)}
            <VideoAction label="Télécharger" onclick={() => ask_download(sign)}>
                <DownloadIcon />
            </VideoAction>
            <VideoAction label="Informations" onclick={() => last_action = `informations ${sign.id}`}>
                <InfoIcon />
            </VideoAction>
        {/snippet}
        {#snippet video_actions_left(sign)}
            {#if sign.editable}
                <VideoAction label="Masquer" onclick={() => hide(sign)}>
                    <HideIcon />
                </VideoAction>
            {/if}
            <VideoAction label="Ajouter un signe à partir de celui-ci" onclick={() => last_action = `ajouter à partir de ${sign.id}`}>
                <AddVideoIcon />
            </VideoAction>
        {/snippet}
    </SignGroup>

    <VideoDownloadDialog bind:open={download_open}
                         on_download={(format) => last_action = `télécharger ${download_sign?.id} en ${format}`} />
</div>

<style>
    .demo {
        display: flex;
        flex-direction: column;
        gap: 2rem;
        padding: 2rem;
    }
</style>
