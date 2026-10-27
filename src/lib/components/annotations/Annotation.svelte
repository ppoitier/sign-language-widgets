<!--
  Annotation.svelte — one annotation bar inside a tier's detail view.

  Rendered as an <g> inside a parent <svg>. Fully keyboard-accessible:
  focusable, Enter/Space trigger the click handler, and the hovered state
  is mirrored on focus so the visual feedback is consistent.
-->

<script>
    /**
     * @typedef {import('./timeline-utils.js').Annotation} Annotation
     */

    /**
     * @typedef {Object} Props
     * @property {Annotation} annotation
     * @property {number} x
     * @property {number} y
     * @property {number} width
     * @property {number} height
     * @property {string} color
     * @property {boolean} [hovered]                 Externally controlled hover state (lets the tier group hovers).
     * @property {boolean} [showLabel]
     * @property {number}  [labelPaddingX]           Horizontal inset for the label text, px each side.
     * @property {(a: Annotation, e: MouseEvent) => void} [onClick]
     * @property {(a: Annotation) => void}                [onHover]
     * @property {() => void}                              [onHoverEnd]
     */

    /** @type {Props} */
    let {
        annotation,
        x,
        y,
        width,
        height,
        color,
        hovered = false,
        showLabel = true,
        labelPaddingX = 6,
        onClick,
        onHover,
        onHoverEnd,
    } = $props();

    // --- Label fitting -------------------------------------------------------
    // Render the full label invisibly, measure, then either show it as-is or
    // binary-search the longest prefix that fits with an ellipsis.
    /** @type {SVGTextElement | null} */
    let textEl = $state(null);
    let displayLabel = $state(annotation.label);

    const availableWidth = $derived(Math.max(0, width - labelPaddingX * 2));

    $effect(() => {
        // Re-run whenever inputs change.
        const full = annotation.label;
        const avail = availableWidth;
        if (!showLabel || !textEl) {
            displayLabel = full;
            return;
        }

        // First measure the full label.
        textEl.textContent = full;
        const fullWidth = textEl.getComputedTextLength();
        if (fullWidth <= avail) {
            displayLabel = full;
            return;
        }

        // Doesn't fit. If even the ellipsis is wider than the bar, drop the label.
        textEl.textContent = '…';
        if (textEl.getComputedTextLength() > avail) {
            displayLabel = '';
            return;
        }

        // Binary-search the longest prefix that fits with an ellipsis.
        let lo = 0, hi = full.length;
        while (lo < hi) {
            const mid = Math.ceil((lo + hi) / 2);
            textEl.textContent = full.slice(0, mid) + '…';
            if (textEl.getComputedTextLength() <= avail) lo = mid;
            else hi = mid - 1;
        }
        displayLabel = lo > 0 ? full.slice(0, lo) + '…' : '';
    });

    /** @param {MouseEvent} event */
    function handleClick(event) {
        // Don't let the click fall through to the track background and trigger a seek.
        event.stopPropagation();
        onClick?.(annotation, event);
    }

    /** @param {KeyboardEvent} event */
    function handleKeydown(event) {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        onClick?.(annotation, /** @type {any} */ (event));
    }
</script>

<g
        class="annotation"
        class:hovered
        role="button"
        tabindex="0"
        aria-label={`Annotation ${annotation.label} from ${annotation.start} to ${annotation.end}`}
        onmouseenter={() => onHover?.(annotation)}
        onmouseleave={() => onHoverEnd?.()}
        onfocus={() => onHover?.(annotation)}
        onblur={() => onHoverEnd?.()}
        onclick={handleClick}
        onkeydown={handleKeydown}
>
    <rect
            class="annotation-bar"
            {x}
            {y}
            width={Math.max(1, width)}
            {height}
            fill={color}
    />
    {#if showLabel}
        <text
                bind:this={textEl}
                class="annotation-label"
                x={x + labelPaddingX}
                y={y + height / 2 + 4}
        >{displayLabel}</text>
    {/if}
</g>

<style>
    .annotation {
        cursor: pointer;
    }

    .annotation-bar {
        opacity: 0.65;
        stroke: #111;
        stroke-width: 0;
        transition: opacity 0.15s ease, stroke-width 0.15s ease;
    }

    .annotation.hovered .annotation-bar {
        opacity: 1;
        stroke-width: 1.5;
    }

    .annotation-label {
        fill: #111;
        pointer-events: none;
        font: 12px system-ui, sans-serif;
    }
</style>
