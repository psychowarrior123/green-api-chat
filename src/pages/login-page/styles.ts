import styled from "styled-components";
import { AppButton } from "../../components/app-button";
import { IconButton } from "../../components/icon-button";

export const Page = styled.main`
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  max-width: 1280px;
  margin: auto;
  padding: 32px 50px 20px;
  background: #f5f6f8;

  @media (max-width: 900px) {
    padding: 27px 30px 18px;
  }

  @media (max-width: 700px) {
    padding: 22px 18px 17px;
  }
`;

export const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;

  a {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #646a73;
    font-size: 13px;

    @media (max-width: 700px) {
      font-size: 11px;
    }
  }
`;

export const Content = styled.section`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 410px;
  align-items: center;
  gap: 100px;
  width: 100%;
  max-width: 990px;
  margin: auto;
  padding: 60px 0;

  @media (max-width: 900px) {
    gap: 45px;
    grid-template-columns: minmax(0, 1fr) 380px;
  }

  @media (max-width: 700px) {
    display: flex;
    flex-direction: column;
    gap: 28px;
    padding: 45px 0 35px;
  }
`;

export const About = styled.div`
  max-width: 480px;

  @media (max-width: 700px) {
    text-align: center;
  }
`;

export const PageLabel = styled.span`
  display: inline-block;
  padding: 6px 9px;
  color: var(--primary);
  background: var(--primary-light);
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1px;
`;

export const Title = styled.h1`
  margin: 18px 0;
  color: var(--text);
  font-size: clamp(34px, 4vw, 49px);
  line-height: 1.2;
  letter-spacing: -1.5px;
  font-weight: 500;

  strong {
    color: var(--primary);
    font-weight: 700;
  }

  @media (max-width: 700px) {
    margin: 14px 0 10px;
    font-size: 34px;
  }
`;

export const AboutText = styled.p`
  max-width: 350px;
  color: #747a83;
  font-size: 16px;
  line-height: 1.7;

  @media (max-width: 700px) {
    margin: auto;
    font-size: 14px;
  }
`;

export const Steps = styled.ul`
  display: grid;
  gap: 17px;
  padding: 0;
  margin: 34px 0 0;
  list-style: none;

  @media (max-width: 700px) {
    display: none;
  }
`;

export const Step = styled.li`
  display: flex;
  align-items: center;
  gap: 12px;
  color: #4a4e54;
  font-size: 14px;
`;

export const StepNumber = styled.b`
  display: grid;
  place-items: center;
  width: 27px;
  height: 27px;
  color: var(--primary);
  border: 1px solid #c9dcfb;
  border-radius: 50%;
  font-size: 12px;
`;

export const Card = styled.div`
  padding: 30px 32px;
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 8px;
  box-shadow: 0 12px 35px #2d3b4d0d;

  @media (max-width: 700px) {
    width: 100%;
    max-width: 430px;
    padding: 25px;
  }
`;

export const CardIcon = styled.div`
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  margin-bottom: 18px;
  color: var(--primary);
  background: var(--primary-light);
  border-radius: 7px;
`;

export const CardTitle = styled.h2`
  color: var(--text);
  font-size: 23px;
  font-weight: 500;
`;

export const Muted = styled.p`
  margin-top: 8px;
  color: var(--muted);
  font-size: 13px;
  line-height: 1.55;
`;

export const Form = styled.form`
  margin-top: 23px;
`;

export const Field = styled.div`
  margin-top: 18px;

  label {
    display: block;
    margin-bottom: 7px;
    color: #4e535b;
    font-size: 13px;
    font-weight: 500;
  }
`;

export const PasswordWrapper = styled.div`
  position: relative;
`;

export const PasswordInput = styled.input`
  width: 100%;
  padding: 11px 42px 11px 12px;
  color: var(--text);
  background: #fff;
  border: 1px solid #d9dde2;
  border-radius: 5px;
  font-size: 14px;
`;

export const TokenButton = styled(IconButton)`
  position: absolute;
  top: 3px;
  right: 3px;
`;

export const ErrorBox = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px;
  margin-top: 16px;
  color: var(--danger);
  background: #fff2f0;
  border: 1px solid #f1d5d1;
  border-radius: 5px;
  font-size: 12px;
  line-height: 1.5;
`;

export const ConnectButton = styled(AppButton)`
  width: 100%;
  min-height: 43px;
  margin-top: 23px;
  justify-content: space-between;
`;

export const Help = styled.div`
  padding-top: 18px;
  margin-top: 21px;
  color: var(--muted);
  border-top: 1px solid var(--border);
  font-size: 12px;
  line-height: 1.55;

  b {
    color: #535860;
    font-weight: 500;
  }

  p {
    margin-top: 5px;
  }
`;

export const Footer = styled.footer`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: #a0a4aa;
  font-size: 11px;

  @media (max-width: 700px) {
    max-width: 430px;
    width: 100%;
    margin: auto;
    font-size: 10px;
  }
`;
