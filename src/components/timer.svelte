<script>
    let {duration, onFinished} = $props()
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
