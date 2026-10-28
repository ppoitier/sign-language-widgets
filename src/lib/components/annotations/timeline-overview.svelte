<!--
  The top strip.

  Shows the full timeline, an aggregate tick per annotation (merged from every
  tier), the playhead, and the brush. Clicking the background seeks the
  playhead; the brush handles its own pointer/keyboard events.
-->

<script>
    import Playhead from './playhead.svelte'
    import TimelineBrush from './timeline-brush.svelte'
    import { clamp, get_annotation_key } from './timeline-utils.js'

    /**
     * @typedef {import('./timeline-utils.js').Annotation} Annotation
     * @typedef {import('./timeline-utils.js').LinearScale} LinearScale
     * @typedef {import('./timeline-utils.js').SeekEvent}   SeekEvent
     */

    /**
     * @typedef {Object} Props
     * @property {number}        width
     * @property {number}        height
     * @property {number}        duration
     * @property {number}        current_time           Bindable: written on track click.
     * @property {[number, number]} selected_range      Bindable: owned by the brush.
     * @property {LinearScale}   scale
     * @property {Annotation[]}  annotations            Flat list across every tier.
     * @property {(label: string) => string} color_for_label
     * @property {number}        [handle_width]
     * @property {number}        [min_span]
     * @property {number}        [max_span]
     * @property {number}        [keyboard_step=1]
     * @property {(e: SeekEvent) => void}            [on_seek]
     * @property {(range: [number, number]) => void} [on_selection_change_commit]
     */

    /** @type {Props} */
    let {
        width,
        height,
        duration,
        current_time = $bindable(),
        selected_range = $bindable(),
        scale,
        annotations,
        color_for_label,
        handle_width,
        min_span,
        max_span,
        keyboard_step = 1,
        on_seek,
        on_selection_change_commit,
    } = $props()

    /** @param {number} time */
    function seek(time) {
        current_time = time
        on_seek?.({ time })
    }

    /** @param {MouseEvent & { currentTarget: SVGRectElement }} event */
    function handle_track_click(event) {
        // Measure against the parent <svg>, not the rect: the rect is inset by
        // the horizontal padding, which would otherwise bias every click by that many pixels.
        const svg = event.currentTarget.ownerSVGElement
        if (!svg) return
        const { left } = svg.getBoundingClientRect()
        seek(clamp(scale.invert(event.clientX - left), 0, duration))
    }

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
    class="overview"
    role="group"
    aria-label="Vue d'ensemble de la timeline"
>
    <rect
        class="track-background"
        x={scale(0)}
        y={0}
        width={scale(duration) - scale(0)}
        {height}
        rx="3"
        role="slider"
        tabindex="0"
        aria-label="Piste d'ensemble, cliquer ou utiliser les flèches pour se déplacer"
        aria-valuemin={0}
        aria-valuemax={duration}
        aria-valuenow={current_time}
        onclick={handle_track_click}
        onkeydown={handle_track_keydown}
    />

    {#each annotations as annotation (get_annotation_key(annotation))}
        <rect
            class="overview-tick"
            x={scale(annotation.start)}
            y={height * 0.25}
            width={Math.max(1, scale(annotation.end) - scale(annotation.start))}
            height={height * 0.5}
            fill={color_for_label(annotation.label)}
        />
    {/each}

    <Playhead x={scale(current_time)} y1={-2} y2={height + 2} />

    <TimelineBrush
        bind:selected_range
        {duration}
        {scale}
        {height}
        {handle_width}
        {min_span}
        {max_span}
        {keyboard_step}
        on_change_commit={on_selection_change_commit}
    />
</svg>

<style>
    .overview {
        display: block;
        font: 12px system-ui, sans-serif;
        user-select: none;
    }

    .track-background {
        fill: #f2f2f2;
        cursor: pointer;
    }

    .overview-tick {
        pointer-events: none;
        opacity: 0.7;
    }

    :global([tabindex]:focus-visible) {
        outline: 2px solid #2563eb;
        outline-offset: 2px;
    }
</style>
