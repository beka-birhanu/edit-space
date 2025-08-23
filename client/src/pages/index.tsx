import Loading from "@/components/ui/loading.tsx";
import useAuthRedirect from "@/hooks/auth/use-auth-redirect.ts";

function IndexPage() {
    const {} = useAuthRedirect();

    return (
        <div className="w-full h-full bg-white grid place-items-center flex flex-col max-w-default mx-auto rounded-2xl border ">
            <Loading />
        </div>
    )
}

export default IndexPage;