import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import {
  ArrowRight,
  CircleAlert,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
} from "lucide-react";
import { AppInput } from "../../components/app-input";
import { Brand } from "../../components/brand";
import { GreenApi } from "../../api/green-api";
import type { Credentials } from "../../api/green-api";
import type { Session } from "../../types/session";
import * as S from "./styles";

interface LoginPageProps {
  onConnect: (session: Session) => void;
}

export const LoginPage = ({ onConnect }: LoginPageProps) => {
  const [credentials, setCredentials] = useState<Credentials>({
    apiUrl: "",
    idInstance: "",
    apiTokenInstance: "",
  });
  const [showToken, setShowToken] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const controller = useRef<AbortController | null>(null);

  useEffect(() => () => controller.current?.abort(), []);

  const changeCredentials = (name: keyof Credentials, value: string) => {
    setCredentials({ ...credentials, [name]: value });
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (loading) return;

    setLoading(true);
    setError("");
    controller.current = new AbortController();

    try {
      const api = new GreenApi(credentials);
      const warnings = await api.connect(controller.current.signal);
      if (!controller.current.signal.aborted) onConnect({ api, warnings });
    } catch (e) {
      if (!controller.current.signal.aborted) {
        setError(e instanceof Error ? e.message : "Не удалось подключиться");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <S.Page>
      <S.Header>
        <Brand />
        <a
          href="https://console.green-api.com"
          target="_blank"
          rel="noreferrer"
        >
          Кабинет GREEN-API <ArrowRight size={16} />
        </a>
      </S.Header>

      <S.Content>
        <S.About>
          <S.PageLabel>ТЕСТОВОЕ ЗАДАНИЕ</S.PageLabel>
          <S.Title>
            Telegram чат
            <br />
            <strong>через GREEN-API</strong>
          </S.Title>
          <S.AboutText>
            Небольшой интерфейс для отправки и получения текстовых сообщений.
          </S.AboutText>
          <S.Steps>
            <S.Step>
              <S.StepNumber>1</S.StepNumber>
              <span>Введите данные Telegram-инстанса</span>
            </S.Step>
            <S.Step>
              <S.StepNumber>2</S.StepNumber>
              <span>Добавьте номер получателя</span>
            </S.Step>
            <S.Step>
              <S.StepNumber>3</S.StepNumber>
              <span>Общайтесь в одном окне</span>
            </S.Step>
          </S.Steps>
        </S.About>

        <S.Card>
          <S.CardIcon>
            <KeyRound size={21} />
          </S.CardIcon>
          <S.CardTitle>Подключение</S.CardTitle>
          <S.Muted>Данные берутся из личного кабинета GREEN-API.</S.Muted>

          <S.Form onSubmit={submit}>
            <AppInput
              id="api-url"
              label="API URL"
              type="url"
              placeholder="https://4100.api.green-api.com"
              autoComplete="off"
              spellCheck={false}
              value={credentials.apiUrl}
              onChange={(event) =>
                changeCredentials("apiUrl", event.target.value)
              }
              help="Поле apiUrl в настройках инстанса"
              required
              disabled={loading}
            />
            <AppInput
              id="instance-id"
              label="ID инстанса"
              inputMode="numeric"
              placeholder="4100000000"
              autoComplete="off"
              value={credentials.idInstance}
              onChange={(event) =>
                changeCredentials("idInstance", event.target.value)
              }
              required
              disabled={loading}
            />

            <S.Field>
              <label htmlFor="api-token">Токен инстанса</label>
              <S.PasswordWrapper>
                <S.PasswordInput
                  id="api-token"
                  type={showToken ? "text" : "password"}
                  placeholder="apiTokenInstance"
                  autoComplete="off"
                  spellCheck={false}
                  value={credentials.apiTokenInstance}
                  onChange={(event) =>
                    changeCredentials("apiTokenInstance", event.target.value)
                  }
                  required
                  disabled={loading}
                />
                <S.TokenButton
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  aria-label={showToken ? "Скрыть токен" : "Показать токен"}
                >
                  {showToken ? <EyeOff size={18} /> : <Eye size={18} />}
                </S.TokenButton>
              </S.PasswordWrapper>
            </S.Field>

            {error && (
              <S.ErrorBox role="alert">
                <CircleAlert size={17} />
                <span>{error}</span>
              </S.ErrorBox>
            )}

            <S.ConnectButton type="submit" disabled={loading}>
              {loading ? (
                <>
                  <LoaderCircle className="spin" size={18} />
                  Подключаемся
                </>
              ) : (
                <>
                  Подключиться
                  <ArrowRight size={18} />
                </>
              )}
            </S.ConnectButton>
          </S.Form>

          <S.Help>
            <b>Перед подключением</b>
            <p>
              Авторизуйте инстанс по QR-коду, включите incomingWebhook и
              оставьте webhookUrl пустым.
            </p>
          </S.Help>
        </S.Card>
      </S.Content>

      <S.Footer>
        <span>React + TypeScript</span>
        <span>Только текстовые сообщения</span>
      </S.Footer>
    </S.Page>
  );
};
