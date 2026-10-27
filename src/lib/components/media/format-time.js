/**
 * @param {number} seconds
 * @returns {string} Time formatted as `m:ss` (`0:00` for invalid or negative times).
 */
export function format_time(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
    const minutes = Math.floor(seconds / 60)
    const rest = Math.floor(seconds % 60)
    return `${minutes}:${String(rest).padStart(2, '0')}`
}
