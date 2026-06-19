const FALLBACK_MESSAGES = {
  400: 'De ingevoerde gegevens zijn ongeldig.',
  401: 'Je bent niet (meer) ingelogd.',
  403: 'Je hebt geen toegang tot deze actie.',
  404: 'Niet gevonden.',
  409: 'Deze actie veroorzaakt een conflict met bestaande gegevens.',
}

export function extractErrorMessage(error) {
  const status = error?.response?.status
  const data = error?.response?.data
  const message = typeof data === 'string' ? data : data?.message
  return message || FALLBACK_MESSAGES[status] || 'Er is iets misgegaan. Probeer het opnieuw.'
}
