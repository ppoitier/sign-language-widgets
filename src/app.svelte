<script>
    import MultiSelectField from "./components/interaction/multi-select-field.svelte";

    let options = $state([
        {id: 'lex1', name: 'Lexique 1', selected: false},
        {id: 'lex2', name: 'Lexique 2', selected: false},
        {id: 'lex3', name: 'Lexique 3', selected: false},
    ])

    $inspect(options)
</script>

<main>
    <MultiSelectField default_text="Tous les lexiques" bind:options={options} search_placeholder="Nom d'un lexique..." />
</main>

<style>
    main {
        padding: 5rem;
        margin: auto;
        max-width: 100rem;
    }
</style>
