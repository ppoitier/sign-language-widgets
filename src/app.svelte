<script>
    import TagList from "./components/tags/tag-list.svelte";
</script>

<main>
    <TagList texts={['voiture', 'auto', 'automobile', 'voiture', 'auto', 'automobile', 'voiture', 'auto', 'automobile', 'voiture', 'auto', 'automobile']}
             editable={true}
             on_save={(index, new_text) => {
                 console.log(`Save tag: index=${index} -- text=${new_text}`)
             }}
             on_new={(new_text) => {
                 console.log(`New tag: text=${new_text}`)
             }}
    />
</main>

<style>
    main {
        padding: 5rem;
        font-size: 1rem;
    }
</style>
