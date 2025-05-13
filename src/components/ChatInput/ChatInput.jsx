import dayjs from 'dayjs';
import { useState } from 'react';
import { Chatbot } from '../../data/Chatbot.js';
import LoadingImg from '../../assets/loading-spinner.gif';
import './ChatInput.css';

export const ChatInput = ({ chatMessages, setChatMessages }) => {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false)

  function saveInputText  (event) {
    setInputText(event.target.value)
  }

  async function sendMessage () {
    
    if(isLoading || inputText==='') {
      return
    }
    
    setInputText('');
    setIsLoading(true);

    const newChatMessages = [
      ...chatMessages,
      {
        message: inputText,
        sender: 'user',
        id: crypto.randomUUID(),
        time: dayjs().valueOf()
      }
    ];

    setChatMessages(newChatMessages)

    setChatMessages([
      ...newChatMessages,
      {
        message: <img src={LoadingImg} className="loading-spinner" />,
        sender: 'robot',
        id: crypto.randomUUID(),
      }
    ])
    const response = await Chatbot.getResponseAsync(inputText);

    setChatMessages([
      ...newChatMessages,
      {
        message: response,  // No envolvemos 'response' en otro objeto
        sender: 'robot',
        id: crypto.randomUUID(),
        time: dayjs().valueOf()
      }
    ]);
    
    setIsLoading(false)
  }
  
  function clearMessages() {
    setChatMessages([])
  }

  function handleKeyDown (e) {
    if(e.key==='Enter'){
      sendMessage()
    }
    if(e.key==='Escape'){
      setInputText('')
    }
  }


  return (
    <>
      <div className='input-container'>
        <input
          type="text"
          placeholder="Send a message to ChatBot"
          size="30"
          onChange={saveInputText}
          onKeyDown={handleKeyDown}
          value={inputText}
          className='chat-input'
        />
        <div className="button-group">
          <button
          onClick={sendMessage}
          className='send-button'
          >Send</button>
          <button
          onClick={clearMessages}
          className='clear-button'
          >Clear</button>
        </div>
      </div>
    </>
  )
}