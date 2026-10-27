<!--
  TimelineOverview.svelte — the top strip.

  Shows the full timeline, an aggregate tick per annotation (merged from every
  tier), the playhead, and the brush. Clicking the background seeks the
  playhead; the brush handles its own pointer/keyboard events.
-->

<script>
    import Playhead from './Playhead.svelte';
    import TimelineBrush from './TimelineBrush.svelte';
    import { clamp, getAnnotationKey } from './timeline-utils.js';

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
     * @property {number}        currentTime            Bindable: written on track click.
     * @property {[number, number]} selectedRange       Bindable: owned by the brush.
     * @property {LinearScale}   scale
     * @property {Annotation[]}  annotations            Flat list across every tier.
     * @property {(label: string) => string} colorForLabel
     * @property {number}        [handleWidth]
     * @property {number}        [minSpan]
     * @property {number}        [maxSpan]
     * @property {number}        [keyboardStep]
     * @property {(e: SeekEvent) => void}            [onSeek]
     * @property {(range: [number, number]) => void} [onSelectionChangeCommit]
     */

    /** @type {Props} */
    let {
        width,
        height,
        duration,
        currentTime = $bindable(),
        selectedRange = $bindable(),
        scale,
        annotations,
        colorForLabel,
        handleWidth,
        minSpan,
        maxSpan,
        keyboardStep = 1,
        onSeek,
        onSelectionChangeCommit,
    } = $props();

    /** @param {MouseEvent & { currentTarget: SVGRectElement }} event */
    function handleTrackClick(event) {
        // Measure against the parent <svg>, not the rect: the rect is inset by
        // horizontalPadding, which would otherwise bias every click by that many pixels.
        const svg = event.currentTarget.ownerSVGElement;
        if (!svg) return;
        const { left } = svg.getBoundingClientRect();
        const time = clamp(scale.invert(event.clientX - left), 0, duration);
        currentTime = time;
        onSeek?.({ time });
    }

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
        class="overview"
        role="group"
        aria-label="Timeline overview"
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
            aria-label="Overview track, click or use arrow keys to seek"
            aria-valuemin={0}
            aria-valuemax={duration}
            aria-valuenow={currentTime}
            onclick={handleTrackClick}
            onkeydown={handleTrackKeydown}
    />

    {#each annotations as annotation (getAnnotationKey(annotation))}
        <rect
                class="overview-tick"
                x={scale(annotation.start)}
                y={height * 0.25}
                width={Math.max(1, scale(annotation.end) - scale(annotation.start))}
                height={height * 0.5}
                fill={colorForLabel(annotation.label)}
        />
    {/each}

    <Playhead x={scale(currentTime)} y1={-2} y2={height + 2} />

    <TimelineBrush
            bind:selectedRange
            {duration}
            {scale}
            {height}
            {handleWidth}
            {minSpan}
            {maxSpan}
            {keyboardStep}
            onChangeCommit={onSelectionChangeCommit}
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
