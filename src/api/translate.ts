import client from './client'

export const translateText = (text: string, targetLanguage: string) =>
  client.post<{ translatedText: string }>('/api/translate', { text, targetLanguage }).then((r) => r.data.translatedText)
