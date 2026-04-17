import './App.css'
import Pages from "@/pages/index.jsx"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "sonner"
import { UpgradeProvider } from "@/context/UpgradeContext"
import UpgradeModal from "@/components/plano/UpgradeModal"

function App() {
  return (
    <UpgradeProvider>
      <Pages />
      <UpgradeModal />
      <Toaster />
      <SonnerToaster position="top-right" />
    </UpgradeProvider>
  )
}

export default App