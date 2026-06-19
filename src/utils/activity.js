export function getActivityStatus(activity) {
  if (!activity?.maxParticipants) return null
  return (activity.currentParticipants ?? 0) >= activity.maxParticipants ? 'FULL' : 'AVAILABLE'
}
