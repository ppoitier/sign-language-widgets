<script>
    let {children} = $props()
    let opened = $state(false)
    let dialog_element = $state()

    $effect(() => {
        if (dialog_element) {
            if (opened) {
                if (!dialog_element.open) {
                    dialog_element.showModal()
                }
            } else {
                if (dialog_element.open) {
                    dialog_element.close()
                }
            }
        }
    })

    // noinspection JSUnusedGlobalSymbols
    function open_modal() {
        opened = true
    }

    function close_modal() {
        opened = false
    }

    /**
     * @param {MouseEvent} event
     */
    function handle_click_outside(event) {
        if (event.target === dialog_element) {
            opened = false
        }
    }

    // Expose to parent components, so they can explicitly open the modal.
    export {open_modal, close_modal}

</script>

<dialog bind:this={dialog_element}
        onclose={close_modal}
        onclick={handle_click_outside}
>
    <article>

        {@render children()}

        <footer>
            <form method="dialog">
                <button>Fermer</button>
            </form>
        </footer>
    </article>
</dialog>

<style>
    dialog {
        margin: 2rem auto;
        border: 1px solid #ccc;
        border-radius: .8rem;
        padding: 0;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        min-width: 30rem;
        max-width: 90vw;
    }

    dialog::backdrop {
        background-color: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(2px);
    }

    article {
        padding: 1.5rem;
    }

    footer {
        display: flex;
        justify-content: flex-end; /* Align button to the right */
        margin-top: auto; /* Pushes footer to bottom if article has fixed height */
    }

    button {
        padding: 0.5em 1em;
        background-color: #f0f0f0;
        border: 1px solid #ccc;
        border-radius: .4rem;
        cursor: pointer;
        transition: background-color 0.2s ease;
    }

    button:hover {
        background-color: #e0e0e0;
    }

    button:active {
        background-color: #d0d0d0;
    }
</style>