import styled from "styled-components";

const colors = ["#4b88dc", "#7c80b2", "#57a084", "#aa855d"];
const backgrounds = ["#dceaff", "#e7e7fb", "#dff1e9", "#f3e7d7"];

export const ChatAvatar = styled.span<{ $color?: number }>`
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  color: ${({ $color = 0 }) => colors[$color % colors.length]};
  background: ${({ $color = 0 }) => backgrounds[$color % backgrounds.length]};
  border-radius: 50%;
  font-size: 13px;
  font-weight: 700;
`;
