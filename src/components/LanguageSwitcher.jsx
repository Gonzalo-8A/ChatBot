import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import esFlag from "../assets/spain_flag.jpg";
import gbFlag from "../assets/gb_flag.jpg";

const flagStyle = {
  width: "1.5rem",
  height: "1.5rem",
  borderRadius: "50%",
  objectFit: "cover",
  marginRight: "0.5rem",
  verticalAlign: "middle"
};

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
    <div style={{ marginBottom: "1rem" }}>
      <label style={{ marginRight: "0.5rem" }}>Idioma:</label>
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => handleLanguageChange(lang.code)}
          style={{
            backgroundColor: language === lang.code ? "#e0e0e0" : "white",
            border: "1px solid #ccc",
            borderRadius: "5px",
            marginRight: "0.5rem",
            padding: "0.3rem 0.6rem",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center"
          }}
        >
          <img src={lang.flag} alt={lang.label} style={flagStyle} />
          {lang.label}
        </button>
      ))}
    </div>
  );
}
