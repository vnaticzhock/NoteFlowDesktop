import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState
} from 'react'
import { useTranslation } from 'react-i18next'

import { editLanguage, getLanguage } from '../apis/APIs'

interface LanguageContextProps {
  language: string
  changeLanguage: () => Promise<void>
  translate: (input: string) => string
}

const LanguageContext = createContext<LanguageContextProps>({
  language: 'en',
  changeLanguage: async () => {},
  translate: (input: string): string => input
})

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const { t: translate, i18n } = useTranslation()
  const [language, setLanguage] = useState<string>('')

  const changeLanguage = useCallback(async () => {
    const newLang = language === 'en' ? 'zh' : 'en'
    await i18n.changeLanguage(newLang)
    setLanguage(newLang)
    await editLanguage(newLang)
  }, [language, i18n])

  useEffect(() => {
    const init = async (): Promise<void> => {
      const lang: string = await getLanguage()
      await i18n.changeLanguage(lang)
      setLanguage(lang)
    }
    void init()
  }, [i18n])

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, translate }}>
      {children}
    </LanguageContext.Provider>
  )
}

const useLanguage = (): LanguageContextProps => useContext(LanguageContext)

// Custom hook for using language and language switching functionality in components
export { useLanguage }
