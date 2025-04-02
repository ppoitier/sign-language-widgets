<script>
import Video from '../media/video.svelte'
import TagList from '../tags/tag-list.svelte'
</script>

<tr class="sign-list-item">
    <td>
        <div class="sign-list-item_preview">
            <Video url="https://give-me-a-sign.ppoitier.com/static/videos/corpus_lsfb/signe_943ee9e5edd9fd578c3ec7fcb544d25f.webm" mime_type="video/webm" />
        </div>
    </td>
    <td>
        <div class="sign-list-item_info">
            <TagList texts={['voiture', 'auto', 'automobile']}
                     on_save={() => {}}
                     on_new={() => {}}
                     editable={true}
            />
        </div>
    </td>
    <td>
        <div class="sign-list-item_actions">
        </div>
    </td>
</tr>


<style>
    .sign-list-item_preview {
        width: 100%;
        /*margin: auto;*/
        max-width: 32rem;
        min-width: 24rem;
    }

    .sign-list-item_info {
        padding: 1rem .5rem;
        font-size: 1.4rem;
    }
</style>
