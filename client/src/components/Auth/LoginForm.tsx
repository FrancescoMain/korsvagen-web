import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import styled from "styled-components";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

interface LoginFormData {
  username: string;
  password: string;
  rememberMe: boolean;
}

const loginSchema = yup.object({
  username: yup.string().required("Username is required"),
  password: yup.string().required("Password is required"),
  rememberMe: yup.boolean().default(false),
});

const FormContainer = styled.div`
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
  background-color: var(--bg-primary);
  border-radius: 0.75rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
`;

const FormHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
`;

const Subtitle = styled.p`
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Checkbox = styled.input`
  width: 1rem;
  height: 1rem;
  accent-color: var(--primary);
  cursor: pointer;
`;

const CheckboxLabel = styled.label`
  font-size: 0.875rem;
  color: var(--text-secondary);
  cursor: pointer;
`;

const ErrorMessage = styled.div`
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  margin-bottom: 1rem;
`;

export const LoginForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [generalError, setGeneralError] = useState<string>("");
  const { login, loading } = useAuth();

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

  const onSubmit = async (data: LoginFormData) => {
    setGeneralError("");
    try {
      const success = await login(data);
      if (!success) {
        setGeneralError("Invalid username or password");
      }
    } catch (error) {
      setGeneralError("An unexpected error occurred. Please try again.");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <FormContainer>
      <FormHeader>
        <Title>Welcome Back</Title>
        <Subtitle>Sign in to your KORSVAGEN dashboard</Subtitle>
      </FormHeader>

      {generalError && <ErrorMessage>{generalError}</ErrorMessage>}

      <Form onSubmit={handleSubmit(onSubmit)}>
        <Input
          label="Username"
          type="text"
          placeholder="Enter your username"
          error={errors.username?.message}
          {...register("username")}
        />

        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          placeholder="Enter your password"
          error={errors.password?.message}
          rightIcon={
            <button
              type="button"
              onClick={togglePasswordVisibility}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                color: "#6b7280",
              }}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
          {...register("password")}
        />

        <CheckboxContainer>
          <Checkbox
            type="checkbox"
            id="rememberMe"
            {...register("rememberMe")}
          />
          <CheckboxLabel htmlFor="rememberMe">Remember me</CheckboxLabel>
        </CheckboxContainer>

        <Button
          type="submit"
          size="lg"
          isLoading={loading}
          leftIcon={<LogIn size={18} />}
          fullWidth
        >
          Sign In
        </Button>
      </Form>
    </FormContainer>
  );
};
