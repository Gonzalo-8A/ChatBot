import { useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n.js';
import Header from './components/Header/Header.jsx';
import { ChatInput } from './components/ChatInput/ChatInput.jsx';

import ChatMessages from './components/ChatMessages/ChatMessages.jsx';
import './App.css';

function App() {
  const [chatMessages, setChatMessages] = useState([]);

  return (
    <I18nextProvider i18n={i18n}>
      <div className="app-container">
      <Header />
        <ChatMessages chatMessages={chatMessages} />
        <ChatInput chatMessages={chatMessages} setChatMessages={setChatMessages} />
      </div>
    </I18nextProvider>
  );
}

export default App;
