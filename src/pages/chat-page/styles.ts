import styled from "styled-components";
import { IconButton } from "../../components/icon-button";

export const PageWrapper = styled.main<{ $active: boolean }>`
  display: grid;
  grid-template-columns: 310px minmax(0, 1fr);
  height: 100dvh;
  overflow: hidden;
  background: #fff;

  @media (max-width: 900px) {
    grid-template-columns: 280px minmax(0, 1fr);
  }

  @media (max-width: 700px) {
    display: block;

    .chat-sidebar {
      display: ${({ $active }) => ($active ? "none" : "flex")};
    }

    .conversation {
      display: ${({ $active }) => ($active ? "flex" : "none")};
      height: 100dvh;
    }
  }
`;

export const Conversation = styled.section`
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  background: #f3f5f8;
`;

export const ConversationHeader = styled.header`
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 72px;
  padding: 0 25px;
  color: #87909b;
  background: #fff;
  border-bottom: 1px solid var(--border);

  h2 {
    color: #3f454d;
    font-size: 15px;
    font-weight: 500;
  }

  > small {
    margin-left: auto;
    color: #a4a9b0;
    font-size: 11px;
  }

  @media (max-width: 700px) {
    min-height: 66px;
    padding: 0 12px;

    > small {
      display: none;
    }
  }
`;

export const ChatInfo = styled.div`
  span {
    display: block;
    margin-top: 3px;
    color: #9aa0a8;
    font-size: 11px;
  }
`;

export const MobileBack = styled(IconButton)`
  display: none;

  @media (max-width: 700px) {
    display: inline-flex;
  }
`;

export const Banners = styled.div`
  &:empty {
    display: none;
  }
`;

export const Banner = styled.div<{ $error?: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 20px;
  color: ${({ $error }) => ($error ? "#a15148" : "#79653f")};
  background: ${({ $error }) => ($error ? "#fff0ee" : "#fff8e5")};
  border-bottom: 1px solid ${({ $error }) => ($error ? "#efd2ce" : "#f0e5c5")};
  font-size: 11px;
  line-height: 1.5;

  > span {
    flex: 1;
    overflow-wrap: anywhere;
  }

  @media (max-width: 700px) {
    padding: 9px 13px;
  }
`;

export const ReconnectButton = styled.button`
  color: #6f5b32;
  background: transparent;
  text-decoration: underline;
  font-size: 11px;
`;

export const Composer = styled.form`
  padding: 12px 25px 13px;
  background: #fff;
  border-top: 1px solid var(--border);

  @media (max-width: 700px) {
    padding: 10px 12px max(10px, env(safe-area-inset-bottom));
  }
`;

export const ComposerRow = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 9px;

  textarea {
    width: 100%;
    min-height: 43px;
    max-height: 144px;
    padding: 11px 12px;
    resize: none;
    color: var(--text);
    background: #fff;
    border: 1px solid #d9dde2;
    border-radius: 5px;
    font-size: 13px;
    line-height: 1.45;

    &:focus {
      border-color: var(--primary);
    }
  }
`;

export const SendButton = styled.button`
  display: grid;
  place-items: center;
  width: 43px;
  height: 43px;
  flex-shrink: 0;
  color: #fff;
  background: var(--primary);
  border-radius: 5px;

  &:hover:not(:disabled) {
    background: #075bd4;
  }

  &:disabled {
    color: #89a3c4;
    background: #d9e4f2;
    opacity: 1;
  }
`;

export const ComposerHint = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding-right: 52px;
  margin-top: 6px;
  color: #a2a7ad;
  font-size: 10px;

  @media (max-width: 700px) {
    padding-right: 0;
    font-size: 9px;
  }
`;

export const EmptyChat = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  height: 100%;
  padding: 30px;
  text-align: center;

  h2 {
    color: #4b5d71;
    font-size: 23px;
    font-weight: 500;
  }

  p {
    margin: 10px 0 20px;
    color: #8b98a6;
    font-size: 13px;
    line-height: 1.65;
  }

  > span {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-top: 35px;
    color: #a1a9b2;
    font-size: 10px;
  }
`;

export const EmptyChatIcon = styled.div`
  display: grid;
  place-items: center;
  width: 84px;
  height: 84px;
  margin-bottom: 22px;
  color: #70a1e4;
  background: #e2edfc;
  border-radius: 25px;
`;

export const ToBottomButton = styled.button`
  position: absolute;
  bottom: 96px;
  left: 50%;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 12px;
  color: #6e89aa;
  background: #fff;
  border-radius: 15px;
  box-shadow: 0 3px 14px #33485b1a;
  font-size: 11px;
  transform: translateX(-50%);
`;
