// Types of the data given to the components, for apps (JSDoc: `import('sign-language-widgets').SignItem`).
/**
 * @typedef {import('./components/media/video-marker.js').Marker} Marker
 * @typedef {import('./components/tags/tag-item.js').TagItem} TagItem
 * @typedef {import('./components/signs/sign-item.js').SignItem} SignItem
 * @typedef {import('./components/annotations/timeline-utils.js').Annotation} Annotation
 * @typedef {import('./components/annotations/timeline-utils.js').Tier} Tier
 * @typedef {import('./components/annotations/timeline-utils.js').SeekEvent} SeekEvent
 * @typedef {import('./components/interaction/multi-select-option.js').MultiSelectOption} MultiSelectOption
 * @typedef {import('./services/recording.service.js').RecordingOptions} RecordingOptions
 * @typedef {import('./services/recording.service.js').RecordedVideo} RecordedVideo
 * @typedef {import('./services/recording.service.js').Recording} Recording
 */

export {default as VideoOverlay} from './components/media/video-overlay.svelte'
export {default as WebcamPreview} from './components/media/webcam-preview.svelte'
export {default as VideoPlayer} from './components/media/video-player.svelte'
export {default as MediaCard} from './components/media/media-card.svelte'
export {default as VideoCard} from './components/media/video-card.svelte'
export {default as VideoRecorder} from './components/media/video-recorder.svelte'
export {default as VideoImporter} from './components/media/video-importer.svelte'
export {default as VideoAction} from './components/media/video-action.svelte'
export {default as VideoDownloadDialog} from './components/media/video-download-dialog.svelte'

export {default as CardGrid} from './components/layout/card-grid.svelte'

export {start_recording} from './services/recording.service.js'

export {default as SignCard} from './components/signs/sign-card.svelte'
export {default as SignListItem} from './components/signs/sign-list-item.svelte'
export {default as SignList} from './components/signs/sign-list.svelte'
export {default as SignGroup} from './components/signs/sign-group.svelte'

export {default as Tag} from './components/tags/tag.svelte'
export {default as EditableTag} from './components/tags/editable-tag.svelte'
export {default as TagList} from './components/tags/tag-list.svelte'

export {default as IconButton} from './components/interaction/icon-button.svelte'
export {default as AddIcon} from './components/icons/add-icon.svelte'
export {default as GridIcon} from './components/icons/grid-icon.svelte'
export {default as ListIcon} from './components/icons/list-icon.svelte'
export {default as LoadingIcon} from './components/icons/loading-icon.svelte'
export {default as NotFoundIcon} from './components/icons/not-found-icon.svelte'
export {default as CheckboxListIcon} from './components/icons/checkbox-list-icon.svelte'
export {default as VideoFileIcon} from './components/icons/video-file-icon.svelte'
export {default as CloseIcon} from './components/icons/close-icon.svelte'
export {default as DownloadIcon} from './components/icons/download-icon.svelte'
export {default as InfoIcon} from './components/icons/info-icon.svelte'
export {default as HideIcon} from './components/icons/hide-icon.svelte'
export {default as AddVideoIcon} from './components/icons/add-video-icon.svelte'

export {default as MultiSelectField} from './components/interaction/multi-select-field.svelte'

export {default as AnnotationTimeline} from './components/annotations/annotation-timeline.svelte'

