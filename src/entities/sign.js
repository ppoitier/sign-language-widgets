/**
 * @typedef {object} SignOptions Options for creating a new sign instance.
 * @property {string} id - The unique identifier for the sign (UUID).
 * @property {string} url - The url of the preview of the sign.
 * @property {string} mime_type - The mime type of the video of the sign.
 * @property {string[]} words - The words associated with the sign.
 */

export class Sign {
    /**
     * @param {SignOptions} options
     */
    constructor({id, url, mime_type, words}) {
        this.id = id
        this.url = url
        this.mime_type = mime_type
        this.words = words
    }
}
