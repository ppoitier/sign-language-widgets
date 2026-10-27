<!--
@component
Countdown displayed as "Prêt ? N", decreasing every second.
Calls `onFinished` when it reaches zero (immediately if `duration <= 0`). Changing `duration` restarts it.

```svelte
<Timer duration={3} onFinished={() => start_recording()} />
```
-->

<script>
    /**
     * @typedef {Object} TimerProps
     * @property {number} duration - Countdown length, in seconds.
     * @property {() => void} [onFinished] - Called when the countdown reaches zero.
     */

    /** @type {TimerProps} */
    let {duration, onFinished = () => {}} = $props()
    let remaining_time = $state(0)

    $effect(() => {
        remaining_time = duration
        if (duration <= 0) {
            onFinished()
            return
        }
        const timer_id = setInterval(() => {
            remaining_time = remaining_time - 1
            if (remaining_time <= 0) {
                clearInterval(timer_id)
                onFinished()
            }
        }, 1000)
        return () => {
            clearInterval(timer_id)
        }
    })
</script>

<h1>Prêt ? {remaining_time}</h1>
