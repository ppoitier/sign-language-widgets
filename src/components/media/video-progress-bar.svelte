<script>
    let {duration, onFinished = () => {}} = $props()

    $effect(() => {
        const timeout_id = setTimeout(onFinished, duration * 1000)
        return () => {
            clearTimeout(timeout_id)
        }
    })
</script>

{#key duration}
    <div class="video-progress-bar"
         style:animation-duration="{duration}s"
    >
    </div>
{/key}

<style>
    .video-progress-bar {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 0;
        height: 1rem;
        background-color: var(--progress-bar-color);
        animation: bar-progression;
        animation-timing-function: linear;
        animation-fill-mode: forwards;
    }

    @keyframes bar-progression {
        0% {
            width: 0;
        }
        100% {
            width: 100%;
        }
    }
</style>