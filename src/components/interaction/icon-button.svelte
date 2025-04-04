<script>
    let {children, onclick, label="Button"} = $props()
</script>

<button class="icon-button" onclick={onclick} aria-label={label}>
    {@render children()}
</button>

<style>
    .icon-button {
        display: inline-block;
        background: none;
        border: none;
        outline: none;
        text-decoration: none;
        font-size: 1em;
    }

    .icon-button:hover, .icon-button:focus {
        color: var(--active-button-color);
    }

    .icon-button:focus-visible {
        outline: .15rem solid var(--focus-visible-color);
    }
</style>
