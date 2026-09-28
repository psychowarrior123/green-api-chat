import type { InputHTMLAttributes } from "react";
import * as S from "./styles";

interface AppInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  help?: string;
}

export const AppInput = ({ label, help, id, ...props }: AppInputProps) => (
  <S.InputContainer>
    <S.InputLabel htmlFor={id}>{label}</S.InputLabel>
    <S.Input id={id} {...props} />
    {help && <S.InputHelp>{help}</S.InputHelp>}
  </S.InputContainer>
);
