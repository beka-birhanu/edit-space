import Config from "@/lib/config.ts";
import useFetch from "@/hooks/util/use-fetch.ts";
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {useToast} from "@/hooks/util/use-toast.ts";

export function formatAuthHeader(username: string, password: string): string {
    const formatted = `${username}:${password}`;
    const encoded = btoa(formatted);
    return `${encoded}`;
}

function useAuth() {
    const loginUrl = `${Config.formattedBaseUrl()}/auth/login`;
    const registerUrl = `${Config.formattedBaseUrl()}/auth/register`;

    const [loading, setLoading] = useState<boolean>(false);
    const [isError, setIsError] = useState<boolean>(false);
    const [success, setSuccess] = useState<boolean>(false);
    const [error, setError] = useState<Error>();
    const [userId, setUserId] = useState<string | undefined>();

    const navigate = useNavigate();
    const { toast } = useToast();

    const { query: queryLogin, loading: loadingLogin, isError: isErrorLogin,
        success: successLogin, error: errorLogin } = useFetch<string>(
        loginUrl, false, (res) => res.id as string
    );
    const { query: queryReg, loading: loadingReg, isError: isErrorReg, success: successReg,
        error: errorReg } = useFetch<string>(
            registerUrl, false, (res) => res.id as string);

    const login = (username: string, password: string) => {
        return queryLogin({
            method: "POST",
            body: JSON.stringify({ username, password })
        }).then((res) => onSuccess(res, username, password));
    }

    const register = (username: string, password: string) => {
        return queryReg({
            method: "POST",
            body: JSON.stringify({ username, password })
        }).then((res) => onSuccess(res, username, password));
    }

    const onSuccess = (res: string | undefined, username: string, password: string) => {
        if (!!res) {
            setUserId(res);
            localStorage.setItem("userId", res);
            localStorage.setItem("auth_token", formatAuthHeader(username, password));
        }
    }

    useEffect(() => {
        if (success) {
            toast(
                {
                    title: "Success",
                    description: "Auth successful",
                }
            );
            navigate("/dashboard");
        } else if (isError) {
            toast({
                title: "Error",
                description: error?.message ?? "An error occurred",
                variant: "destructive"
            });
        }
    }, [success, isError, loading]);


    useEffect(() => {
        setSuccess(successLogin);
        setIsError(isErrorLogin);
        setLoading(loadingLogin);
        setError(errorLogin);
    }, [successLogin, isErrorLogin, loadingLogin, errorLogin]);

    useEffect(() => {
        setSuccess(successReg);
        setIsError(isErrorReg);
        setLoading(loadingReg);
        setError(errorReg);
    }, [successReg, isErrorReg, loadingReg]);

    return { login, register, loading, success, isError, userId, error };
}

export default useAuth;