import styled from "styled-components";

export const Button = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 11px 15px;
  color: #fff;
  background: var(--primary);
  border-radius: 5px;
  font-size: 14px;
  font-weight: 500;

  &:hover:not(:disabled) {
    background: #075bd4;
  }
`;
