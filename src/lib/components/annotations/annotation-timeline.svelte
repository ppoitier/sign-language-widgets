<!--
@component
Annotation timeline: an overview strip of the whole duration with a brush selecting a time range,
and one detail row per tier showing the annotations of that range.
Clicking a row seeks the playhead, dragging on it selects a new range.
Times are in seconds (any unit works, as long as `duration` and the annotations use the same).

```svelte
<script>
    let current_time = $state(0)
    const tiers = [
        { id: 'speech', name: 'Speech', annotations: [{ id: 1, start: 2, end: 6, label: 'intro' }] },
        { id: 'gesture', name: 'Gesture', annotations: [{ id: 2, start: 10, end: 14, label: 'action' }] },
    ]
</script>

<AnnotationTimeline duration={60} {tiers} bind:current_time
                    on_annotation_click={(a) => console.log('clicked', a)}
                    on_seek={({ time }) => console.log('seek', time)} />
```
-->

<script>
    import { untrack } from 'svelte'
    import TimelineOverview from './timeline-overview.svelte'
    import AnnotationTier from './annotation-tier.svelte'
    import {
        DEFAULT_COLOR_PALETTE,
        build_color_for_label,
        clamp,
        clamp_range_span,
        create_linear_scale,
    } from './timeline-utils.js'

    /**
     * @typedef {import('./timeline-utils.js').Annotation} Annotation
     * @typedef {import('./timeline-utils.js').Tier}       Tier
     * @typedef {import('./timeline-utils.js').SeekEvent}  SeekEvent
     */

    /**
     * @typedef {Object} Props
     * @property {number}   duration                         Total timeline length.
     * @property {Tier[]}   [tiers=[]]                       Annotation tiers to render as stacked detail rows.
     * @property {number}   [current_time=0]                 Bindable playhead position.
     * @property {boolean}  [follow_playback=true]           Keep the brush centered on the playhead.
     * @property {number}   [width=800]                      Outer width, px.
     * @property {number}   [overview_height=50]             Height of the top overview strip, px.
     * @property {number}   [tier_height=80]                 Height of each tier's detail row, px.
     * @property {number}   [overview_detail_gap=16]         Vertical gap between overview and first tier, px.
     * @property {number}   [tier_gap=4]                     Vertical gap between tiers, px.
     * @property {number}   [horizontal_padding=8]           Left/right inner padding used by every row, px.
     * @property {number}   [brush_handle_width=8]           Width of each brush handle, px.
     * @property {number}   [keyboard_step=1]                Arrow-key seek/brush step, in time units.
     * @property {number}   [max_selection_span=60]          Max length of the selected range, in time units.
     * @property {number}   [label_min_pixels_per_unit=3]    Below this zoom (px per time-unit), all annotation labels are hidden.
     * @property {string[]} [color_palette]                  Palette used for per-label colors.
     * @property {boolean}  [show_tier_names=true]           Render each tier's name chip inside its row.
     * @property {(a: Annotation) => void}           [on_annotation_click]
     * @property {(e: SeekEvent) => void}            [on_seek]
     * @property {(range: [number, number]) => void} [on_selection_change]  Fires once per completed brush/drag gesture.
     */

    /** @type {Props} */
    let {
        duration,
        tiers = [],
        current_time = $bindable(0),
        follow_playback = true,

        // Sizing — every visual constant is an overridable prop.
        width = 800,
        overview_height = 50,
        tier_height = 80,
        overview_detail_gap = 16,
        tier_gap = 4,
        horizontal_padding = 8,
        brush_handle_width = 8,
        keyboard_step = 1,
        max_selection_span = 60,
        label_min_pixels_per_unit = 3,

        // Styling.
        color_palette = DEFAULT_COLOR_PALETTE,
        show_tier_names = true,

        // Events.
        on_annotation_click,
        on_seek,
        on_selection_change,
    } = $props()

    // --------- State ---------
    // Starts at the beginning of the timeline, reset when the duration or the max span change;
    // the brush, the tiers and the playback-following effect then reassign it.
    /** @type {[number, number]} */
    let selected_range = $derived(
        clamp_range_span([0, duration], duration, 0, max_selection_span, 'start')
    )

    // --------- Derived ---------
    const merged_annotations = $derived(tiers.flatMap((tier) => tier.annotations))

    const color_for_label = $derived(
        build_color_for_label(merged_annotations.map((a) => a.label), color_palette)
    )

    // Overview maps full duration onto the padded pixel range.
    const overview_scale = $derived(
        create_linear_scale([0, duration], [horizontal_padding, width - horizontal_padding])
    )

    // Detail maps *only the selected range* onto the same padded pixel range.
    const detail_scale = $derived(
        create_linear_scale(selected_range, [horizontal_padding, width - horizontal_padding])
    )

    const min_selection_span = $derived(Math.min(duration * 0.01, max_selection_span))

    // --------- Effects ---------
    // Keep the brushed range centered on the playhead while follow_playback is true.
    // untrack() stops the effect from re-running because of its own writes.
    $effect(() => {
        if (!follow_playback || current_time == null) return
        const time = current_time
        const dur = duration
        const cap = max_selection_span
        const min_span = min_selection_span
        untrack(() => {
            const raw_span = selected_range[1] - selected_range[0]
            const span = clamp(raw_span, min_span, Math.min(cap, dur))
            const new_start = clamp(time - span / 2, 0, dur - span)
            if (new_start !== selected_range[0] || span !== raw_span) {
                selected_range = [new_start, new_start + span]
            }
        })
    })
</script>

<div class="timeline" style:width="{width}px">
    <TimelineOverview
        {width}
        height={overview_height}
        {duration}
        bind:current_time
        bind:selected_range
        scale={overview_scale}
        annotations={merged_annotations}
        {color_for_label}
        handle_width={brush_handle_width}
        min_span={min_selection_span}
        max_span={max_selection_span}
        {keyboard_step}
        {on_seek}
        on_selection_change_commit={on_selection_change}
    />

    <div class="tiers" style:gap="{tier_gap}px" style:margin-top="{overview_detail_gap}px">
        {#each tiers as tier (tier.id)}
            <AnnotationTier
                {width}
                height={tier_height}
                {duration}
                {tier}
                bind:selected_range
                bind:current_time
                scale={detail_scale}
                {color_for_label}
                {keyboard_step}
                min_span={min_selection_span}
                max_span={max_selection_span}
                {label_min_pixels_per_unit}
                show_tier_name={show_tier_names}
                {on_annotation_click}
                {on_seek}
                on_selection_change_commit={on_selection_change}
            />
        {/each}
    </div>
</div>

<style>
    .timeline {
        font: 12px system-ui, sans-serif;
    }

    .tiers {
        display: flex;
        flex-direction: column;
    }
</style>
