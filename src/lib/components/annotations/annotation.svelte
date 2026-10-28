<!--
  One annotation bar inside a tier's detail view.

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
     * @property {boolean} [hovered=false]           Externally controlled hover state (lets the tier group hovers).
     * @property {boolean} [show_label=true]
     * @property {number}  [label_padding_x=6]       Horizontal inset for the label text, px each side.
     * @property {(a: Annotation, e: MouseEvent | KeyboardEvent) => void} [on_click]
     * @property {(a: Annotation) => void}                                [on_hover]
     * @property {() => void}                                              [on_hover_end]
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
        show_label = true,
        label_padding_x = 6,
        on_click,
        on_hover,
        on_hover_end,
    } = $props()

    // --- Label fitting -------------------------------------------------------
    // Measure the label in a hidden <text> (not managed by Svelte), then either show
    // it as-is or binary-search the longest prefix that fits with an ellipsis.
    /** @type {SVGTextElement | undefined} */
    let measure_element = $state()
    // Reset to the full label when it changes, then shortened by the effect below.
    let display_label = $derived(annotation.label)

    const available_width = $derived(Math.max(0, width - label_padding_x * 2))

    $effect(() => {
        const full = annotation.label
        const available = available_width
        if (!show_label || !measure_element) return
        const element = measure_element

        /** @param {string} text */
        function fits(text) {
            element.textContent = text
            return element.getComputedTextLength() <= available
        }

        if (fits(full)) {
            display_label = full
            return
        }

        // Doesn't fit. If even the ellipsis is wider than the bar, drop the label.
        if (!fits('…')) {
            display_label = ''
            return
        }

        // Binary-search the longest prefix that fits with an ellipsis.
        let lo = 0, hi = full.length
        while (lo < hi) {
            const mid = Math.ceil((lo + hi) / 2)
            if (fits(full.slice(0, mid) + '…')) lo = mid
            else hi = mid - 1
        }
        display_label = lo > 0 ? full.slice(0, lo) + '…' : ''
    })

    // Times read by screen readers, e.g. "12,3 s".
    const seconds_format = new Intl.NumberFormat('fr', { maximumFractionDigits: 1 })

    /** @param {MouseEvent} event */
    function handle_click(event) {
        // Don't let the click fall through to the track background and trigger a seek.
        event.stopPropagation()
        on_click?.(annotation, event)
    }

    /** @param {KeyboardEvent} event */
    function handle_keydown(event) {
        if (event.key !== 'Enter' && event.key !== ' ') return
        event.preventDefault()
        on_click?.(annotation, event)
    }
</script>

<g
    class={['annotation', { hovered }]}
    role="button"
    tabindex="0"
    aria-label={`Annotation ${annotation.label} de ${seconds_format.format(annotation.start)} s à ${seconds_format.format(annotation.end)} s`}
    onmouseenter={() => on_hover?.(annotation)}
    onmouseleave={() => on_hover_end?.()}
    onfocus={() => on_hover?.(annotation)}
    onblur={() => on_hover_end?.()}
    onclick={handle_click}
    onkeydown={handle_keydown}
>
    <rect
        class="annotation-bar"
        {x}
        {y}
        width={Math.max(1, width)}
        {height}
        fill={color}
    />
    {#if show_label}
        <text class="annotation-label" bind:this={measure_element} visibility="hidden" aria-hidden="true"></text>
        <text
            class="annotation-label"
            x={x + label_padding_x}
            y={y + height / 2 + 4}
        >{display_label}</text>
    {/if}
</g>

<style>
    .annotation {
        cursor: pointer;
    }

    .annotation:focus-visible {
        outline: 2px solid #2563eb;
        outline-offset: 2px;
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
