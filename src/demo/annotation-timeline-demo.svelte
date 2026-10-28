<script>
    import AnnotationTimeline from '../lib/components/annotations/annotation-timeline.svelte'
    import VideoPlayer from '../lib/components/media/video-player.svelte'

    /**
     * @typedef {import('../lib/components/annotations/timeline-utils.js').Annotation} Annotation
     * @typedef {import('../lib/components/annotations/timeline-utils.js').Tier} Tier
     * @typedef {{ start_ms: number, end_ms: number, gloss: string }} RawAnnotation
     */

    const VIDEO_URL = `${import.meta.env.BASE_URL}continuous-sample/CLSFBI0110A_S002_B.mp4`
    const ANNOTATIONS_URL = `${import.meta.env.BASE_URL}continuous-sample/annotations.json`

    // Only these tiers are displayed, in this order.
    /** @type {Record<string, string>} */
    const TIER_NAMES = {
        left_hand: 'Main gauche',
        right_hand: 'Main droite',
        both_hands: 'Deux mains',
    }

    // Shared by the video and the timeline: each one follows the other.
    let current_time = $state(0)
    /** @type {Tier[]} */
    let tiers = $state([])
    /** @type {Error | null} */
    let error = $state(null)

    const duration = $derived(Math.max(0, ...tiers.flatMap((tier) => tier.annotations.map((a) => a.end))))

    /**
     * @param {RawAnnotation} raw
     * @returns {Annotation}
     */
    function to_annotation(raw) {
        return {
            id: crypto.randomUUID(),
            start: raw.start_ms / 1000,
            end: raw.end_ms / 1000,
            label: raw.gloss,
        }
    }

    /**
     * @param {AbortSignal} signal
     * @returns {Promise<Tier[]>}
     */
    async function load_tiers(signal) {
        const response = await fetch(ANNOTATIONS_URL, { signal })
        if (!response.ok) {
            throw new Error(`HTTP ${response.status} lors du chargement de ${ANNOTATIONS_URL}`)
        }
        /** @type {Record<string, RawAnnotation[]>} */
        const data = await response.json()

        return Object.entries(TIER_NAMES).map(([id, name]) => ({
            id,
            name,
            annotations: (data[id] ?? []).map(to_annotation),
        }))
    }

    $effect(() => {
        const controller = new AbortController()

        load_tiers(controller.signal)
            .then((loaded) => (tiers = loaded))
            .catch((e) => {
                if (e.name !== 'AbortError') error = e
            })

        return () => controller.abort()
    })
</script>

<div class="demo">
    <VideoPlayer src={VIDEO_URL} autoplay={false} bind:current_time />

    {#if error}
        <p>Impossible de charger les annotations : {error.message}</p>
    {:else if tiers.length === 0}
        <p>Chargement des annotations…</p>
    {:else}
        <!-- Clicking an annotation jumps the video to its start. Shows 10 s at first, up to 60 s (default max). -->
        <AnnotationTimeline
            {duration}
            {tiers}
            bind:current_time
            default_selection_span={10}
            on_annotation_click={(a) => current_time = a.start}
        />
    {/if}
</div>

<style>
    .demo {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        /* The timeline fills this width. */
        max-width: 100rem;
        padding: 2rem;
    }
</style>
