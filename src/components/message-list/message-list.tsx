import { memo } from "react";
import type { RefObject } from "react";
import { Check, CheckCheck, CircleAlert, Clock3, Send } from "lucide-react";
import type { Delivery, Message } from "../../chat/chat-model";
import { formatDate, formatTime } from "../../utils/date-format";
import * as S from "./styles";

const statusText: Record<Delivery, string> = {
  sending: "Отправляется",
  queued: "В очереди",
  delivered: "Доставлено",
  read: "Прочитано",
  failed: "Не отправлено",
  unknown: "Результат неизвестен",
};

const DeliveryMark = ({ message }: { message: Message }) => {
  let icon = <Check size={14} />;

  if (message.status === "sending") {
    icon = <Clock3 size={13} />;
  } else if (message.status === "failed" || message.status === "unknown") {
    icon = <CircleAlert size={13} />;
  } else if (message.status === "delivered" || message.status === "read") {
    icon = <CheckCheck size={15} />;
  }

  return (
    <S.DeliveryStatus
      $status={message.status}
      title={statusText[message.status]}
    >
      {icon}
    </S.DeliveryStatus>
  );
};

interface MessageListProps {
  messages: Message[];
  listRef: RefObject<HTMLDivElement | null>;
  onScroll: () => void;
}

export const MessageList = memo(function MessageList({
  messages,
  listRef,
  onScroll,
}: MessageListProps) {
  return (
    <S.List
      ref={listRef}
      role="log"
      aria-label="Сообщения"
      aria-live="polite"
      onScroll={onScroll}
    >
      {messages.length === 0 && (
        <S.EmptyList>
          <span>
            <Send size={22} />
          </span>
          <b>Начните разговор</b>
          <p>
            Отправьте первое сообщение
            <br />в Telegram
          </p>
        </S.EmptyList>
      )}

      {messages.map((message, index) => {
        const previousMessage = messages[index - 1];
        const date = new Date(message.timestamp);
        const showDate =
          !previousMessage ||
          new Date(previousMessage.timestamp).toDateString() !==
            date.toDateString();
        const hasError =
          message.status === "failed" || message.status === "unknown";
        const showStatus =
          message.outgoing &&
          ["queued", "unknown", "failed"].includes(message.status);

        return (
          <div key={message.id}>
            {showDate && (
              <S.DateLabel>{formatDate(message.timestamp)}</S.DateLabel>
            )}
            <S.MessageRow $outgoing={message.outgoing}>
              <S.MessageBubble $outgoing={message.outgoing} $error={hasError}>
                <p>{message.text}</p>
                <S.MessageMeta>
                  {showStatus && <span>{statusText[message.status]}</span>}
                  <time dateTime={date.toISOString()}>
                    {formatTime(message.timestamp)}
                  </time>
                  {message.outgoing && <DeliveryMark message={message} />}
                </S.MessageMeta>
                {message.error && <S.ErrorText>{message.error}</S.ErrorText>}
              </S.MessageBubble>
            </S.MessageRow>
          </div>
        );
      })}
    </S.List>
  );
});
