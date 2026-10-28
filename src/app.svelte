<script>
    import CardGridDemo from './demo/card-grid-demo.svelte'
    import SignCardDemo from './demo/sign-card-demo.svelte'
    import SignListDemo from './demo/sign-list-demo.svelte'
    import SignGroupDemo from './demo/sign-group-demo.svelte'
    import VideoCardDemo from './demo/video-card-demo.svelte'
    import WebcamDemo from './demo/webcam-demo.svelte'
    import VideoRecorderDemo from './demo/video-recorder-demo.svelte'
    import VideoImporterDemo from './demo/video-importer-demo.svelte'
    import AnnotationTimelineDemo from './demo/annotation-timeline-demo.svelte'

    /**
     * @typedef {Object} Demo
     * @property {string} title - Title shown in the navigation.
     * @property {import('svelte').Component} component - Component of the demo.
     */

    /** @type {Record<string, Demo>} */
    const demos = {
        'card-grid': { title: 'Grille de cartes', component: CardGridDemo },
        'sign-card': { title: 'Carte de signe', component: SignCardDemo },
        'sign-list': { title: 'Liste de signes', component: SignListDemo },
        'sign-group': { title: 'Groupe de signes', component: SignGroupDemo },
        'video-card': { title: 'Carte vidéo', component: VideoCardDemo },
        'webcam': { title: 'Webcam', component: WebcamDemo },
        'video-recorder': { title: 'Enregistreur vidéo', component: VideoRecorderDemo },
        'video-importer': { title: 'Import de vidéo', component: VideoImporterDemo },
        'annotation-timeline': { title: "Timeline d'annotations", component: AnnotationTimelineDemo },
    }
    const default_demo = 'card-grid'

    // The demo is chosen by the URL hash (e.g. `#video-recorder`), so it can be reloaded and shared.
    let hash = $state(location.hash.slice(1))
    const current_id = $derived(hash in demos ? hash : default_demo)
    const demo = $derived(demos[current_id])
</script>

<svelte:window onhashchange={() => hash = location.hash.slice(1)} />

<nav>
    {#each Object.entries(demos) as [id, { title }] (id)}
        <a href="#{id}" aria-current={id === current_id ? 'page' : undefined}>{title}</a>
    {/each}
</nav>

<main>
    <demo.component />
</main>

<style>
    nav {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem 1.5rem;
        padding: 1rem 2rem;
        border-bottom: 0.1rem solid var(--card-border);
    }

    a {
        color: var(--button-color);
        text-decoration: none;
    }

    a[aria-current='page'] {
        font-weight: 700;
        text-decoration: underline;
    }
</style>
