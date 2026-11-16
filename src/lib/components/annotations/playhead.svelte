<!--
  A single vertical line. Meant to be rendered inside a parent <svg>.

  The component is decorative (pointer-events: none) so it never swallows clicks
  destined for the track background.
-->

<script>
    /**
     * @typedef {Object} Props
     * @property {number} x                    Horizontal pixel position.
     * @property {number} [y1=0]               Top y.
     * @property {number} y2                   Bottom y.
     * @property {string} [color='#e03131']    Stroke color.
     * @property {number} [stroke_width=2]     Stroke width in px.
     */

    /** @type {Props} */
    let {
        x,
        y1 = 0,
        y2,
        color = '#e03131',
        stroke_width = 2,
    } = $props()
</script>

<line
    class="playhead"
    x1={x}
    x2={x}
    {y1}
    {y2}
    stroke={color}
    stroke-width={stroke_width}
/>

<style>
    .playhead {
        pointer-events: none;
    }
</style>
