<script>
import Video from '../media/video.svelte'
import TagList from '../tags/tag-list.svelte'

/**
 * @typedef {import('../../entities/sign.js').Sign} Sign
 *
 * @typedef {Object} SignListItemProps
 * @property {Sign} sign - Sign that is displayed in the card.
 * @property {NewWordCallback} on_new_word - Function called when a new word is added to the sign.
 * @property {UpdatedWordCallback} on_updated_word - Function called when a word of the sign is updated.
 */

/**
 * @callback NewWordCallback
 * @param {string} sign_id
 * @param {string} new_word
 */

/**
 * @callback UpdatedWordCallback
 * @param {string} sign_id
 * @param {number} word_index
 * @param {string} new_word
 */

/** @type {SignListItemProps} */
let {sign, on_new_word, on_updated_word} = $props()

/**
 * @param {string} new_word
 */
function handle_new_word(new_word) {
    on_new_word(sign.id, new_word)
}

/**
 * @param {number} index
 * @param {string} new_word
 */
function handle_updated_word(index, new_word) {
    on_updated_word(sign.id, index, new_word)
}
</script>

<tr class="sign-list-item">
    <td>
        <div class="sign-list-item_preview">
            <Video url={sign.url} mime_type={sign.mime_type} />
        </div>
    </td>
    <td>
        <div class="sign-list-item_info">
            <TagList texts={sign.words}
                     on_updated={handle_updated_word}
                     on_new={handle_new_word}
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
        max-width: 32rem;
        min-width: 24rem;
    }

    .sign-list-item_info {
        padding: 1rem .5rem;
        font-size: 1.4rem;
    }
</style>
