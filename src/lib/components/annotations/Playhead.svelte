<!--
  Playhead.svelte — a single vertical line. Meant to be rendered inside a parent <svg>.

  The component is decorative (pointer-events: none) so it never swallows clicks
  destined for the track background.
-->

<script>
    /**
     * @typedef {Object} Props
     * @property {number} x                Horizontal pixel position.
     * @property {number} [y1]             Top y (defaults to 0).
     * @property {number} y2               Bottom y.
     * @property {string} [color]          Stroke color. Override via prop if you rebrand.
     * @property {number} [strokeWidth]    Stroke width in px.
     */

    /** @type {Props} */
    let {
        x,
        y1 = 0,
        y2,
        color = '#e03131',
        strokeWidth = 2,
    } = $props();
</script>

<line
        class="playhead"
        x1={x}
        x2={x}
        {y1}
        {y2}
        stroke={color}
        stroke-width={strokeWidth}
/>

<style>
    .playhead {
        pointer-events: none;
    }
</style>
