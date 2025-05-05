import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import esFlag from "../assets/spain_flag.jpg";
import gbFlag from "../assets/gb_flag.jpg";
import './LanguageSwitcher.css';

const languages = [
  { code: "en", label: "English", flag: gbFlag },
  { code: "es", label: "Español", flag: esFlag },
];

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language);

  const handleLanguageChange = (code) => {
    setLanguage(code);
    i18n.changeLanguage(code);
  };

  useEffect(() => {
    const browserLang = navigator.language || navigator.userLanguage;
    const shortLang = browserLang.split("-")[0];
    const supportedLangs = ["en", "es"];
    const initialLang = supportedLangs.includes(shortLang) ? shortLang : "en";
    i18n.changeLanguage(initialLang);
    setLanguage(initialLang);
  }, [i18n]);

  return (
    <div className="language-switcher">
      <label className="language-label">Idioma:</label>
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => handleLanguageChange(lang.code)}
          className={`language-button ${lang.code} ${language === lang.code ? "active" : ""}`}
        >
          <img src={lang.flag} alt={lang.label} className="language-flag" />
          {lang.label}
        </button>
      ))}
    </div>
  );
}
