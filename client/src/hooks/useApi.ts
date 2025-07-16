import { useState, useCallback } from "react";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import toast from "react-hot-toast";

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (config: AxiosRequestConfig) => Promise<T | null>;
  reset: () => void;
}

export const useApi = <T = any>(): UseApiReturn<T> => {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (config: AxiosRequestConfig): Promise<T | null> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response: AxiosResponse<T> = await axios(config);
        setState({
          data: response.data,
          loading: false,
          error: null,
        });
        return response.data;
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message || error.message || "An error occurred";
        setState({
          data: null,
          loading: false,
          error: errorMessage,
        });
        toast.error(errorMessage);
        return null;
      }
    },
    []
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
    });
  }, []);

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    execute,
    reset,
  };
};
