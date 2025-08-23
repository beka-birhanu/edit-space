import Config from "@/lib/config.ts";
import User from "@/lib/models/user.ts"
import useFetch from "@/hooks/util/use-fetch.ts";

function useGetUser(id: string) {
    const url = `${Config.formattedBaseUrl()}/users/${id}`;
    const transformResponse = User.fromJson;
    const { loading, success, isError, error, data } = useFetch<User>(url, true, transformResponse);

    return { loading, success, user: data, isError, error }
}

export default useGetUser;