import { MessageCircle } from "lucide-react";
import * as S from "./styles";

interface BrandProps {
  small?: boolean;
}

export const Brand = ({ small = false }: BrandProps) => (
  <S.BrandContainer $small={small}>
    <S.BrandIcon $small={small}>
      <MessageCircle size={small ? 18 : 21} />
    </S.BrandIcon>
    <S.BrandTitle>
      GREEN<span>-API</span>
      <S.BrandDescription>TELEGRAM CHAT</S.BrandDescription>
    </S.BrandTitle>
  </S.BrandContainer>
);
