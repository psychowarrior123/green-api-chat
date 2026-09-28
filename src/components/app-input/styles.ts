import styled from "styled-components";

export const InputContainer = styled.div`
  margin-top: 18px;

  &:first-child {
    margin-top: 0;
  }
`;

export const InputLabel = styled.label`
  display: block;
  margin-bottom: 7px;
  color: #4e535b;
  font-size: 13px;
  font-weight: 500;
`;

export const Input = styled.input`
  width: 100%;
  min-width: 0;
  padding: 11px 12px;
  color: var(--text);
  background: #fff;
  border: 1px solid #d9dde2;
  border-radius: 5px;
  font-size: 14px;
`;

export const InputHelp = styled.span`
  display: block;
  margin-top: 5px;
  color: #9b9fa6;
  font-size: 11px;
`;
