<!--
  One detail row for a single tier.

  Renders its own <svg> so tiers compose cleanly in an HTML flex stack. Shows:
    - a clickable track background (seek on click or arrow keys)
    - every annotation that intersects the selected time range
    - the playhead, when the current time is visible
    - the tier name in a small chip (top-left)
-->

<script>
    import Annotation from './annotation.svelte'
    import Playhead from './playhead.svelte'
    import { clamp, clamp_range_span, get_annotation_key } from './timeline-utils.js'

    /**
     * @typedef {import('./timeline-utils.js').Annotation}  AnnotationT
     * @typedef {import('./timeline-utils.js').Tier}        Tier
     * @typedef {import('./timeline-utils.js').LinearScale} LinearScale
     * @typedef {import('./timeline-utils.js').SeekEvent}   SeekEvent
     */

    /**
     * @typedef {Object} Props
     * @property {number}           width
     * @property {number}           height
     * @property {number}           duration
     * @property {Tier}             tier
     * @property {[number, number]} selected_range           Bindable: a drag on the track redraws it.
     * @property {number}           current_time             Bindable: written on track click.
     * @property {LinearScale}      scale
     * @property {(label: string) => string} color_for_label
     * @property {number}           [keyboard_step=1]
     * @property {number}           [annotation_padding=16]  Inner vertical padding around bars, px.
     * @property {number}           [min_span]               Min selection width when redrawing by drag, in time units.
     * @property {number}           [max_span]               Max selection width when redrawing by drag, in time units.
     * @property {number}           [label_min_pixels_per_unit=3]  Hide all labels below this zoom.
     * @property {number}           [drag_threshold_px=4]    Pointer travel that promotes a click to a drag.
     * @property {boolean}          [show_tier_name=true]
     * @property {(a: AnnotationT) => void}  [on_annotation_click]
     * @property {(e: SeekEvent) => void}    [on_seek]
     * @property {(range: [number, number]) => void} [on_selection_change_commit]
     */

    /** @type {Props} */
    let {
        width,
        height,
        duration,
        tier,
        selected_range = $bindable(),
        current_time = $bindable(),
        scale,
        color_for_label,
        keyboard_step = 1,
        annotation_padding = 16,
        min_span,
        max_span,
        label_min_pixels_per_unit = 3,
        drag_threshold_px = 4,
        show_tier_name = true,
        on_annotation_click,
        on_seek,
        on_selection_change_commit,
    } = $props()

    const effective_min_span = $derived(min_span ?? duration * 0.01)
    const effective_max_span = $derived(Math.min(max_span ?? duration, duration))

    // Pixels per time-unit, derived from the detail scale.
    const pixels_per_unit = $derived(scale(1) - scale(0))
    const labels_visible = $derived(pixels_per_unit >= label_min_pixels_per_unit)

    const visible_annotations = $derived(
        tier.annotations.filter((a) => a.end >= selected_range[0] && a.start <= selected_range[1])
    )

    const playhead_visible = $derived(
        current_time >= selected_range[0] && current_time <= selected_range[1]
    )

    // Track the hovered annotation locally so hover styling stays inside the tier.
    /** @type {string | number | null} */
    let hovered_key = $state(null)

    // ---- Drag-to-select on the tier background ----------------------------------
    // pointerdown anchors a start time and records the *current scale* (frozen
    // at gesture start). pointermove draws a transient overlay; selected_range is
    // NOT touched mid-gesture, so the scale doesn't shift under the pointer.
    // pointerup commits the new selection (or seeks if the pointer never moved).
    /** @type {SVGSVGElement | null} */
    let svg_element = null

    /**
     * Drag state. `scale_at_start` is captured so the gesture keeps using the same
     * time→pixel mapping even though `selected_range` is what drives the live scale.
     * @type {{
     *   anchor_time: number,
     *   anchor_client_x: number,
     *   scale_at_start: LinearScale,
     *   pointer_id: number,
     *   capture_target: Element,
     *   dragging: boolean,
     *   live_range: [number, number],
     * } | null}
     */
    let track_drag = $state(null)

    /** @param {number} time */
    function seek(time) {
        current_time = time
        on_seek?.({ time })
    }

    /** @param {PointerEvent & { currentTarget: SVGRectElement }} event */
    function handle_track_pointer_down(event) {
        if (event.button !== 0) return
        const svg = event.currentTarget.ownerSVGElement
        if (!svg) return
        svg_element = svg
        const { left } = svg.getBoundingClientRect()
        const anchor_time = clamp(scale.invert(event.clientX - left), 0, duration)
        event.currentTarget.setPointerCapture?.(event.pointerId)
        track_drag = {
            anchor_time,
            anchor_client_x: event.clientX,
            // Freeze the scale at the moment of pointerdown. Without this, every
            // mid-drag write to selected_range would re-zoom the tier and the
            // pointer's "time" would jump around.
            scale_at_start: scale,
            pointer_id: event.pointerId,
            capture_target: event.currentTarget,
            dragging: false,
            live_range: [anchor_time, anchor_time],
        }
        window.addEventListener('pointermove', handle_track_pointer_move)
        window.addEventListener('pointerup', handle_track_pointer_up)
    }

    /** @param {PointerEvent} event */
    function handle_track_pointer_move(event) {
        if (!track_drag || !svg_element) return
        if (!track_drag.dragging
            && Math.abs(event.clientX - track_drag.anchor_client_x) < drag_threshold_px) {
            return
        }
        track_drag.dragging = true

        const { left } = svg_element.getBoundingClientRect()
        // Use the FROZEN scale, not the live one. They're equal right now, but this
        // guarantees correctness if a future change writes selected_range mid-drag.
        const t = clamp(track_drag.scale_at_start.invert(event.clientX - left), 0, duration)
        const a = track_drag.anchor_time
        const raw_start = Math.min(a, t)
        const raw_end = Math.max(a, t)
        const anchor = a === raw_start ? 'start' : 'end'
        // Cap the *preview* span too, so the overlay never claims more than max.
        track_drag.live_range = clamp_range_span(
            [raw_start, raw_end], duration, 0, effective_max_span, anchor,
        )
    }

    function handle_track_pointer_up() {
        window.removeEventListener('pointermove', handle_track_pointer_move)
        window.removeEventListener('pointerup', handle_track_pointer_up)
        if (!track_drag) return
        const drag = track_drag
        // Release the active state before mutating selected_range — that mutation
        // re-renders the tier with the new selection, and we don't want to leave
        // a stale overlay on screen.
        track_drag = null
        svg_element = null
        try { drag.capture_target.releasePointerCapture?.(drag.pointer_id) } catch {}

        if (!drag.dragging) {
            // No drag: seek to the click point.
            seek(drag.anchor_time)
            return
        }

        // Commit the new selection. Widen to min_span if the user only nudged.
        const [s, e] = drag.live_range
        const c = (s + e) / 2
        selected_range = e - s >= effective_min_span ? [s, e] : clamp_range_span(
            [c - effective_min_span / 2, c + effective_min_span / 2],
            duration, effective_min_span, effective_max_span, 'both',
        )
        on_selection_change_commit?.(selected_range)
    }

    /** Pixel coords of the live overlay, using the FROZEN scale from gesture start. */
    const overlay = $derived.by(() => {
        if (!track_drag?.dragging) return null
        const s = track_drag.scale_at_start
        const [a, b] = track_drag.live_range
        return { x: s(a), width: Math.max(1, s(b) - s(a)) }
    })

    /** @param {KeyboardEvent} event */
    function handle_track_keydown(event) {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
        event.preventDefault()
        const sign = event.key === 'ArrowLeft' ? -1 : 1
        seek(clamp(current_time + sign * keyboard_step * (event.shiftKey ? 5 : 1), 0, duration))
    }
