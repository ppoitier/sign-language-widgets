<script>
    let {text = 'example of name'} = $props()
</script>

<span class="tag">{text}</span>

<style>
    .tag {
        display: inline-block;
        padding: .2em .6em;
        border-radius: 0.4em;
        background-color: var(--tag-color);
        color: white;
    }
</style>
