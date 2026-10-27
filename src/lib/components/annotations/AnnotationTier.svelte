<!--
  AnnotationTier.svelte — one detail row for a single tier.

  Renders its own <svg> so tiers compose cleanly in an HTML flex stack. Shows:
    - a clickable track background (seek on click or arrow keys)
    - every annotation that intersects the selected time range
    - the playhead, when the current time is visible
    - the tier name in a small chip (top-left)
-->

<script>
    import Annotation from './Annotation.svelte';
    import Playhead from './Playhead.svelte';
    import { clamp, clampRangeSpan, getAnnotationKey } from './timeline-utils.js';

    /**
     * @typedef {import('./timeline-utils.js').Annotation} AnnotationT
     * @typedef {import('./timeline-utils.js').Tier}       Tier
     * @typedef {import('./timeline-utils.js').LinearScale} LinearScale
     * @typedef {import('./timeline-utils.js').SeekEvent}   SeekEvent
     */

    /**
     * @typedef {Object} Props
     * @property {number}           width
     * @property {number}           height
     * @property {number}           duration
     * @property {Tier}             tier
     * @property {[number, number]} selectedRange        Bindable: a drag on the track redraws it.
     * @property {number}           currentTime          Bindable: written on track click.
     * @property {LinearScale}      scale
     * @property {(label: string) => string} colorForLabel
     * @property {number}           [keyboardStep]
     * @property {number}           [annotationPadding]  Inner vertical padding around bars, px.
     * @property {number}           [minSpan]            Min selection width when redrawing by drag, in time units.
     * @property {number}           [maxSpan]            Max selection width when redrawing by drag, in time units.
     * @property {number}           [labelMinPixelsPerUnit]  Hide all labels below this zoom. Default 3.
     * @property {number}           [dragThresholdPx]    Pointer travel that promotes a click to a drag. Default 4.
     * @property {boolean}          [showTierName]
     * @property {(a: AnnotationT) => void}  [onAnnotationClick]
     * @property {(e: SeekEvent) => void}    [onSeek]
     * @property {(range: [number, number]) => void} [onSelectionChangeCommit]
     */

    /** @type {Props} */
    let {
        width,
        height,
        duration,
        tier,
        selectedRange = $bindable(),
        currentTime = $bindable(),
        scale,
        colorForLabel,
        keyboardStep = 1,
        annotationPadding = 16,
        minSpan,
        maxSpan,
        labelMinPixelsPerUnit = 3,
        dragThresholdPx = 4,
        showTierName = true,
        onAnnotationClick,
        onSeek,
        onSelectionChangeCommit,
    } = $props();

    const effectiveMinSpan = $derived(minSpan ?? duration * 0.01);
    const effectiveMaxSpan = $derived(Math.min(maxSpan ?? duration, duration));

    // Pixels per time-unit, derived from the detail scale.
    const pixelsPerUnit = $derived(scale(1) - scale(0));
    const labelsVisible = $derived(pixelsPerUnit >= labelMinPixelsPerUnit);

    const visibleAnnotations = $derived(
        tier.annotations.filter((a) => a.end >= selectedRange[0] && a.start <= selectedRange[1])
    );

    const playheadVisible = $derived(
        currentTime >= selectedRange[0] && currentTime <= selectedRange[1]
    );

    // Track the hovered annotation locally so hover styling stays inside the tier.
    /** @type {string | number | null} */
    let hoveredKey = $state(null);

    // ---- Drag-to-select on the tier background ----------------------------------
    // pointerdown anchors a start time and records the *current scale* (frozen
    // at gesture start). pointermove draws a transient overlay; selectedRange is
    // NOT touched mid-gesture, so the scale doesn't shift under the pointer.
    // pointerup commits the new selection (or seeks if the pointer never moved).
    /** @type {SVGSVGElement | null} */
    let svgEl = null;

    /**
     * Drag state. `scaleAtStart` is captured so the gesture keeps using the same
     * time→pixel mapping even though `selectedRange` is what drives the live scale.
     * @type {{
     *   anchorTime: number,
     *   anchorClientX: number,
     *   scaleAtStart: import('./timeline-utils.js').LinearScale,
     *   pointerId: number,
     *   captureTarget: Element,
     *   dragging: boolean,
     *   liveRange: [number, number],
     * } | null}
     */
    let trackDrag = $state(null);

    /** @param {PointerEvent & { currentTarget: SVGRectElement }} event */
    function handleTrackPointerDown(event) {
        if (event.button !== 0) return;
        const svg = event.currentTarget.ownerSVGElement;
        if (!svg) return;
        svgEl = svg;
        const { left } = svg.getBoundingClientRect();
        const anchorTime = clamp(scale.invert(event.clientX - left), 0, duration);
        event.currentTarget.setPointerCapture?.(event.pointerId);
        trackDrag = {
            anchorTime,
            anchorClientX: event.clientX,
            // Freeze the scale at the moment of pointerdown. Without this, every
            // mid-drag write to selectedRange would re-zoom the tier and the
            // pointer's "time" would jump around.
            scaleAtStart: scale,
            pointerId: event.pointerId,
            captureTarget: event.currentTarget,
            dragging: false,
            liveRange: [anchorTime, anchorTime],
        };
        window.addEventListener('pointermove', handleTrackPointerMove);
        window.addEventListener('pointerup', handleTrackPointerUp);
    }

    /** @param {PointerEvent} event */
    function handleTrackPointerMove(event) {
        if (!trackDrag || !svgEl) return;
        if (!trackDrag.dragging
            && Math.abs(event.clientX - trackDrag.anchorClientX) < dragThresholdPx) {
            return;
        }
        trackDrag.dragging = true;

        const { left } = svgEl.getBoundingClientRect();
        // Use the FROZEN scale, not the (possibly-stale-but-also-not-yet-changed)
        // live one. They're equal right now, but this guarantees correctness if a
        // future change makes us write selectedRange mid-drag for any reason.
        const t = clamp(trackDrag.scaleAtStart.invert(event.clientX - left), 0, duration);
        const a = trackDrag.anchorTime;
        const rawStart = Math.min(a, t);
        const rawEnd   = Math.max(a, t);
        const anchor = a === rawStart ? 'start' : 'end';
        // Cap the *preview* span too, so the overlay never claims more than max.
        trackDrag.liveRange = clampRangeSpan(
            [rawStart, rawEnd], duration, 0, effectiveMaxSpan, anchor,
        );
    }

    function handleTrackPointerUp() {
        window.removeEventListener('pointermove', handleTrackPointerMove);
        window.removeEventListener('pointerup', handleTrackPointerUp);
        if (!trackDrag) return;
        const drag = trackDrag;
        // Release the active state before mutating selectedRange — that mutation
        // re-renders the tier with the new selection, and we don't want to leave
        // a stale overlay on screen.
        trackDrag = null;
        svgEl = null;
        try { drag.captureTarget.releasePointerCapture?.(drag.pointerId); } catch {}

        if (drag.dragging) {
            // Commit the new selection. Widen to minSpan if the user only nudged.
            let [s, e] = drag.liveRange;
            if (e - s < effectiveMinSpan) {
                const c = (s + e) / 2;
                [s, e] = clampRangeSpan(
                    [c - effectiveMinSpan / 2, c + effectiveMinSpan / 2],
                    duration, effectiveMinSpan, effectiveMaxSpan, 'both',
                );
            }
            selectedRange = [s, e];
            onSelectionChangeCommit?.(selectedRange);
        } else {
            // No drag: seek to the click point.
            currentTime = drag.anchorTime;
            onSeek?.({ time: drag.anchorTime });
        }
    }

    /** Pixel coords of the live overlay, using the FROZEN scale from gesture start. */
    const overlay = $derived.by(() => {
        if (!trackDrag?.dragging) return null;
        const s = trackDrag.scaleAtStart;
        const [a, b] = trackDrag.liveRange;
        return { x: s(a), width: Math.max(1, s(b) - s(a)) };
    });

    /** @param {KeyboardEvent} event */
    function handleTrackKeydown(event) {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
        event.preventDefault();
        const sign = event.key === 'ArrowLeft' ? -1 : 1;
        const time = clamp(currentTime + sign * keyboardStep * (event.shiftKey ? 5 : 1), 0, duration);
        currentTime = time;
        onSeek?.({ time });
    }
