/**
 * @typedef {object} SignOptions Options for creating a new sign instance.
 * @property {string} id - The unique identifier for the sign (UUID).
 * @property {string} url - The url of the sign video.
 * @property {string} mime_type - The mime type of the sign video.
 * @property {{id: string, word: string}[]} words - The words associated with the sign.
 * @property {boolean} [editable=false] - If true, the sign can be edited.
 * @property {boolean} [with_actions=false] - If true, the sign can be approved or rejected.
 * @property {boolean} [highlighted=false] - If true, the sign is highlighted.
 */

export class Sign {
    /**
     * @param {SignOptions} options
     */
    constructor({id, url, mime_type, words, editable=false, with_actions = false, highlighted = false}) {
        this.id = id
        this.url = url
        this.mime_type = mime_type
        this.words = words
        this.editable = editable
        this.with_actions = with_actions
        this.highlighted = highlighted
    }
}
