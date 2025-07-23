/**
 * KORSVAGEN WEB APPLICATION - LOGIN FORM COMPONENT
 *
 * Componente form di login per amministratori con
 * validazione, design system e UX ottimizzata.
 *
 * Features:
 * - Form validato con react-hook-form e yup
 * - UI moderna e responsive
 * - Loading states e feedback visivo
 * - Integrazione AuthContext
 * - Accessibilità completa
 *
 * @author KORSVAGEN S.R.L.
 * @version 1.0.0
 */

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import styled from "styled-components";
import { Eye, EyeOff, Lock, User, AlertCircle, LogIn } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

/**
 * SCHEMA DI VALIDAZIONE
 */

const loginSchema = yup.object({
  username: yup
    .string()
    .required("Username è obbligatorio")
    .min(3, "Username deve essere almeno 3 caratteri")
    .max(50, "Username troppo lungo"),
  password: yup
    .string()
    .required("Password è obbligatoria")
    .min(6, "Password deve essere almeno 6 caratteri"),
  rememberMe: yup.boolean().default(false),
});

type LoginFormData = yup.InferType<typeof loginSchema>;

/**
 * STYLED COMPONENTS
 */

const FormContainer = styled.div`
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
  background: #2a2a2a;
  border-radius: 12px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
  border: 1px solid #333;

  @media (max-width: 768px) {
    margin: 1rem;
    padding: 1.5rem;
  }
`;

const FormHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;

  h1 {
    font-size: 1.875rem;
    font-weight: 700;
    color: #ffffff;
    margin: 0 0 0.5rem;
    font-family: "Montserrat", sans-serif;
  }

  p {
    color: #94a3b8;
    font-size: 0.875rem;
    margin: 0;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const InputGroup = styled.div<{ hasError?: boolean }>`
  position: relative;

  label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    color: #ffffff;
    margin-bottom: 0.5rem;
  }
`;

const InputWrapper = styled.div<{ hasError?: boolean }>`
  position: relative;
  display: flex;
  align-items: center;

  input {
    width: 100%;
    padding: 0.75rem 2.75rem 0.75rem 2.75rem;
    border: 2px solid ${(props) => (props.hasError ? "#ef4444" : "#404040")};
    border-radius: 8px;
    font-size: 0.875rem;
    background: #1a1a1a;
    color: #ffffff;
    transition: all 0.2s ease;

    &:focus {
      outline: none;
      border-color: ${(props) => (props.hasError ? "#ef4444" : "#3b82f6")};
      box-shadow: 0 0 0 3px
        ${(props) =>
          props.hasError
            ? "rgba(239, 68, 68, 0.1)"
            : "rgba(59, 130, 246, 0.1)"};
    }

    &::placeholder {
      color: #64748b;
    }
  }
`;

const InputIcon = styled.div<{ position: "left" | "right" }>`
  position: absolute;
  ${(props) => props.position}: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
  z-index: 1;

  svg {
    width: 18px;
    height: 18px;
  }
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: color 0.2s ease;

  &:hover {
    color: var(--text-primary);
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #ef4444;
  font-size: 0.75rem;
  margin-top: 0.25rem;

  svg {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;

  input[type="checkbox"] {
    width: 16px;
    height: 16px;
    accent-color: #3b82f6;
  }

  label {
    font-size: 0.875rem;
    color: #94a3b8;
    cursor: pointer;
    margin: 0;
  }
`;

const SubmitButton = styled.button<{ loading?: boolean }>`
  width: 100%;
  padding: 0.875rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: ${(props) => (props.loading ? "not-allowed" : "pointer")};
  opacity: ${(props) => (props.loading ? 0.7 : 1)};
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    background: ${(props) => (props.loading ? "#3b82f6" : "#2563eb")};
    transform: ${(props) => (props.loading ? "none" : "translateY(-1px)")};
  }

  &:active {
    transform: ${(props) => (props.loading ? "none" : "translateY(0)")};
  }

  svg {
    width: 18px;
    height: 18px;

    &.spin {
      animation: spin 1s linear infinite;
    }
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const GeneralError = styled.div`
  padding: 1rem;
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid #ef4444;
  border-radius: 8px;
  color: #fca5a5;
  font-size: 0.875rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  animation: shake 0.5s ease-in-out;

  svg {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    color: #ef4444;
  }

  @keyframes shake {
    0%,
    100% {
      transform: translateX(0);
    }
    25% {
      transform: translateX(-5px);
    }
    75% {
      transform: translateX(5px);
    }
  }
`;

/**
 * COMPONENTE PRINCIPALE
 */

export const LoginForm: React.FC = () => {
  const { login, loading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [generalError, setGeneralError] = useState<string>("");

  // Setup react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
  });

  // Redirect se già autenticato
  useEffect(() => {
    if (user) {
      const from = (location.state as any)?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  // Submit handler
  const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
    try {
      setGeneralError("");

      const success = await login({
        username: data.username,
        password: data.password,
        rememberMe: data.rememberMe,
      });

      if (success) {
        const from = (location.state as any)?.from?.pathname || "/dashboard";
        navigate(from, { replace: true });
      } else {
        setGeneralError("Credenziali non valide. Riprova.");
      }
    } catch (error: any) {
      console.error("Errore login:", error);
      setGeneralError(
        error.response?.data?.error ||
          error.message ||
          "Errore di connessione. Riprova."
      );
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <FormContainer>
      <FormHeader>
        <h1>Accesso Amministratori</h1>
        <p>Inserisci le tue credenziali per accedere</p>
      </FormHeader>

      {generalError && (
        <GeneralError>
          <AlertCircle />
          {generalError}
        </GeneralError>
      )}

      <Form onSubmit={handleSubmit(onSubmit)}>
        <InputGroup hasError={!!errors.username}>
          <label htmlFor="username">Username</label>
          <InputWrapper hasError={!!errors.username}>
            <InputIcon position="left">
              <User />
            </InputIcon>
            <input
              id="username"
              type="text"
              placeholder="Inserisci username"
              autoComplete="username"
              {...register("username")}
            />
          </InputWrapper>
          {errors.username && (
            <ErrorMessage>
              <AlertCircle />
              {errors.username.message}
            </ErrorMessage>
          )}
        </InputGroup>

        <InputGroup hasError={!!errors.password}>
          <label htmlFor="password">Password</label>
          <InputWrapper hasError={!!errors.password}>
            <InputIcon position="left">
              <Lock />
            </InputIcon>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Inserisci password"
              autoComplete="current-password"
              {...register("password")}
            />
            <PasswordToggle
              type="button"
              onClick={togglePasswordVisibility}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </PasswordToggle>
          </InputWrapper>
          {errors.password && (
            <ErrorMessage>
              <AlertCircle />
              {errors.password.message}
            </ErrorMessage>
          )}
        </InputGroup>

        <CheckboxGroup>
          <input id="rememberMe" type="checkbox" {...register("rememberMe")} />
          <label htmlFor="rememberMe">Ricordami</label>
        </CheckboxGroup>

        <SubmitButton type="submit" loading={loading} disabled={loading}>
          {loading ? (
            <>
              <LogIn className="spin" />
              Accesso in corso...
            </>
          ) : (
            <>
              <LogIn />
              Accedi
            </>
          )}
        </SubmitButton>
      </Form>
    </FormContainer>
  );
};

export default LoginForm;
