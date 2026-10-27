<!--
  AnnotationTimeline.svelte — main component.

  Owns the brushed range and the shared linear scales. Renders:
    - one TimelineOverview (with a merged tick row for every tier)
    - one AnnotationTier per input tier, stacked below

  Every visual size is a prop. The component itself does no hardcoded layout.

  Usage:
    <script>
      let currentTime = $state(0);
      const tiers = [
        { id: 'speech',  name: 'Speech',  annotations: [ { id: 1, start:  2, end:  6, label: 'intro'  } ] },
        { id: 'gesture', name: 'Gesture', annotations: [ { id: 2, start: 10, end: 14, label: 'action' } ] },
      ];
    </script>

    <AnnotationTimeline
      duration={60}
      {tiers}
      bind:currentTime
      onAnnotationClick={(a) => console.log('clicked', a)}
      onSeek={({ time }) => console.log('seek', time)}
    />
-->

<script>
    import { untrack } from 'svelte';
    import TimelineOverview from './TimelineOverview.svelte';
    import AnnotationTier from './AnnotationTier.svelte';
    import {
        DEFAULT_COLOR_PALETTE,
        buildColorForLabel,
        clamp,
        clampRangeSpan,
        createLinearScale,
    } from './timeline-utils.js';

    /**
     * @typedef {import('./timeline-utils.js').Annotation} Annotation
     * @typedef {import('./timeline-utils.js').Tier}       Tier
     * @typedef {import('./timeline-utils.js').SeekEvent}  SeekEvent
     */

    /**
     * @typedef {Object} Props
     * @property {number}       duration                  Total timeline length.
     * @property {Tier[]}       [tiers]                   Annotation tiers to render as stacked detail rows.
     * @property {number}       [currentTime]             Bindable playhead position.
     * @property {boolean}      [followPlayback]          Keep the brush centered on the playhead.
     * @property {number}       [width]                   Outer width, px.
     * @property {number}       [overviewHeight]          Height of the top overview strip, px.
     * @property {number}       [tierHeight]              Height of each tier's detail row, px.
     * @property {number}       [overviewDetailGap]       Vertical gap between overview and first tier, px.
     * @property {number}       [tierGap]                 Vertical gap between tiers, px.
     * @property {number}       [horizontalPadding]       Left/right inner padding used by every row, px.
     * @property {number}       [brushHandleWidth]        Width of each brush handle, px.
     * @property {number}       [keyboardStep]            Arrow-key seek/brush step, in time units.
     * @property {number}       [maxSelectionSpan]        Max length of the selected range, in time units. Default 60.
     * @property {number}       [labelMinPixelsPerUnit]   Below this zoom (px per time-unit), all annotation labels are hidden. Default 3.
     * @property {string[]}     [colorPalette]            Palette used for per-label colors.
     * @property {boolean}      [showTierNames]           Render each tier's name chip inside its row.
     * @property {(a: Annotation) => void}          [onAnnotationClick]
     * @property {(e: SeekEvent) => void}           [onSeek]
     * @property {(range: [number, number]) => void} [onSelectionChange]
     */

    /** @type {Props} */
    let {
        duration,
        tiers = [],
        currentTime = $bindable(0),
        followPlayback = true,

        // Sizing — every visual constant is an overridable prop.
        width = 800,
        overviewHeight = 50,
        tierHeight = 80,
        overviewDetailGap = 16,
        tierGap = 4,
        horizontalPadding = 8,
        brushHandleWidth = 8,
        keyboardStep = 1,
        maxSelectionSpan = 60,
        labelMinPixelsPerUnit = 3,

        // Styling.
        colorPalette = DEFAULT_COLOR_PALETTE,
        showTierNames = true,

        // Events.
        onAnnotationClick,
        onSeek,
        onSelectionChange,
    } = $props();

    // --------- State ---------
    /** @type {[number, number]} */
    let selectedRange = $state(
        clampRangeSpan([0, duration], duration, 0, maxSelectionSpan, 'start')
    );

    // --------- Derived ---------
    const mergedAnnotations = $derived(tiers.flatMap((tier) => tier.annotations));

    const colorForLabel = $derived(
        buildColorForLabel(mergedAnnotations.map((a) => a.label), colorPalette)
    );

    // Overview maps full duration onto the padded pixel range.
    const overviewScale = $derived(
        createLinearScale([0, duration], [horizontalPadding, width - horizontalPadding])
    );

    // Detail maps *only the selected range* onto the same padded pixel range.
    const detailScale = $derived(
        createLinearScale(selectedRange, [horizontalPadding, width - horizontalPadding])
    );

    const minSelectionSpan = $derived(Math.min(duration * 0.01, maxSelectionSpan));

    // --------- Effects ---------
    // Keep the brushed range centered on the playhead while followPlayback is true.
    // untrack() stops the effect from re-running because of its own writes.
    $effect(() => {
        if (!followPlayback || currentTime == null) return;
        const time = currentTime;
        const dur = duration;
        const cap = maxSelectionSpan;
        const minS = minSelectionSpan;
        untrack(() => {
            const rawSpan = selectedRange[1] - selectedRange[0];
            const span = clamp(rawSpan, minS, Math.min(cap, dur));
            const newStart = clamp(time - span / 2, 0, dur - span);
            if (newStart !== selectedRange[0] || span !== rawSpan) {
                selectedRange = [newStart, newStart + span];
            }
        });
    });
</script>

<div class="timeline" style:width="{width}px">
    <TimelineOverview
            {width}
            height={overviewHeight}
            {duration}
            bind:currentTime
            bind:selectedRange
            scale={overviewScale}
            annotations={mergedAnnotations}
            {colorForLabel}
            handleWidth={brushHandleWidth}
            minSpan={minSelectionSpan}
            maxSpan={maxSelectionSpan}
            {keyboardStep}
            {onSeek}
            onSelectionChangeCommit={onSelectionChange}
    />

    <div class="tiers" style:gap="{tierGap}px" style:margin-top="{overviewDetailGap}px">
        {#each tiers as tier (tier.id)}
            <AnnotationTier
                    {width}
                    height={tierHeight}
                    {duration}
                    {tier}
                    bind:selectedRange
                    bind:currentTime
                    scale={detailScale}
                    {colorForLabel}
                    {keyboardStep}
                    minSpan={minSelectionSpan}
                    maxSpan={maxSelectionSpan}
                    {labelMinPixelsPerUnit}
                    showTierName={showTierNames}
                    {onAnnotationClick}
                    {onSeek}
                    onSelectionChangeCommit={onSelectionChange}
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
