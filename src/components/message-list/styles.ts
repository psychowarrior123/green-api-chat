import styled from "styled-components";
import type { Delivery } from "../../chat/chat-model";

export const List = styled.div`
  flex: 1;
  padding: 18px 34px 25px;
  overflow-y: auto;

  @media (max-width: 900px) {
    padding-left: 22px;
    padding-right: 22px;
  }

  @media (max-width: 700px) {
    padding: 15px 13px 20px;
  }
`;

export const EmptyList = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  height: 100%;
  min-height: 220px;
  color: #8898aa;
  text-align: center;

  > span {
    display: grid;
    place-items: center;
    width: 56px;
    height: 56px;
    margin-bottom: 14px;
    color: #70a1e4;
    background: #e2edfc;
    border-radius: 18px;
  }

  b {
    color: #5f7187;
    font-size: 18px;
    font-weight: 500;
  }

  p {
    margin-top: 7px;
    font-size: 12px;
    line-height: 1.6;
  }
`;

export const DateLabel = styled.div`
  width: max-content;
  padding: 4px 10px;
  margin: 4px auto 18px;
  color: #929ba6;
  background: #e3e7ec;
  border-radius: 10px;
  font-size: 10px;
`;

export const MessageRow = styled.div<{ $outgoing: boolean }>`
  display: flex;
  justify-content: ${({ $outgoing }) => ($outgoing ? "flex-end" : "flex-start")};
  margin: 7px 0;
`;

export const MessageBubble = styled.div<{
  $outgoing: boolean;
  $error: boolean;
}>`
  max-width: min(620px, 78%);
  padding: 10px 13px 6px;
  background: ${({ $outgoing }) => ($outgoing ? "#dceafb" : "#fff")};
  border: ${({ $error }) => ($error ? "1px solid #dbab9e" : "none")};
  border-radius: ${({ $outgoing }) =>
    $outgoing ? "10px 10px 2px 10px" : "10px 10px 10px 2px"};
  box-shadow: 0 1px 2px #3649600d;
  overflow-wrap: anywhere;

  p {
    color: #3e4a5a;
    font-size: 14px;
    line-height: 1.55;
    white-space: pre-wrap;
  }

  @media (max-width: 700px) {
    max-width: 90%;
  }
`;

export const MessageMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 5px;
  min-height: 17px;
  margin-top: 3px;
  color: #91a0b1;
  font-size: 10px;
`;

const deliveryColors: Record<Delivery, string> = {
  sending: "#83a5ca",
  queued: "#83a5ca",
  delivered: "#83a5ca",
  read: "#2d82e5",
  failed: "#bc6558",
  unknown: "#bc6558",
};

export const DeliveryStatus = styled.span<{ $status: Delivery }>`
  display: inline-flex;
  color: ${({ $status }) => deliveryColors[$status]};
`;

export const ErrorText = styled.div`
  padding-top: 6px;
  margin-top: 5px;
  color: #a25249;
  border-top: 1px solid #c7d8ec;
  font-size: 11px;
  line-height: 1.45;
`;
