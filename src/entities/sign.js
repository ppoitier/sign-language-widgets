/**
 * @typedef {object} SignOptions Options for creating a new sign instance.
 * @property {string} id - The unique identifier for the sign (UUID).
 * @property {string} url - The url of the sign video.
 * @property {string} mime_type - The mime type of the sign video.
 * @property {string[]} words - The words associated with the sign.
 * @property {boolean} editable - If true, the sign can be edited.
 */

export class Sign {
    /**
     * @param {SignOptions} options
     */
    constructor({id, url, mime_type, words, editable=false}) {
        this.id = id
        this.url = url
        this.mime_type = mime_type
        this.words = words
        this.editable = editable
    }
}
