import { useTranslation } from 'react-i18next'

/**
 * LanguageSwitcher Component
 *
 * Allows users to switch between English and Serbian languages.
 *
 * Features:
 * - Auto-detects language from browser settings
 * - Persists selection in localStorage
 * - Visual feedback for active language
 */
export function LanguageSwitcher() {
  const { i18n } = useTranslation()

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'sr', name: 'Српски', flag: '🇷🇸' },
  ]

  return (
    <div className="flex gap-2">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => i18n.changeLanguage(lang.code)}
          className={`px-3 py-1 rounded transition-colors ${
            i18n.language === lang.code ||
            (i18n.language.startsWith(lang.code) && lang.code === 'sr') // Handle sr-RS, sr-Cyrl, etc.
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          title={`Switch to ${lang.name}`}
        >
          <span className="mr-1">{lang.flag}</span>
          {lang.name}
        </button>
      ))}
    </div>
  )
}