</script>

<svg
    {width}
    {height}
    class="tier"
    role="group"
    aria-label={`Piste ${tier.name ?? tier.id}`}
>
    <rect
        class={['track-background', { drawing: track_drag?.dragging }]}
        x={scale(selected_range[0])}
        y={0}
        width={scale(selected_range[1]) - scale(selected_range[0])}
        {height}
        rx="3"
        role="slider"
        tabindex="0"
        aria-label={`Piste ${tier.name ?? tier.id}, cliquer pour se déplacer, glisser pour sélectionner une plage`}
        aria-valuemin={selected_range[0]}
        aria-valuemax={selected_range[1]}
        aria-valuenow={current_time}
        onpointerdown={handle_track_pointer_down}
        onkeydown={handle_track_keydown}
    />

    {#each visible_annotations as annotation (get_annotation_key(annotation))}
        {@const key = get_annotation_key(annotation)}
        {@const left = Math.max(scale(selected_range[0]), scale(annotation.start))}
        {@const right = Math.min(scale(selected_range[1]), scale(annotation.end))}
        <Annotation
            {annotation}
            x={left}
            y={annotation_padding}
            width={right - left}
            height={height - annotation_padding * 2}
            color={color_for_label(annotation.label)}
            show_label={labels_visible}
            hovered={hovered_key === key}
            on_hover={() => (hovered_key = key)}
            on_hover_end={() => (hovered_key = null)}
            on_click={(a) => on_annotation_click?.(a)}
        />
    {/each}

    {#if playhead_visible}
        <Playhead x={scale(current_time)} y1={0} y2={height} />
    {/if}

    {#if overlay}
        <rect
            class="selection-overlay"
            x={overlay.x}
            y={0}
            width={overlay.width}
            {height}
            aria-hidden="true"
        />
    {/if}

    {#if show_tier_name && tier.name}
        <g class="tier-label" aria-hidden="true">
            <rect
                x={scale(selected_range[0]) + 4}
                y={4}
                width={Math.max(24, tier.name.length * 7 + 10)}
                height={16}
                rx="2"
            />
            <text x={scale(selected_range[0]) + 9} y={16}>{tier.name}</text>
        </g>
    {/if}
</svg>

<style>
    .tier {
        display: block;
        font: 12px system-ui, sans-serif;
        user-select: none;
    }

    .track-background {
        fill: #fafafa;
        stroke: #e5e5e5;
        cursor: crosshair;
    }
    .track-background.drawing {
        cursor: ew-resize;
    }

    .selection-overlay {
        fill: #3b82f6;
        fill-opacity: 0.18;
        stroke: #3b82f6;
        stroke-width: 1;
        pointer-events: none;
    }

    .tier-label rect {
        fill: #ffffff;
        fill-opacity: 0.85;
        stroke: #e5e5e5;
    }
    .tier-label text {
        fill: #444;
        font-weight: 500;
        pointer-events: none;
    }

    :global([tabindex]:focus-visible) {
        outline: 2px solid #2563eb;
        outline-offset: 2px;
    }
</style>
