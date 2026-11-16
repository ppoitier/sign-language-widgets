<!--
@component
Icon: Spinning arc (loading). Sized at `1em` and colored with `currentColor`, so it follows the font of its parent.
Decorative (`aria-hidden`): give a label to the button that holds it.

```svelte
<VideoAction label="..."><LoadingIcon /></VideoAction>
```
-->


<svg class="loading-icon" aria-hidden="true"
     xmlns="http://www.w3.org/2000/svg"
     viewBox="0 0 24 24"
     fill="currentColor"
>
    <path d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z" />
</svg>

<style>
    @keyframes spin {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }

    .loading-icon {
        width: 1em;
        height: 1em;
        vertical-align: middle;
        animation: spin 1s linear infinite;
        transform-origin: center;
    }
</style>