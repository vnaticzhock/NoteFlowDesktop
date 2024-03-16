import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {useTranslation} from "react-i18next";

import {editLanguage, getLanguage} from "../apis/APIs";

interface LanguageContextProps {
  language: string;
  changeLanguage: () => void;
  translate: (input: string) => string;
}

const LanguageContext = createContext<LanguageContextProps>({
  language: "en",
  changeLanguage: () => {},
  translate: (input: string): string => input,
});

export const LanguageProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const {t: translate, i18n} = useTranslation();
  const [language, setLanguage] = useState<string | undefined>();

  const changeLanguage = useCallback(() => {
    const newLang = language === "en" ? "zh" : "en";
    i18n.changeLanguage(newLang);
    setLanguage(newLang);
    editLanguage(newLang);
  }, [language, i18n]);

  useEffect(() => {
    getLanguage().then(res => {
      i18n.changeLanguage(res);
      setLanguage(res);
    });
  }, [i18n]);

  return (
    <LanguageContext.Provider value={{language, changeLanguage, translate}}>
      {children}
    </LanguageContext.Provider>
  );
};

const useLanguage = (): LanguageContextProps => useContext(LanguageContext);

// Custom hook for using language and language switching functionality in components
export {useLanguage};
