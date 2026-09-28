import styled from "styled-components";

export const IconButton = styled.button<{ $blue?: boolean; $small?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: ${({ $small }) => ($small ? "24px" : "34px")};
  height: ${({ $small }) => ($small ? "24px" : "34px")};
  color: ${({ $blue }) => ($blue ? "var(--primary)" : "#8b929c")};
  background: ${({ $blue }) => ($blue ? "var(--primary-light)" : "transparent")};
  border-radius: 5px;

  &:hover {
    color: var(--primary);
    background: #f0f4fa;
  }
`;
