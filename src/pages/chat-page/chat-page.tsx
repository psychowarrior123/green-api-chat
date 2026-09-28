import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { FormEvent } from "react";
import {
  ArrowLeft,
  CircleAlert,
  ChevronDown,
  LoaderCircle,
  MessageCircle,
  Plus,
  Send,
  ShieldCheck,
  WifiOff,
  X,
} from "lucide-react";
import { useChat } from "../../hooks/use-chat";
import type { Session } from "../../types/session";
import { AppButton } from "../../components/app-button";
import { ChatAvatar } from "../../components/chat-avatar";
import { ChatSidebar } from "../../components/chat-sidebar";
import { IconButton } from "../../components/icon-button";
import { MessageList } from "../../components/message-list";
import * as S from "./styles";

interface ChatPageProps {
  session: Session;
  onLogout: () => void;
}

export const ChatPage = ({ session, onLogout }: ChatPageProps) => {
  const chat = useChat(session.api);
  const [newChatOpen, setNewChatOpen] = useState(true);
  const [phone, setPhone] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [warningVisible, setWarningVisible] = useState(true);
  const [atBottom, setAtBottom] = useState(true);
  const atBottomRef = useRef(true);
  const listRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const active = chat.state.chats.find(
    (item) => item.chatId === chat.state.activeId,
  );
  const draft = active ? chat.drafts[active.chatId] || "" : "";
  const isSending = active ? chat.sending.has(active.chatId) : false;
  const lastMessage = active?.messages[active.messages.length - 1];
  const canSend =
    Boolean(draft.trim()) &&
    draft.length <= 4096 &&
    !isSending &&
    chat.connection.state !== "stopped";

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }

    atBottomRef.current = true;
    setAtBottom(true);
    composerRef.current?.focus();
  }, [active?.chatId]);

  useEffect(() => {
    if ((atBottomRef.current || lastMessage?.outgoing) && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [lastMessage?.id, lastMessage?.outgoing]);

  useLayoutEffect(() => {
    const composer = composerRef.current;
    if (!composer) return;
    composer.style.height = "auto";
    composer.style.height = `${Math.min(composer.scrollHeight, 144)}px`;
  }, [draft, active?.chatId]);

  const handleScroll = useCallback(() => {
    if (!listRef.current) return;
    const { scrollHeight, scrollTop, clientHeight } = listRef.current;
    const bottom = scrollHeight - scrollTop - clientHeight < 100;
    atBottomRef.current = bottom;
    setAtBottom(bottom);
  }, []);

  const createChat = async (event: FormEvent) => {
    event.preventDefault();

    if (creating) return;

    setCreating(true);
    setCreateError("");

    try {
      await chat.openChat(phone);
      setPhone("");
      setNewChatOpen(false);
    } catch (e) {
      if (!(e instanceof DOMException && e.name === "AbortError")) {
        setCreateError(
          e instanceof Error ? e.message : "Не удалось создать чат",
        );
      }
    } finally {
      setCreating(false);
    }
  };

  const sendMessage = (event?: FormEvent) => {
    event?.preventDefault();

    if (active && canSend) {
      void chat.send(active, draft);
    }
  };

  const scrollToBottom = () => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }

    atBottomRef.current = true;
    setAtBottom(true);
  };

  const showNewChat = () => {
    setNewChatOpen(true);
    setTimeout(() => phoneRef.current?.focus(), 0);
  };

  return (
    <S.PageWrapper $active={Boolean(active)}>
      <ChatSidebar
        chats={chat.state.chats}
        activeId={chat.state.activeId}
        instanceId={session.api.instanceId}
        connection={chat.connection}
        newChatOpen={newChatOpen}
        phone={phone}
        creating={creating}
        createError={createError}
        inputRef={phoneRef}
        onPhoneChange={setPhone}
        onCreate={createChat}
        onNewChat={showNewChat}
        onCloseNewChat={() => setNewChatOpen(false)}
        onSelect={chat.select}
        onLogout={onLogout}
      />

      <S.Conversation className="conversation" aria-label="Переписка">
        <S.ConversationHeader>
          {active ? (
            <>
              <S.MobileBack
                type="button"
                onClick={() => chat.select(null)}
                aria-label="Назад"
              >
                <ArrowLeft size={20} />
              </S.MobileBack>
              <ChatAvatar>
                <MessageCircle size={20} />
              </ChatAvatar>
              <S.ChatInfo>
                <h2>{active.name}</h2>
                <span>{active.phone ? `+${active.phone} · ` : ""}Telegram</span>
              </S.ChatInfo>
            </>
          ) : (
            <>
              <MessageCircle size={20} />
              <h2>Telegram</h2>
            </>
          )}
          <small>Текстовые сообщения</small>
        </S.ConversationHeader>

        <S.Banners>
          {chat.connection.state !== "online" && (
            <S.Banner role="status">
              <WifiOff size={17} />
              <span>{chat.connection.message}</span>
              {chat.connection.state === "stopped" && (
                <S.ReconnectButton type="button" onClick={onLogout}>
                  К подключению
                </S.ReconnectButton>
              )}
            </S.Banner>
          )}
          {warningVisible &&
            session.warnings.map((warning) => (
              <S.Banner key={warning}>
                <CircleAlert size={17} />
                <span>{warning}</span>
                <IconButton
                  type="button"
                  onClick={() => setWarningVisible(false)}
                  aria-label="Закрыть"
                >
                  <X size={15} />
                </IconButton>
              </S.Banner>
            ))}
          {chat.notice && (
            <S.Banner $error role="alert">
              <CircleAlert size={17} />
              <span>{chat.notice}</span>
              <IconButton
                type="button"
                onClick={chat.dismissNotice}
                aria-label="Закрыть"
              >
                <X size={15} />
              </IconButton>
            </S.Banner>
          )}
          {active && chat.state.chatErrors[active.chatId] && (
            <S.Banner $error role="alert">
              <CircleAlert size={17} />
              <span>{chat.state.chatErrors[active.chatId]}</span>
              <IconButton
                type="button"
                onClick={() => chat.dismissChatError(active.chatId)}
                aria-label="Закрыть"
              >
                <X size={15} />
              </IconButton>
            </S.Banner>
          )}
        </S.Banners>

        {active ? (
          <>
            <MessageList
              messages={active.messages}
              listRef={listRef}
              onScroll={handleScroll}
            />
            {!atBottom && (
              <S.ToBottomButton type="button" onClick={scrollToBottom}>
                <ChevronDown size={16} />К последним
              </S.ToBottomButton>
            )}
            <S.Composer onSubmit={sendMessage}>
              <S.ComposerRow>
                <textarea
                  ref={composerRef}
                  value={draft}
                  maxLength={4096}
                  rows={1}
                  placeholder="Напишите сообщение"
                  aria-label="Текст сообщения"
                  onChange={(event) => {
                    chat.setDraft(active.chatId, event.target.value);
                  }}
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" &&
                      !event.shiftKey &&
                      !event.nativeEvent.isComposing
                    ) {
                      event.preventDefault();
                      sendMessage();
                    }
                  }}
                />
                <S.SendButton
                  type="submit"
                  aria-label="Отправить сообщение"
                  disabled={!canSend}
                >
                  {isSending ? (
                    <LoaderCircle size={20} className="spin" />
                  ) : (
                    <Send size={20} />
                  )}
                </S.SendButton>
              </S.ComposerRow>
              <S.ComposerHint>
                <span>Enter — отправить, Shift+Enter — новая строка</span>
                <span>{draft.length} / 4096</span>
              </S.ComposerHint>
            </S.Composer>
          </>
        ) : (
          <S.EmptyChat>
            <S.EmptyChatIcon>
              <MessageCircle size={39} />
            </S.EmptyChatIcon>
            <h2>Выберите чат</h2>
            <p>
              Создайте новый диалог по номеру телефона
              <br />
              или выберите его в списке слева.
            </p>
            <AppButton type="button" onClick={showNewChat}>
              <Plus size={17} />
              Новый чат
            </AppButton>
            <span>
              <ShieldCheck size={14} />
              Данные живут только в этой вкладке
            </span>
          </S.EmptyChat>
        )}
      </S.Conversation>
    </S.PageWrapper>
  );
};
