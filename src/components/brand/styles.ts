import styled from "styled-components";

export const BrandContainer = styled.div<{ $small: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ $small }) => ($small ? "8px" : "10px")};
  color: var(--text);
  font-size: ${({ $small }) => ($small ? "15px" : "17px")};
  font-weight: 700;
  line-height: 1.1;
  white-space: nowrap;
`;

export const BrandIcon = styled.span<{ $small: boolean }>`
  display: grid;
  place-items: center;
  width: ${({ $small }) => ($small ? "32px" : "38px")};
  height: ${({ $small }) => ($small ? "32px" : "38px")};
  color: #fff;
  background: var(--primary);
  border-radius: 8px;
`;

export const BrandTitle = styled.span`
  span {
    font-weight: 400;
  }
`;

export const BrandDescription = styled.small`
  display: block;
  margin-top: 4px;
  color: var(--muted);
  font-size: 9px;
  font-weight: 500;
  letter-spacing: 1.3px;
`;
