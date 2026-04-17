import './App.css'
import Pages from "@/pages/index.jsx"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "sonner"
import { UpgradeModal } from "@/components/UpgradeModal"

function App() {
  return (
    <>
      <Pages />
      <UpgradeModal />
      <Toaster />
      <SonnerToaster position="top-right" />
    </>
  )
}

export default App