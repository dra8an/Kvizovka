import 'react-i18next'
import common from './locales/en/common.json'
import game from './locales/en/game.json'
import dialogs from './locales/en/dialogs.json'
import validation from './locales/en/validation.json'

declare module 'react-i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common'
    resources: {
      common: typeof common
      game: typeof game
      dialogs: typeof dialogs
      validation: typeof validation
    }
  }
}
