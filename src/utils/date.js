export function formatDateTime(value) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('nl-NL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function toDateTimeInputValue(value) {
  if (!value) return ''
  return value.slice(0, 16)
}

export function getActivityTiming(activity) {
  if (!activity?.startTime) return null
  const now = new Date()
  const start = new Date(activity.startTime)
  const end = activity.endTime ? new Date(activity.endTime) : null
  if (now < start) return 'UPCOMING'
  if (end && now > end) return 'PAST'
  return 'ONGOING'
}
