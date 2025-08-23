import Config from "@/lib/config.ts";
import useFetch from "@/hooks/util/use-fetch.ts";
import {useEffect} from "react";
import {useNavigate} from "react-router-dom";

function useAuthRedirect() {
    const url = `${Config.formattedBaseUrl()}/health/auth`
    const { loading, isError, success } = useFetch<string>(url, true);
    const navigate = useNavigate();

    useEffect(() => {
        if (success) {
            navigate("/dashboard")
        } else if (isError) {
            navigate("/auth")
        }
    }, [loading]);

    return { loading, isError, success };
}

export default useAuthRedirect;