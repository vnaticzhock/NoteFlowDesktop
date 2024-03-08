import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'

import { editLanguage, getLanguage } from '../apis/APIs'

const LanguageContext = createContext({
  language: 'en',
  changeLanguage: () => {},
  translate: () => '',
})

export const LanguageProvider = ({ children }) => {
  const { t: translate, i18n } = useTranslation()
  const [language, setLanguage] = useState()

  const changeLanguage = useCallback(() => {
    const newLang = language === 'en' ? 'zh' : 'en'
    i18n.changeLanguage(newLang)
    setLanguage(newLang)
    editLanguage(newLang)
  }, [language])

  useEffect(() => {
    getLanguage().then((res) => {
      i18n.changeLanguage(res)
      setLanguage(res)
    })
  }, [])

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, translate }}>
      {children}
    </LanguageContext.Provider>
  )
}

const useLanguage = () => useContext(LanguageContext)

// 自定義 Hook 以便在組件中使用語言和切換語言功能
export { useLanguage }
