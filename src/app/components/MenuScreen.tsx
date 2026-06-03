import { Button } from './ui/button'
import { Card, CardContent, CardHeader } from './ui/card'
import { ArrowLeft, Package, BarChart3, UserPlus, Search, Users, UserCheck, FileBarChart, LogOut } from 'lucide-react'
import { signOut } from '../utils/supabase/client'
import { ThemeToggle } from './ThemeToggle'

interface MenuScreenProps {
  onNavigateToDonor: () => void
  onNavigateToBeneficiary: () => void
  onNavigateToProduct: () => void
  onNavigateToStock: () => void
  onNavigateToSearch: () => void
  onNavigateToBeneficiarySearch: () => void
  onNavigateToReports: () => void
  onBack: () => void
}

export function MenuScreen({ onNavigateToDonor, onNavigateToBeneficiary, onNavigateToProduct, onNavigateToStock, onNavigateToSearch, onNavigateToBeneficiarySearch, onNavigateToReports, onBack }: MenuScreenProps) {
  const handleLogout = async () => {
    await signOut()
    onBack()
  }
  return (
    <Card className="w-full max-w-md mx-auto bg-bg-primary shadow-sm border border-border-default transition-colors duration-300">
      <CardHeader className="text-center pb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="p-2 text-status-error hover:text-status-error hover:bg-status-error/10 transition-colors"
              title="Sair"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <h1 className="text-2xl text-text-primary">Painel de Controle</h1>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={onNavigateToDonor}
          className="w-full !bg-button-primary hover:!bg-button-hover !text-button-text rounded-md h-16 flex items-center justify-center gap-3 transition-colors"
        >
          <UserPlus className="h-5 w-5" />
          <span>Cadastrar Doador</span>
        </Button>

        <Button
          onClick={onNavigateToBeneficiary}
          className="w-full !bg-button-primary hover:!bg-button-hover !text-button-text rounded-md h-16 flex items-center justify-center gap-3 transition-colors"
        >
          <Users className="h-5 w-5" />
          <span>Cadastrar Beneficiário</span>
        </Button>

        <Button
          onClick={onNavigateToSearch}
          className="w-full !bg-button-primary hover:!bg-button-hover !text-button-text rounded-md h-16 flex items-center justify-center gap-3 transition-colors"
        >
          <Search className="h-5 w-5" />
          <span>Pesquisar Doador</span>
        </Button>

        <Button
          onClick={onNavigateToBeneficiarySearch}
          className="w-full !bg-button-primary hover:!bg-button-hover !text-button-text rounded-md h-16 flex items-center justify-center gap-3 transition-colors"
        >
          <UserCheck className="h-5 w-5" />
          <span>Pesquisar Beneficiário</span>
        </Button>

        <Button
          onClick={onNavigateToProduct}
          className="w-full !bg-button-primary hover:!bg-button-hover !text-button-text rounded-md h-16 flex items-center justify-center gap-3 transition-colors"
        >
          <Package className="h-5 w-5" />
          <span>Cadastrar Roupa</span>
        </Button>

        <Button
          onClick={onNavigateToStock}
          className="w-full !bg-button-primary hover:!bg-button-hover !text-button-text rounded-md h-16 flex items-center justify-center gap-3 transition-colors"
        >
          <BarChart3 className="h-5 w-5" />
          <span>Ver Estoque de Roupas</span>
        </Button>

        <Button
          onClick={onNavigateToReports}
          className="w-full !bg-button-primary hover:!bg-button-hover !text-button-text rounded-md h-16 flex items-center justify-center gap-3 transition-colors"
        >
          <FileBarChart className="h-5 w-5" />
          <span>Relatórios de Doações</span>
        </Button>
      </CardContent>
    </Card>
  )
}