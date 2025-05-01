<script>
    let {children, onclick, color="#6a6a6a"} = $props()
</script>

<button class="sign-action" {onclick} style="color: {color}">
    {@render children?.()}
</button>

<style>
    .sign-action {
        all: unset;
        width: 2.4rem;
        height: 2.4rem;
        background: rgba(255, 255, 255, 0.6);
        border-radius: .5rem;
        border: 1px solid white;
        display: grid;
        place-items: center;
        font-size: 2rem;
        cursor: pointer;

        transition: background-color .2s, color .2s, border-color .2s;
    }

    .sign-action:hover, .sign-action:active {
        border-color: var(--active-action-color);
        color: var(--active-action-color);
        background-color: white;
    }

    .sign-action:focus-visible {
        outline: 2px solid var(--focus-visible-color);
    }
</style>
