<!--
  A draggable, resizable, keyboard-accessible selection region.

  Lives inside the overview <svg>. Exposes `selected_range` as a bindable prop so the
  parent can react to or mutate the selection directly.

  Interaction model:
    - Drag the body  → shift the whole range.
    - Drag either handle → move that edge.
    - Focus any of the three and press ArrowLeft/Right (Shift = ×5) to nudge.
    - `on_change_commit` fires once per completed gesture (pointer-up or key-press),
      never mid-drag — useful for debouncing expensive consumers.
-->

<script>
    import { clamp } from './timeline-utils.js'

    /**
     * @typedef {import('./timeline-utils.js').LinearScale} LinearScale
     */

    /**
     * @typedef {'move-start' | 'move-end' | 'move-both'} DragMode
     */

    /**
     * @typedef {Object} Props
     * @property {[number, number]}  selected_range     Bindable. Current [start, end] selection.
     * @property {number}            duration           Full timeline length.
     * @property {LinearScale}       scale              Maps time → pixel in the overview.
     * @property {number}            height             Brush height in px.
     * @property {number}            [handle_width=8]   Width of each resize handle, px.
     * @property {number}            [min_span]         Minimum selection width, in time units. Defaults to 1% of duration.
     * @property {number}            [max_span]         Maximum selection width, in time units. Defaults to duration (no cap).
     * @property {number}            [keyboard_step=1]  Base step (time units) for arrow-key nudging.
     * @property {(range: [number, number]) => void} [on_change_commit]  Fires once per gesture.
     */

    /** @type {Props} */
    let {
        selected_range = $bindable(),
        duration,
        scale,
        height,
        handle_width = 8,
        min_span,
        max_span,
        keyboard_step = 1,
        on_change_commit,
    } = $props()

    // Pixel positions of the two edges.
    const left_x = $derived(scale(selected_range[0]))
    const right_x = $derived(scale(selected_range[1]))

    // Pixels per time-unit, derived from the linear scale.
    const pixels_per_unit = $derived(scale(1) - scale(0))

    const effective_min_span = $derived(min_span ?? duration * 0.01)
    const effective_max_span = $derived(Math.min(max_span ?? duration, duration))

    /** @type {DragMode | null} */
    let drag_mode = $state(null)

    // Not reactive: only read inside the drag handlers.
    let drag_start_client_x = 0
    /** @type {[number, number] | null} */
    let drag_start_range = null

    /**
     * Move the edge(s) of `range` given by `mode` by `delta` time units, within the span limits.
     * @param {[number, number]} range
     * @param {DragMode} mode
     * @param {number} delta
     * @returns {[number, number]}
     */
    function moved_range([start, end], mode, delta) {
        if (mode === 'move-start') {
            // Can't go past end - min, can't go further than end - max from the other side.
            start = clamp(start + delta, end - effective_max_span, end - effective_min_span)
            start = clamp(start, 0, end - effective_min_span)
        } else if (mode === 'move-end') {
            end = clamp(end + delta, start + effective_min_span, start + effective_max_span)
            end = clamp(end, start + effective_min_span, duration)
        } else {
            // move-both: shift without changing span.
            const span = end - start
            start = clamp(start + delta, 0, duration - span)
            end = start + span
        }
        return [start, end]
    }

    /**
     * @param {DragMode} mode
     * @param {PointerEvent} event
     */
    function start_drag(mode, event) {
        event.preventDefault()
        drag_mode = mode
        drag_start_client_x = event.clientX
        drag_start_range = [...selected_range]
        window.addEventListener('pointermove', handle_drag)
        window.addEventListener('pointerup', end_drag)
    }

    /** @param {PointerEvent} event */
    function handle_drag(event) {
        if (!drag_start_range || !drag_mode) return
        const delta_time = (event.clientX - drag_start_client_x) / pixels_per_unit
        selected_range = moved_range(drag_start_range, drag_mode, delta_time)
    }

    function end_drag() {
        drag_mode = null
        drag_start_range = null
        window.removeEventListener('pointermove', handle_drag)
        window.removeEventListener('pointerup', end_drag)
        on_change_commit?.(selected_range)
    }

    /**
     * @param {DragMode} mode
     * @param {KeyboardEvent} event
     */
    function handle_keydown(mode, event) {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
        event.preventDefault()
        const sign = event.key === 'ArrowLeft' ? -1 : 1
        selected_range = moved_range(selected_range, mode, sign * keyboard_step * (event.shiftKey ? 5 : 1))
        on_change_commit?.(selected_range)
    }
</script>

<!-- Body: drag to pan the selection. -->
<rect
    class={['brush-body', { dragging: drag_mode === 'move-both' }]}
    x={left_x}
    y={0}
    width={Math.max(0, right_x - left_x)}
    {height}
    role="slider"
    tabindex="0"
    aria-label="Plage sélectionnée, glisser ou utiliser les flèches pour la déplacer"
    aria-valuemin={0}
    aria-valuemax={duration}
    aria-valuenow={selected_range[0]}
    onpointerdown={(e) => start_drag('move-both', e)}
    onkeydown={(e) => handle_keydown('move-both', e)}
/>

<!-- Left handle. -->
<rect
    class={['brush-handle', { dragging: drag_mode === 'move-start' }]}
    x={left_x - handle_width / 2}
    y={0}
    width={handle_width}
    {height}
    role="slider"
    tabindex="0"
    aria-label="Début de la sélection"
    aria-valuemin={0}
    aria-valuemax={selected_range[1]}
    aria-valuenow={selected_range[0]}
    onpointerdown={(e) => start_drag('move-start', e)}
    onkeydown={(e) => handle_keydown('move-start', e)}
/>

<!-- Right handle. -->
<rect
    class={['brush-handle', { dragging: drag_mode === 'move-end' }]}
    x={right_x - handle_width / 2}
    y={0}
    width={handle_width}
    {height}
    role="slider"
    tabindex="0"
    aria-label="Fin de la sélection"
    aria-valuemin={selected_range[0]}
    aria-valuemax={duration}
    aria-valuenow={selected_range[1]}
    onpointerdown={(e) => start_drag('move-end', e)}
    onkeydown={(e) => handle_keydown('move-end', e)}
/>

<style>
    .brush-body {
        fill: #3b82f6;
        fill-opacity: 0.15;
        stroke: #3b82f6;
        stroke-width: 1;
        cursor: grab;
        transition: fill-opacity 0.12s ease;
    }
    .brush-body:hover { fill-opacity: 0.22; }
    .brush-body.dragging { cursor: grabbing; fill-opacity: 0.28; }

    .brush-handle {
        fill: #3b82f6;
        fill-opacity: 0.8;
        cursor: ew-resize;
        transition: fill-opacity 0.12s ease;
    }
    .brush-handle:hover,
    .brush-handle.dragging { fill-opacity: 1; }

    :global([tabindex]:focus-visible) {
        outline: 2px solid #2563eb;
        outline-offset: 2px;
    }
</style>
