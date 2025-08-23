import AuthPage from "./pages/auth"
import EditorPage from "@/pages/editor.tsx";
import { Toaster } from "@/components/ui/toaster.tsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "@/pages/dashboard.tsx";
import IndexPage from "@/pages";
import DocumentsProvider from "@/components/documents-provider.tsx";


function App() {

  return (
    <>
    <div className="bg-gray-100 h-screen py-4">
      <DocumentsProvider>
      <BrowserRouter>
        <Routes>
          <Route index element={<IndexPage/>} />
          <Route path="/dashboard" element={<Dashboard/>} />
          <Route path="/auth" element={<AuthPage/>} />
          <Route path="/editor" element={<EditorPage/>}/>
        </Routes>
      </BrowserRouter>
      </DocumentsProvider>
      <Toaster/>
    </div>
    </>
  )
}

export default App
