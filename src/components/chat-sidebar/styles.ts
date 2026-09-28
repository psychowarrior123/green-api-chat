import styled from "styled-components";
import type { Connection } from "../../chat/polling";
import { AppButton } from "../app-button";

export const Sidebar = styled.aside`
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: #fff;
  border-right: 1px solid var(--border);

  @media (max-width: 700px) {
    height: 100dvh;
    border-right: 0;
  }
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 72px;
  padding: 0 19px;
  border-bottom: 1px solid var(--border);
`;

export const Platform = styled.span`
  padding: 5px 7px;
  color: var(--primary);
  background: var(--primary-light);
  border-radius: 4px;
  font-size: 10px;
`;

export const Title = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 18px 13px;

  h1 {
    font-size: 19px;
    font-weight: 500;
  }

  h1 span {
    display: inline-grid;
    place-items: center;
    min-width: 20px;
    height: 20px;
    padding: 0 5px;
    margin-left: 5px;
    color: #87909c;
    background: #f0f2f4;
    border-radius: 4px;
    font-size: 11px;
  }
`;

export const NewChatForm = styled.form`
  padding: 13px;
  margin: 0 13px 12px;
  background: #f7f9fc;
  border: 1px solid #e3e9f2;
  border-radius: 6px;

  > span {
    display: block;
    color: #9399a2;
    font-size: 11px;
  }
`;

export const NewChatTitle = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 5px;
  color: #4b5159;
  font-size: 13px;
`;

export const NewChatRow = styled.div`
  display: flex;
  gap: 6px;
  margin-top: 10px;
`;

export const PhoneInput = styled.input`
  width: 100%;
  min-width: 0;
  padding: 9px;
  color: var(--text);
  background: #fff;
  border: 1px solid #d9dde2;
  border-radius: 5px;
  font-size: 12px;
`;

export const CreateButton = styled(AppButton)`
  width: 38px;
  padding: 8px;
  flex-shrink: 0;
`;

export const ErrorText = styled.p`
  margin-top: 8px;
  color: var(--danger);
  font-size: 11px;
  line-height: 1.45;
`;

export const ChatList = styled.nav`
  flex: 1;
  padding: 2px 8px 10px;
  overflow-y: auto;
`;

export const EmptyList = styled.div`
  padding: 48px 12px;
  color: #a3a8af;
  text-align: center;
  font-size: 12px;
  line-height: 1.6;

  svg {
    color: #bec6cf;
  }

  b,
  span {
    display: block;
  }

  b {
    margin-top: 9px;
    color: #777e87;
    font-weight: 500;
  }
`;

export const ChatItem = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 11px 10px;
  color: var(--text);
  text-align: left;
  background: ${({ $active }) => ($active ? "var(--primary-light)" : "transparent")};
  border-radius: 6px;

  &:hover {
    background: #f6f8fb;
  }
`;

export const ChatItemContent = styled.span`
  min-width: 0;
  flex: 1;
`;

export const ChatItemTop = styled.span`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;

  b {
    overflow: hidden;
    font-size: 13px;
    font-weight: 500;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  small {
    color: #989ea6;
    font-size: 10px;
  }
`;

export const ChatItemBottom = styled.span`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  margin-top: 5px;
  color: #9298a1;
  font-size: 11px;

  > span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  strong {
    display: grid;
    place-items: center;
    min-width: 18px;
    height: 18px;
    padding: 0 4px;
    color: #fff;
    background: var(--primary);
    border-radius: 9px;
    font-size: 10px;
  }
`;

export const Session = styled.div`
  display: flex;
  align-items: center;
  gap: 9px;
  min-height: 70px;
  padding: 14px 17px;
  border-top: 1px solid var(--border);

  > div {
    min-width: 0;
    flex: 1;
  }

  b,
  span {
    display: block;
  }

  b {
    font-size: 11px;
    font-weight: 500;
  }

  div span {
    margin-top: 4px;
    overflow: hidden;
    color: #999fa7;
    font-size: 10px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const connectionColors = {
  online: "#3cab7d",
  reconnecting: "#d8a342",
  stopped: "#d2645d",
};

export const ConnectionDot = styled.span<{ $state: Connection["state"] }>`
  width: 8px;
  height: 8px;
  flex-shrink: 0;
  background: ${({ $state }) => connectionColors[$state]};
  border-radius: 50%;
`;
