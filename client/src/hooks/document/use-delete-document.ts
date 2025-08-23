import useFetch from "@/hooks/util/use-fetch.ts";
import Config from "@/lib/config.ts";
import {useContext, useEffect} from "react";
import {useToast} from "@/hooks/util/use-toast.ts";
import {DocumentsContext} from "@/components/documents-provider.tsx";

function useDeleteDocument(id: string) {
    const url = `${Config.formattedBaseUrl()}/documents/${id}`;
    const { removeDocument } = useContext(DocumentsContext)
    const { query, loading, success, isError, error } = useFetch(url, false);
    const { toast } = useToast();

    const deleteDocument = () => {
        return query({
            method: "DELETE"
        });
    }

    useEffect(() => {
        if (isError) {
            toast({ title: "Error", description: error?.message, variant: "destructive" });
        }
        if (success) {
            removeDocument(id);
            toast({ title: "Success", description: "Document deleted successfully"});
        }
    }, [isError, success]);

    return { loading, deleteDocument, success, isError, error };
}

export default useDeleteDocument;