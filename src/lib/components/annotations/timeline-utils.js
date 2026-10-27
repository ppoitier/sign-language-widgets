/**
 * Shared types and helpers for the annotation timeline.
 */

/**
 * @typedef {Object} Annotation
 * @property {string | number} [id]   Stable key. Falls back to start/end/label if omitted.
 * @property {number} start           Start time, in the same units as `duration`.
 * @property {number} end             End time, in the same units as `duration`.
 * @property {string} label           Display label. Also groups annotations for color.
 */

/**
 * @typedef {Object} Tier
 * @property {string | number} id          Stable key for {#each}.
 * @property {string} [name]               Displayed in the tier's top-left corner.
 * @property {Annotation[]} annotations    Annotations belonging to this tier.
 */

/**
 * @typedef {Object} SeekEvent
 * @property {number} time   New playhead time.
 */

/**
 * A linear scale that also knows how to invert: turning a pixel back into a time value.
 * Shape-compatible with `d3.scaleLinear()` for the two methods we need.
 * @typedef {((value: number) => number) & { invert: (pixel: number) => number }} LinearScale
 */

// Tableau-10 palette (no dependency).
export const DEFAULT_COLOR_PALETTE = [
    '#4e79a7', '#f28e2c', '#e15759', '#76b7b2', '#59a14f',
    '#edc949', '#af7aa1', '#ff9da7', '#9c755f', '#bab0ab',
];

/**
 * @param {number} value
 * @param {number} min
 * @param {number} max
 */
export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

/**
 * Clamp a [start, end] range to fit within [0, duration] and have a span
 * within [minSpan, maxSpan]. The `anchor` determines which edge stays fixed
 * if the span has to shrink to fit the cap:
 *   - 'start': keep start, pull end in.
 *   - 'end':   keep end, push start out.
 *   - 'both':  keep the center, shrink symmetrically (used for "move" gestures).
 *
 * @param {[number, number]} range
 * @param {number} duration
 * @param {number} minSpan
 * @param {number} maxSpan
 * @param {'start' | 'end' | 'both'} [anchor]
 * @returns {[number, number]}
 */
export function clampRangeSpan(range, duration, minSpan, maxSpan, anchor = 'both') {
    let [start, end] = range;
    // Order, then clamp absolute bounds.
    if (end < start) [start, end] = [end, start];
    start = clamp(start, 0, duration);
    end = clamp(end, 0, duration);

    let span = end - start;
    const cappedSpan = clamp(span, minSpan, maxSpan);

    if (cappedSpan !== span) {
        if (anchor === 'start') {
            end = clamp(start + cappedSpan, 0, duration);
            start = end - cappedSpan; // ensure exact span if we hit the right wall
        } else if (anchor === 'end') {
            start = clamp(end - cappedSpan, 0, duration);
            end = start + cappedSpan;
        } else {
            const center = (start + end) / 2;
            start = clamp(center - cappedSpan / 2, 0, duration - cappedSpan);
            end = start + cappedSpan;
        }
    }
    return [start, end];
}

/**
 * @param {Annotation} annotation
 * @returns {string | number}
 */
export function getAnnotationKey(annotation) {
    return annotation.id ?? `${annotation.start}-${annotation.end}-${annotation.label}`;
}

/**
 * Build a linear scale mapping `domain` onto `range`, with an `.invert(pixel)` method.
 * @param {[number, number]} domain
 * @param {[number, number]} range
 * @returns {LinearScale}
 */
export function createLinearScale(domain, range) {
    const [d0, d1] = domain;
    const [r0, r1] = range;
    const scale = /** @type {LinearScale} */ (
        Object.assign(
            (/** @type {number} */ value) => r0 + ((value - d0) * (r1 - r0)) / (d1 - d0),
            { invert: (/** @type {number} */ pixel) => d0 + ((pixel - r0) * (d1 - d0)) / (r1 - r0) },
        )
    );
    return scale;
}

/**
 * Build a stable label → color function over a fixed palette.
 * The same label returns the same color across the component tree.
 *
 * @param {string[]} labels
 * @param {string[]} [palette]
 * @returns {(label: string) => string}
 */
export function buildColorForLabel(labels, palette = DEFAULT_COLOR_PALETTE) {
    const unique = [...new Set(labels)];
    return (label) => palette[unique.indexOf(label) % palette.length];
}
