import { Button } from './ui/button'
import { Card, CardContent, CardHeader } from './ui/card'
import { ArrowLeft, Package, BarChart3, UserPlus, Search, Users, UserCheck, FileBarChart, LogOut } from 'lucide-react'
import { signOut } from '../utils/supabase/client'

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
    <Card className="w-full max-w-md mx-auto bg-white shadow-sm border border-gray-200">
      <CardHeader className="text-center pb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1" />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            title="Sair"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
        <h1 className="text-2xl text-gray-800">Painel de Controle</h1>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={onNavigateToDonor}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-md h-16 flex items-center justify-center gap-3"
        >
          <UserPlus className="h-5 w-5" />
          <span>Cadastrar Doador</span>
        </Button>
        
        <Button 
          onClick={onNavigateToBeneficiary}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-md h-16 flex items-center justify-center gap-3"
        >
          <Users className="h-5 w-5" />
          <span>Cadastrar Beneficiário</span>
        </Button>
        
        <Button 
          onClick={onNavigateToSearch}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-md h-16 flex items-center justify-center gap-3"
        >
          <Search className="h-5 w-5" />
          <span>Pesquisar Doador</span>
        </Button>
        
        <Button 
          onClick={onNavigateToBeneficiarySearch}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-md h-16 flex items-center justify-center gap-3"
        >
          <UserCheck className="h-5 w-5" />
          <span>Pesquisar Beneficiário</span>
        </Button>
        
        <Button 
          onClick={onNavigateToProduct}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-md h-16 flex items-center justify-center gap-3"
        >
          <Package className="h-5 w-5" />
          <span>Cadastrar Roupa</span>
        </Button>
        
        <Button 
          onClick={onNavigateToStock}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-md h-16 flex items-center justify-center gap-3"
        >
          <BarChart3 className="h-5 w-5" />
          <span>Ver Estoque de Roupas</span>
        </Button>
        
        <Button 
          onClick={onNavigateToReports}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-md h-16 flex items-center justify-center gap-3"
        >
          <FileBarChart className="h-5 w-5" />
          <span>Relatórios de Doações</span>
        </Button>
      </CardContent>
    </Card>
  )
}