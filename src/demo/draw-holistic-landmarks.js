import { DrawingUtils, FaceLandmarker, HolisticLandmarker } from '@mediapipe/tasks-vision'

/**
 * Draws holistic landmarks on a canvas, sized like the video (landmarks are in video coordinates).
 * The canvas should use `object-fit: contain`, like the video, to stay aligned with the image.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {HTMLVideoElement} video
 * @param {import('@mediapipe/tasks-vision').HolisticLandmarkerResult} result
 */
export function draw_holistic_landmarks(canvas, video, result) {
    const context = canvas.getContext('2d')
    if (!context) return
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context.clearRect(0, 0, canvas.width, canvas.height)

    const drawing = new DrawingUtils(context)
    for (const landmarks of result.faceLandmarks) {
        drawing.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_TESSELATION, { color: '#C0C0C070', lineWidth: 1 })
        drawing.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE, { color: '#FF3030' })
        drawing.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW, { color: '#FF3030' })
        drawing.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LEFT_EYE, { color: '#30FF30' })
        drawing.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW, { color: '#30FF30' })
        drawing.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LIPS, { color: '#E0E0E0' })
        drawing.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_FACE_OVAL, { color: '#E0E0E0' })
    }
    for (const landmarks of result.poseLandmarks) {
        drawing.drawConnectors(landmarks, HolisticLandmarker.POSE_CONNECTIONS, { color: '#FFFFFF' })
        drawing.drawLandmarks(landmarks, { color: '#FF0000', radius: 1 })
    }
    for (const landmarks of result.leftHandLandmarks) {
        drawing.drawConnectors(landmarks, HolisticLandmarker.HAND_CONNECTIONS, { color: '#CC0000', lineWidth: 5 })
        drawing.drawLandmarks(landmarks, { color: '#00FF00', lineWidth: 2 })
    }
    for (const landmarks of result.rightHandLandmarks) {
        drawing.drawConnectors(landmarks, HolisticLandmarker.HAND_CONNECTIONS, { color: '#00CC00', lineWidth: 5 })
        drawing.drawLandmarks(landmarks, { color: '#FF0000', lineWidth: 2 })
    }
}
