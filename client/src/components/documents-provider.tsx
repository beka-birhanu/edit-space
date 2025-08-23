
import React, { createContext,useState, useCallback, useMemo } from 'react';
import { DocumentInfo } from '../lib/models/document';

export interface DocumentsContextValue {
    documents: DocumentInfo[];
    addDocument(document: DocumentInfo): void;
    removeDocument(documenId: string): void;
    updateTitle(documentId: string, title: string): void;
    setDocuments(documents: DocumentInfo[]): void;
}

const initialValue: DocumentsContextValue = {
    documents: [],
    addDocument: () => {},
    removeDocument: () => {},
    updateTitle: () => {},
    setDocuments: () => {}
}

export const DocumentsContext = createContext<DocumentsContextValue>(initialValue);

function DocumentsProvider(props: { children: React.ReactNode }) {
    const [documents, setDocuments] = useState<DocumentInfo[]>([]);

    const addDocument = useCallback((document: DocumentInfo) => {
        setDocuments((prev) => [...prev, document]);
    }, []);

    const removeDocument = useCallback((documentId: string) => {
        setDocuments((prev) => prev.filter((doc) => doc.id !== documentId));
    }, []);

    const updateTitle = useCallback((documentId: string, title: string) => {
        setDocuments((prev) => {
            return prev.map((doc) => {
                if (doc.id === documentId) {
                    return { ...doc, title };
                }
                return doc;
            });
        });
    }, []);

    const contextValue = useMemo(() => {
        return {
            documents,
            addDocument,
            removeDocument,
            updateTitle,
            setDocuments
        }
    }, [documents, addDocument, removeDocument, updateTitle]);

    return (
        <DocumentsContext.Provider value={contextValue}>
            {props.children}
        </DocumentsContext.Provider>
    )
}

export default DocumentsProvider;