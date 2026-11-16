<script>
    import SignList from '../lib/components/signs/sign-list.svelte'
    import SignListItem from '../lib/components/signs/sign-list-item.svelte'
    import VideoAction from '../lib/components/media/video-action.svelte'
    import DownloadIcon from '../lib/components/icons/download-icon.svelte'
    import InfoIcon from '../lib/components/icons/info-icon.svelte'
    import HideIcon from '../lib/components/icons/hide-icon.svelte'
    import AddVideoIcon from '../lib/components/icons/add-video-icon.svelte'
    import { create_sample_signs, add_word, rename_word, remove_word } from './sample-signs.js'

    let signs = $state(create_sample_signs())
    let last_action = $state('')
</script>

<div class="demo">
    <p>Dernière action : {last_action || 'aucune'}</p>

    <SignList>
        {#each signs as sign (sign.id)}
            <SignListItem src={sign.src} words={sign.words} editable={sign.editable} highlighted={sign.highlighted}
                          on_word_added={(text) => add_word(sign, text)}
                          on_word_updated={(word_id, text) => rename_word(sign, word_id, text)}
                          on_word_deleted={(word_id) => remove_word(sign, word_id)}>
                {#snippet video_actions_right()}
                    <VideoAction label="Télécharger" onclick={() => last_action = `télécharger ${sign.id}`}>
                        <DownloadIcon />
                    </VideoAction>
                    <VideoAction label="Informations" onclick={() => last_action = `informations ${sign.id}`}>
                        <InfoIcon />
                    </VideoAction>
                {/snippet}
                {#snippet video_actions_left()}
                    {#if sign.editable}
                        <VideoAction label="Masquer" onclick={() => last_action = `masquer ${sign.id}`}>
                            <HideIcon />
                        </VideoAction>
                    {/if}
                    <VideoAction label="Ajouter un signe à partir de celui-ci" onclick={() => last_action = `ajouter à partir de ${sign.id}`}>
                        <AddVideoIcon />
                    </VideoAction>
                {/snippet}
            </SignListItem>
        {/each}
    </SignList>

    <pre>{JSON.stringify(signs.map((s) => ({ id: s.id, words: s.words.map((w) => w.text) })), null, 2)}</pre>
</div>

<style>
    .demo {
        display: flex;
        flex-direction: column;
        gap: 2rem;
        padding: 2rem;
    }

    pre {
        font-size: 1.2rem;
    }
</style>
