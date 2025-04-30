import { useRef, useEffect } from 'react'
import { ChatMessage } from './ChatMessage';
import { useTranslation } from 'react-i18next';
import './ChatMessages.css';

export default function ChatMessages({ chatMessages }) {
  const chatMessagesRef = useRef(null);

  useEffect(() => {
    const containerElem = chatMessagesRef.current;
    if (containerElem) {
      containerElem.scrollTop = containerElem.scrollHeight;
    }
  }, [chatMessages]);

  const { t } = useTranslation();

  return (
    <div className="chat-messages-container" ref={chatMessagesRef}>
      {chatMessages.map((chatMessage) => {
        return (
          <ChatMessage
            message={chatMessage.message}
            sender={chatMessage.sender}
            translationKey={chatMessage.translationKey}
            time={chatMessage.time}
            key={chatMessage.id}
            t={t}
          />
        );
      })}
    </div>
  );
}