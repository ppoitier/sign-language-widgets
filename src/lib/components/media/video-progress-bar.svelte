<!--
@component
Linear progress bar animated along the bottom of its positioned parent.
Calls `onFinished` once `duration` seconds have elapsed. Changing `duration` restarts it.

Colored with the CSS variable `--progress-bar-color`.

```svelte
<VideoProgressBar duration={5} onFinished={() => console.log('done')} />
```
-->

<script>
    /**
     * @typedef {Object} VideoProgressBarProps
     * @property {number} duration - Animation length, in seconds.
     * @property {() => void} [onFinished] - Called when the animation ends.
     */

    /** @type {VideoProgressBarProps} */
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