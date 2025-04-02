<script>
    import Video from "../media/video.svelte"
    import TagList from "../tags/tag-list.svelte"
</script>

<div class="sign-card">
    <div class="sign-card_preview">
        <Video url="https://give-me-a-sign.ppoitier.com/static/videos/corpus_lsfb/signe_943ee9e5edd9fd578c3ec7fcb544d25f.webm" mime_type="video/webm" />
    </div>
    <div class="sign-card_actions">
        <TagList texts={['voiture', 'auto', 'automobile']}
                 on_save={() => {}}
                 on_new={() => {}}
                 editable={true}
        />
    </div>
</div>

<style>
    .sign-card {
        width: 100%;
        max-width: var(--card-max-width);
        min-width: var(--card-min-width);
        overflow: hidden;
        border-radius: 0.8rem;
        border: 0.1rem solid var(--card-border);
        background-color: var(--card-background);
    }

    .sign-card_actions {
        padding: .5rem 0;
        min-height: 4rem;
        font-size: 1.2rem;
    }
</style>

