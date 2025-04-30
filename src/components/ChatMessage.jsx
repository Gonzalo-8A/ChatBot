import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import RobotProfileImage from "../assets/robot_tag-modified.png";
import UserProfileImage from "../assets/user.png";
import "./ChatMessage.css";

export function ChatMessage({ message, sender, time }) {
  const [resolvedMessage, setResolvedMessage] = useState(message);
  const { t } = useTranslation();

  useEffect(() => {
    if (message instanceof Promise) {
      message.then((r) =>
        setResolvedMessage((prev) => (prev !== r ? r : prev))
      );
    } else {
      setResolvedMessage(message);
    }
  }, [message]);

  // 1) Caso "HTML puro" - Detecta si message es un objeto con 'message' (HTML)
  if (
    resolvedMessage &&
    typeof resolvedMessage === "object" &&
    "message" in resolvedMessage &&
    typeof resolvedMessage.message === "string"
  ) {
    const html = resolvedMessage.message;
    // Extraer iframe
    // eslint-disable-next-line no-undef
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const iframe = doc.querySelector("iframe");
    const description = iframe
      ? doc.body.innerHTML.replace(iframe.outerHTML, "") // Extract description
      : html;

    const translatedDescription = description.replace(
      /🎵 (.*?)<\/strong>/, // Regex para encontrar la parte "Playing: ..."
      `🎵 ${t("Playing")}: <strong>$1</strong>`
    );

    return (
      <div
        className={
          sender === "user" ? "chat-user-message" : "chat-robot-message"
        }
      >
        {sender === "robot" && (
          <img
            src={RobotProfileImage}
            className="chat-message-profile robot"
            alt="Robot"
          />
        )}
        <div className="chat-message-text">
          <div dangerouslySetInnerHTML={{ __html: translatedDescription }} />
          {iframe && (
            <iframe
              key={iframe.getAttribute("src")}
              src={iframe.getAttribute("src")}
              width={iframe.getAttribute("width") || "560"}
              height={iframe.getAttribute("height") || "315"}
              title={iframe.getAttribute("title") || "Embedded content"}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
          {time && (
            <div className="chat-message-time">
              {dayjs(time).format("h:mma")}
            </div>
          )}
        </div>
        {sender === "user" && (
          <img
            src={UserProfileImage}
            className="chat-message-profile"
            alt="User"
          />
        )}
      </div>
    );
  }

  // 2) Caso "Traducción" - Si el mensaje tiene translationKey
  if (
    resolvedMessage &&
    typeof resolvedMessage === "object" &&
    "translationKey" in resolvedMessage
  ) {
    const { translationKey, variables } = resolvedMessage;
    return (
      <div
        className={
          sender === "user" ? "chat-user-message" : "chat-robot-message"
        }
      >
        {sender === "robot" && (
          <img
            src={RobotProfileImage}
            className="chat-message-profile robot"
            alt="Robot"
          />
        )}
        <div className="chat-message-text">
          {t(translationKey, {
            ...variables,
            ...(variables?.month ? { month: t(variables.month) } : {}),
          })}
          {time && (
            <div className="chat-message-time">
              {dayjs(time).format("h:mma")}
            </div>
          )}
        </div>
        {sender === "user" && (
          <img
            src={UserProfileImage}
            className="chat-message-profile"
            alt="User"
          />
        )}
      </div>
    );
  }

  // 3) Caso "Texto plano" - Si el mensaje es texto, traducirlo con t()
  const text =
    typeof resolvedMessage === "string" ? t(resolvedMessage) : resolvedMessage;

  return (
    <div
      className={sender === "user" ? "chat-user-message" : "chat-robot-message"}
    >
      {sender === "robot" && (
        <img
          src={RobotProfileImage}
          className="chat-message-profile robot"
          alt="Robot"
        />
      )}
      <div className="chat-message-text">
        {text}
        {time && (
          <div className="chat-message-time">{dayjs(time).format("h:mma")}</div>
        )}
      </div>
      {sender === "user" && (
        <img
          src={UserProfileImage}
          className="chat-message-profile"
          alt="User"
        />
      )}
    </div>
  );
}
