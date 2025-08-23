import useFetch from "@/hooks/util/use-fetch.ts";
import { DocumentInfo } from "@/lib/models/document.ts";
import Config from "@/lib/config.ts";
import {useContext, useEffect} from "react";
import {useToast} from "@/hooks/util/use-toast.ts";
import {useNavigate} from "react-router-dom";
import {DocumentsContext} from "@/components/documents-provider.tsx";

function useGetDocuments() {
    const { documents, setDocuments } = useContext(DocumentsContext);
    const url = `${Config.formattedBaseUrl()}/documents`;
    const transformResponse = (res: any) => {
        if (!res) return [];
        return res.map((doc: any) => DocumentInfo.fromJson(doc))
    };
    const { query, loading, success, isError, error, data } = useFetch<DocumentInfo[]>(url, false, transformResponse);
    const navigate = useNavigate();
    const { toast } = useToast();

    useEffect(() => {
        if (isError) {
            toast({ title: "Error", description: error?.message, variant: "destructive" });
            if ((error as any)?.status_code === 401) {
                navigate("/auth");
            }
        }
    }, [isError]);

    useEffect(() => {
        if (success) {
            setDocuments(data!);
        }
    }, [success]);

    useEffect(() => {
        if (documents.length === 0)
            query();
    }, [])

    return { loading, success, documents, isError, error };
}

export default useGetDocuments;