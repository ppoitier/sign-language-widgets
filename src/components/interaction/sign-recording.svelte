<script>
    import Webcam from '../media/webcam.svelte'
    import Video from '../media/video.svelte';
    import VideoProgressBar from '../media/video-progress-bar.svelte'
    import Timer from './timer.svelte';

    let current_state = $state('waiting')
</script>

{#snippet overlay_content()}
    {#if current_state === 'waiting'}
        <button class="sign-recording_start-button" onclick={() => (current_state = 'timer')}>Commencer l'enregistrement</button>
        <p class="sign-recording_info">
            Une fois l'enregistrement commencé, vous aurez 5 secondes pour enregistrer votre signe. Ensuite, vous
            pourrez soit le valider, soit recommencer, ou même annuler.
        </p>
    {:else if current_state === 'timer'}
        <Timer duration={3} onFinished={() => (current_state = 'recording')}/>
    {/if}
{/snippet}

<div class="sign-recording">
    {#if current_state !== 'finished'}
        <Webcam overlay_content={current_state === 'waiting' || current_state === 'timer' ? overlay_content : null}/>
    {:else}
        <Video url="/sign_sample.webm" mime_type="video/webm"/>
    {/if}
    {#if current_state === 'recording'}
        <VideoProgressBar duration={5} onFinished={() => (current_state = 'finished')}/>
    {/if}
</div>

<style>
    .sign-recording {
        max-width: var(--card-max-width);
        min-width: var(--card-min-width);
        position: relative;
    }

    .sign-recording_start-button {
        all: unset;
        padding: 1rem .5rem;
        font-size: 1.8rem;
        color: white;
        border: .2rem solid white;
        border-radius: 0.8rem;
        background: transparent;
        transition: background .2s, scale .1s;
        text-shadow: 1px 1px 2px black;
    }

    .sign-recording_start-button:focus,
    .sign-recording_start-button:hover {
        background: black;
        scale: 1.05;
    }

    .sign-recording_start-button:focus-visible {
        outline: .2rem solid red;
    }

    .sign-recording_info {
        margin: auto;
        padding-top: 1rem;
        text-align: justify;
        font-size: 1.2rem;
        max-width: 50%;
        text-shadow: 1px 1px 2px black;
    }
</style>

