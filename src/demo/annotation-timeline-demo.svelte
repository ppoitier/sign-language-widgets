<script>
    import { v4 as uuid_v4 } from 'uuid'

    import AnnotationTimeline from '../lib/components/annotations/AnnotationTimeline.svelte'

    /**
     * @typedef {import('../lib/components/annotations/timeline-utils.js').Annotation} Annotation
     * @typedef {import('../lib/components/annotations/timeline-utils.js').Tier} Tier
     * @typedef {{ start_ms: number, end_ms: number, gloss: string }} RawAnnotation
     */

    // @ts-ignore
    const ANNOTATIONS_URL = `${import.meta.env.BASE_URL}continuous-sample/annotations.json`

    // Only these tiers are displayed, in this order.
    /** @type {Record<string, string>} */
    const TIER_NAMES = {
        left_hand: 'Left Hand',
        right_hand: 'Right Hand',
        both_hands: 'Both Hands',
    }

    let currentTime = $state(0)
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
            id: uuid_v4(),
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
            throw new Error(`HTTP ${response.status} while loading ${ANNOTATIONS_URL}`)
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

{#if error}
    <p>Failed to load annotations: {error.message}</p>
{:else if tiers.length === 0}
    <p>Loading annotations…</p>
{:else}
    <AnnotationTimeline
        {duration}
        {tiers}
        bind:currentTime
        onAnnotationClick={(a) => console.log('clicked', a)}
        onSeek={({ time }) => console.log('seek', time)}
    />
{/if}
