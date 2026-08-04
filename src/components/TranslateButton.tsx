import { useState } from 'react'
import { translateText } from '../api/translate'
import { useLanguageStore } from '../store/languageStore'

interface Props {
  text: string
  className?: string
}

export function TranslateButton({ text, className }: Props) {
  const language = useLanguageStore((s) => s.language)
  const [translated, setTranslated] = useState<string | null>(null)
  const [showTranslated, setShowTranslated] = useState(false)
  const [loading, setLoading] = useState(false)

  const displayText = showTranslated && translated ? translated : text

  const handleClick = async () => {
    if (showTranslated) { setShowTranslated(false); return }
    if (translated) { setShowTranslated(true); return }
    setLoading(true)
    try {
      const result = await translateText(text, language)
      setTranslated(result)
      setShowTranslated(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={className}>{displayText}</span>
      <button
        onClick={handleClick}
        title={showTranslated ? 'Show original' : `Translate to ${language}`}
        className={`shrink-0 transition-colors ${showTranslated ? 'text-cyan-400' : 'text-slate-600 hover:text-cyan-400'}`}
      >
        {loading ? (
          <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
          </svg>
        )}
      </button>
    </span>
  )
}