</script>

<svg
        {width}
        {height}
        class="tier"
        role="group"
        aria-label={`Tier ${tier.name ?? tier.id}`}
>
    <rect
            class="track-background"
            class:drawing={trackDrag?.dragging}
            x={scale(selectedRange[0])}
            y={0}
            width={scale(selectedRange[1]) - scale(selectedRange[0])}
            {height}
            rx="3"
            role="slider"
            tabindex="0"
            aria-label={`Detail track for tier ${tier.name ?? tier.id}, click to seek, drag to select a region`}
            aria-valuemin={selectedRange[0]}
            aria-valuemax={selectedRange[1]}
            aria-valuenow={currentTime}
            onpointerdown={handleTrackPointerDown}
            onkeydown={handleTrackKeydown}
    />

    {#each visibleAnnotations as annotation (getAnnotationKey(annotation))}
        {@const key  = getAnnotationKey(annotation)}
        {@const left = Math.max(scale(selectedRange[0]), scale(annotation.start))}
        {@const right = Math.min(scale(selectedRange[1]), scale(annotation.end))}
        <Annotation
                {annotation}
                x={left}
                y={annotationPadding}
                width={right - left}
                height={height - annotationPadding * 2}
                color={colorForLabel(annotation.label)}
                showLabel={labelsVisible}
                hovered={hoveredKey === key}
                onHover={() => (hoveredKey = key)}
                onHoverEnd={() => (hoveredKey = null)}
                onClick={(a) => onAnnotationClick?.(a)}
        />
    {/each}

    {#if playheadVisible}
        <Playhead x={scale(currentTime)} y1={0} y2={height} />
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

    {#if showTierName && tier.name}
        <g class="tier-label" aria-hidden="true">
            <rect
                    x={scale(selectedRange[0]) + 4}
                    y={4}
                    width={Math.max(24, tier.name.length * 7 + 10)}
                    height={16}
                    rx="2"
            />
            <text x={scale(selectedRange[0]) + 9} y={16}>{tier.name}</text>
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