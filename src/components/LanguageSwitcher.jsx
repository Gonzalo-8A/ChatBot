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
    setLanguage(i18n.language);
  }, [i18n.language]);

  return (
    <div className="language-switcher">
      <label className="language-label">Idioma:</label>
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => handleLanguageChange(lang.code)}
          className={`language-button ${language === lang.code ? "active" : ""}`}
        >
          <img src={lang.flag} alt={lang.label} className="language-flag" />
          {lang.label}
        </button>
      ))}
    </div>
  );
}
