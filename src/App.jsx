import { useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n.js';
import { LanguageSwitcher } from './components/LanguageSwitcher.jsx';
import { ChatInput } from './components/ChatInput';

import ChatMessages from './components/ChatMessages';
import './App.css';

function App() {
  const [chatMessages, setChatMessages] = useState([])

  return (
    <I18nextProvider i18n={i18n}>
      <div className="app-container">
        <LanguageSwitcher />
        <ChatMessages chatMessages={chatMessages} />
        <ChatInput chatMessages={chatMessages} setChatMessages={setChatMessages} />
      </div>
    </I18nextProvider>
  );
}

export default App;
