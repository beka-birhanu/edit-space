
import useFetch from "@/hooks/util/use-fetch.ts";
import { DocumentInfo } from "@/lib/models/document.ts";
import Config from "@/lib/config.ts";
import {useContext, useEffect} from "react";
import {useToast} from "@/hooks/util/use-toast.ts";
import {useNavigate} from "react-router-dom";
import {DocumentsContext} from "@/components/documents-provider.tsx";

function useCreateDocument() {
    const url = `${Config.formattedBaseUrl()}/documents`;
    const { addDocument } = useContext(DocumentsContext);
    const transformResponse = (res: any) => {
        return DocumentInfo.fromJson(res);
    };
    const { query, loading, success, isError, error, data } = useFetch<DocumentInfo>(url, false, transformResponse);
    const navigate = useNavigate();
    const { toast } = useToast();

    const create = (title: string) => {
        return query({
            method: "POST",
            body: JSON.stringify({ title })
        });
    }

    useEffect(() => {
        if (isError) {
            toast({ title: "Error", description: error?.message, variant: "destructive" });
            if ((error as any)?.status_code === 401) {
                navigate("/auth");
            }
        }

        if (success) {
            addDocument(data!)
            navigate(`/editor?d=${data!.id}`);
        }
    }, [isError, success]);

    return { create , loading, success, document: data };
}

export default useCreateDocument;