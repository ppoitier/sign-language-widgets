/**
 * Sample signs shared by the sign demos (card grid, list and group).
 *
 * @typedef {import('../lib/components/signs/sign-item.js').SignItem} SignItem
 */

/**
 * New sample signs (wrap them in `$state` to edit them).
 * @returns {SignItem[]}
 */
export function create_sample_signs() {
    const video_url = `${import.meta.env.BASE_URL}continuous-sample/CLSFBI0110A_S002_B.mp4`
    return [
        { id: 's1', src: video_url, words: [{ id: 'w1', text: 'bonjour' }, { id: 'w2', text: 'salut' }], editable: true },
        { id: 's2', src: video_url, words: [{ id: 'w3', text: 'merci' }], editable: true, highlighted: true },
        { id: 's3', src: video_url, words: [{ id: 'w4', text: 'maison' }, { id: 'w5', text: 'habitation' }, { id: 'w6', text: 'domicile' }] },
        { id: 's4', src: `${import.meta.env.BASE_URL}missing.mp4`, words: [], editable: true },
    ]
}

/**
 * @param {SignItem} sign
 * @param {string} text
 */
export function add_word(sign, text) {
    sign.words.push({ id: crypto.randomUUID(), text })
}

/**
 * @param {SignItem} sign
 * @param {string} word_id
 * @param {string} text
 */
export function rename_word(sign, word_id, text) {
    const word = sign.words.find((w) => w.id === word_id)
    if (word) word.text = text
}

/**
 * @param {SignItem} sign
 * @param {string} word_id
 */
export function remove_word(sign, word_id) {
    sign.words = sign.words.filter((w) => w.id !== word_id)
}
