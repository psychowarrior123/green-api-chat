import type { FormEvent, RefObject } from "react";
import {
  ArrowRight,
  LoaderCircle,
  LogOut,
  MessageCircle,
  Plus,
  X,
} from "lucide-react";
import type { Chat } from "../../chat/chat-model";
import type { Connection } from "../../chat/polling";
import { formatTime } from "../../utils/date-format";
import { Brand } from "../brand";
import { ChatAvatar } from "../chat-avatar";
import { IconButton } from "../icon-button";
import * as S from "./styles";

const connectionLabels = {
  online: "Подключено",
  reconnecting: "Восстанавливаем связь",
  stopped: "Остановлено",
};

interface ChatSidebarProps {
  chats: Chat[];
  activeId: string | null;
  instanceId: string;
  connection: Connection;
  newChatOpen: boolean;
  phone: string;
  creating: boolean;
  createError: string;
  inputRef?: RefObject<HTMLInputElement | null>;
  onPhoneChange: (value: string) => void;
  onCreate: (event: FormEvent) => void;
  onNewChat: () => void;
  onCloseNewChat: () => void;
  onSelect: (chatId: string) => void;
  onLogout: () => void;
}

export const ChatSidebar = ({
  chats,
  activeId,
  instanceId,
  connection,
  newChatOpen,
  phone,
  creating,
  createError,
  inputRef,
  onPhoneChange,
  onCreate,
  onNewChat,
  onCloseNewChat,
  onSelect,
  onLogout,
}: ChatSidebarProps) => {
  return (
    <S.Sidebar className="chat-sidebar" aria-label="Список чатов">
      <S.Header>
        <Brand small />
        <S.Platform>Telegram</S.Platform>
      </S.Header>

      <S.Title>
        <h1>
          Чаты <span>{chats.length}</span>
        </h1>
        <IconButton
          type="button"
          $blue
          onClick={onNewChat}
          aria-label="Новый чат"
        >
          <Plus size={20} />
        </IconButton>
      </S.Title>

      {newChatOpen && (
        <S.NewChatForm onSubmit={onCreate}>
          <S.NewChatTitle>
            <b>Новый чат</b>
            {chats.length > 0 && (
              <IconButton
                type="button"
                $small
                onClick={onCloseNewChat}
                aria-label="Закрыть"
              >
                <X size={15} />
              </IconButton>
            )}
          </S.NewChatTitle>
          <span>Номер с кодом страны</span>
          <S.NewChatRow>
            <S.PhoneInput
              ref={inputRef}
              aria-label="Номер телефона"
              type="tel"
              value={phone}
              onChange={(event) => onPhoneChange(event.target.value)}
              placeholder="+7 999 123-45-67"
              autoComplete="off"
              disabled={creating}
              required
            />
            <S.CreateButton
              type="submit"
              aria-label="Создать чат"
              disabled={creating || !phone.trim()}
            >
              {creating ? (
                <LoaderCircle size={17} className="spin" />
              ) : (
                <ArrowRight size={18} />
              )}
            </S.CreateButton>
          </S.NewChatRow>
          {createError && <S.ErrorText role="alert">{createError}</S.ErrorText>}
        </S.NewChatForm>
      )}

      <S.ChatList aria-label="Диалоги">
        {chats.length === 0 ? (
          <S.EmptyList>
            <MessageCircle size={28} />
            <b>Чатов пока нет</b>
            <span>
              Добавьте собеседника
              <br />
              по номеру телефона
            </span>
          </S.EmptyList>
        ) : (
          chats.map((chat, index) => {
            const lastMessage = chat.messages[chat.messages.length - 1];

            return (
              <S.ChatItem
                type="button"
                key={chat.chatId}
                $active={chat.chatId === activeId}
                onClick={() => onSelect(chat.chatId)}
              >
                <ChatAvatar $color={index}>
                  {chat.name.startsWith("+") ? (
                    <MessageCircle size={19} />
                  ) : (
                    chat.name.replace("@", "").slice(0, 2).toUpperCase()
                  )}
                </ChatAvatar>
                <S.ChatItemContent>
                  <S.ChatItemTop>
                    <b>{chat.name}</b>
                    <small>
                      {lastMessage ? formatTime(lastMessage.timestamp) : ""}
                    </small>
                  </S.ChatItemTop>
                  <S.ChatItemBottom>
                    <span>{lastMessage?.text || "Начните переписку"}</span>
                    {chat.unread > 0 && <strong>{chat.unread}</strong>}
                  </S.ChatItemBottom>
                </S.ChatItemContent>
              </S.ChatItem>
            );
          })
        )}
      </S.ChatList>

      <S.Session>
        <S.ConnectionDot $state={connection.state} />
        <div>
          <b>{connectionLabels[connection.state]}</b>
          <span>Инстанс {instanceId}</span>
        </div>
        <IconButton type="button" onClick={onLogout} aria-label="Выйти">
          <LogOut size={18} />
        </IconButton>
      </S.Session>
    </S.Sidebar>
  );
};
