<!--
  TimelineBrush.svelte — a draggable, resizable, keyboard-accessible selection region.

  Lives inside the overview <svg>. Exposes `selectedRange` as a bindable prop so the
  parent can react to or mutate the selection directly.

  Interaction model:
    - Drag the body  → shift the whole range.
    - Drag either handle → move that edge.
    - Focus any of the three and press ArrowLeft/Right (Shift = ×5) to nudge.
    - `onChangeCommit` fires once per completed gesture (pointer-up or key-press),
      never mid-drag — useful for debouncing expensive consumers.
-->

<script>
    import { clamp } from './timeline-utils.js';

    /**
     * @typedef {import('./timeline-utils.js').LinearScale} LinearScale
     */

    /**
     * @typedef {'move-start' | 'move-end' | 'move-both'} DragMode
     */

    /**
     * @typedef {Object} Props
     * @property {[number, number]}  selectedRange    Bindable. Current [start, end] selection.
     * @property {number}            duration         Full timeline length.
     * @property {LinearScale}       scale            Maps time → pixel in the overview.
     * @property {number}            height           Brush height in px.
     * @property {number}            [handleWidth]    Width of each resize handle, px.
     * @property {number}            [minSpan]        Minimum selection width, in time units. Defaults to 1% of duration.
     * @property {number}            [maxSpan]        Maximum selection width, in time units. Defaults to duration (no cap).
     * @property {number}            [keyboardStep]   Base step (time units) for arrow-key nudging.
     * @property {(range: [number, number]) => void} [onChangeCommit]  Fires once per gesture.
     */

    /** @type {Props} */
    let {
        selectedRange = $bindable(),
        duration,
        scale,
        height,
        handleWidth = 8,
        minSpan,
        maxSpan,
        keyboardStep = 1,
        onChangeCommit,
    } = $props();

    // Pixel positions of the two edges.
    const leftX = $derived(scale(selectedRange[0]));
    const rightX = $derived(scale(selectedRange[1]));

    // Pixels per time-unit, derived from the linear scale.
    const pixelsPerUnit = $derived(scale(1) - scale(0));

    const effectiveMinSpan = $derived(minSpan ?? duration * 0.01);
    const effectiveMaxSpan = $derived(Math.min(maxSpan ?? duration, duration));

    /** @type {DragMode | null} */
    let dragMode = $state(null);

    // Not reactive: only read inside the drag handlers.
    let dragStartClientX = 0;
    /** @type {[number, number] | null} */
    let dragStartRange = null;

    /**
     * @param {DragMode} mode
     * @param {PointerEvent} event
     */
    function startDrag(mode, event) {
        event.preventDefault();
        dragMode = mode;
        dragStartClientX = event.clientX;
        dragStartRange = [...selectedRange];
        window.addEventListener('pointermove', handleDrag);
        window.addEventListener('pointerup', endDrag);
    }

    /** @param {PointerEvent} event */
    function handleDrag(event) {
        if (!dragStartRange) return;
        const deltaTime = (event.clientX - dragStartClientX) / pixelsPerUnit;
        let [start, end] = dragStartRange;

        if (dragMode === 'move-start') {
            // Can't go past end - min, can't go further than end - max from the other side.
            start = clamp(start + deltaTime, end - effectiveMaxSpan, end - effectiveMinSpan);
            start = clamp(start, 0, end - effectiveMinSpan);
        } else if (dragMode === 'move-end') {
            end = clamp(end + deltaTime, start + effectiveMinSpan, start + effectiveMaxSpan);
            end = clamp(end, start + effectiveMinSpan, duration);
        } else {
            // move-both: shift without changing span.
            const span = end - start;
            start = clamp(start + deltaTime, 0, duration - span);
            end = start + span;
        }
        selectedRange = [start, end];
    }

    function endDrag() {
        dragMode = null;
        dragStartRange = null;
        window.removeEventListener('pointermove', handleDrag);
        window.removeEventListener('pointerup', endDrag);
        onChangeCommit?.(selectedRange);
    }

    /**
     * @param {DragMode} mode
     * @param {KeyboardEvent} event
     */
    function handleKeydown(mode, event) {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
        event.preventDefault();
        const sign = event.key === 'ArrowLeft' ? -1 : 1;
        const step = sign * keyboardStep * (event.shiftKey ? 5 : 1);

        let [start, end] = selectedRange;
        if (mode === 'move-start') {
            start = clamp(start + step, end - effectiveMaxSpan, end - effectiveMinSpan);
            start = clamp(start, 0, end - effectiveMinSpan);
        } else if (mode === 'move-end') {
            end = clamp(end + step, start + effectiveMinSpan, start + effectiveMaxSpan);
            end = clamp(end, start + effectiveMinSpan, duration);
        } else {
            const span = end - start;
            start = clamp(start + step, 0, duration - span);
            end = start + span;
        }
        selectedRange = [start, end];
        onChangeCommit?.(selectedRange);
    }
</script>

<!-- Body: drag to pan the selection. -->
<rect
        class="brush-body"
        class:dragging={dragMode === 'move-both'}
        x={leftX}
        y={0}
        width={Math.max(0, rightX - leftX)}
        {height}
        role="slider"
        tabindex="0"
        aria-label="Selected range, drag or use arrow keys to move"
        aria-valuemin={0}
        aria-valuemax={duration}
        aria-valuenow={selectedRange[0]}
        onpointerdown={(e) => startDrag('move-both', e)}
        onkeydown={(e) => handleKeydown('move-both', e)}
/>

<!-- Left handle. -->
<rect
        class="brush-handle"
        class:dragging={dragMode === 'move-start'}
        x={leftX - handleWidth / 2}
        y={0}
        width={handleWidth}
        {height}
        role="slider"
        tabindex="0"
        aria-label="Selection start"
        aria-valuemin={0}
        aria-valuemax={selectedRange[1]}
        aria-valuenow={selectedRange[0]}
        onpointerdown={(e) => startDrag('move-start', e)}
        onkeydown={(e) => handleKeydown('move-start', e)}
/>

<!-- Right handle. -->
<rect
        class="brush-handle"
        class:dragging={dragMode === 'move-end'}
        x={rightX - handleWidth / 2}
        y={0}
        width={handleWidth}
        {height}
        role="slider"
        tabindex="0"
        aria-label="Selection end"
        aria-valuemin={selectedRange[0]}
        aria-valuemax={duration}
        aria-valuenow={selectedRange[1]}
        onpointerdown={(e) => startDrag('move-end', e)}
        onkeydown={(e) => handleKeydown('move-end', e)}
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
