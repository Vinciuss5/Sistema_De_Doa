import { useState, useEffect } from 'react'
import { LoginScreen } from './components/LoginScreen'
import { SignupScreen } from './components/SignupScreen'
import { DonorRegistration } from './components/DonorRegistration'
import { BeneficiaryRegistration } from './components/BeneficiaryRegistration'
import { ProductRegistration } from './components/ProductRegistration'
import { MenuScreen } from './components/MenuScreen'
import { StockScreen } from './components/StockScreen'
import { DonorDonationsScreen } from './components/DonorDonationsScreen'
import { PasswordRecoveryScreen } from './components/PasswordRecoveryScreen'
import { DonorSearchScreen } from './components/DonorSearchScreen'
import { DonorProfileScreen } from './components/DonorProfileScreen'
import { BeneficiarySearchScreen } from './components/BeneficiarySearchScreen'
import { BeneficiaryProfileScreen } from './components/BeneficiaryProfileScreen'
import { ReportsScreen } from './components/ReportsScreen'
import { getSession } from './utils/supabase/client'
import { getDonors, getBeneficiaries, getProducts, createDistribution } from './utils/api'

export type Donor = {
  id: string
  donorCode: string // Código único para identificação (ex: DOA001)
  name: string
  email: string
  phone: string
  cpf: string
}

export type Beneficiary = {
  id: string
  beneficiaryCode: string // Código único para identificação (ex: BEN001)
  name: string
  email: string
  phone: string
  cpf: string
  street: string
  number: string
  complement: string
  neighborhood: string
  city: string
  state: string
  zipCode: string
}

export type ClothingItem = {
  id: string
  type: string // Camiseta, Calça, Vestido, etc.
  size: string // P, M, G, GG, etc.
  color: string
  quality: string // Novo, Usado - Bom Estado, Usado - Estado Regular
  quantity: number
  donorId: string
  donatedAt: string
  beneficiaryId?: string // ID do beneficiário quando a roupa é distribuída
  distributedAt?: string // Data de distribuição
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'login' | 'signup' | 'password-recovery' | 'donor' | 'beneficiary' | 'donor-donations' | 'menu' | 'product' | 'stock' | 'search' | 'profile' | 'beneficiary-search' | 'beneficiary-profile' | 'reports'>('login')
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [isLoadingData, setIsLoadingData] = useState(false)

  const [currentDonor, setCurrentDonor] = useState<Donor | null>(null)
  const [currentBeneficiary, setCurrentBeneficiary] = useState<Beneficiary | null>(null)
  const [selectedDonorForProfile, setSelectedDonorForProfile] = useState<Donor | null>(null)
  const [selectedBeneficiaryForProfile, setSelectedBeneficiaryForProfile] = useState<Beneficiary | null>(null)
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([])
  const [donors, setDonors] = useState<Donor[]>([])
  const [clothingItems, setClothingItems] = useState<ClothingItem[]>([])

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const { session } = await getSession()
      if (session) {
        console.log('Active session found, redirecting to menu')
        setCurrentScreen('menu')
      }
      setIsCheckingAuth(false)
    }
    checkAuth()
  }, [])

  // Load data from backend when navigating to menu
  useEffect(() => {
    if (currentScreen === 'menu' && !isLoadingData) {
      loadAllData()
    }
  }, [currentScreen])

  const loadAllData = async () => {
    setIsLoadingData(true)
    try {
      await Promise.all([
        loadDonors(),
        loadBeneficiaries(),
        loadProducts()
      ])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setIsLoadingData(false)
    }
  }

  const loadDonors = async () => {
    try {
      const response = await getDonors()
      if (response.donors) {
        const mappedDonors: Donor[] = response.donors.map((d: any) => ({
          id: d.code,
          donorCode: d.code,
          name: d.name,
          email: d.email,
          phone: d.phone,
          cpf: d.cpf
        }))
        setDonors(mappedDonors)
      }
    } catch (error) {
      console.error('Error loading donors:', error)
    }
  }

  const loadBeneficiaries = async () => {
    try {
      const response = await getBeneficiaries()
      if (response.beneficiaries) {
        const mappedBeneficiaries: Beneficiary[] = response.beneficiaries.map((b: any) => {
          // Parse address string back to components
          // Format: "Rua X, 123 - Apt 45, Bairro, Cidade, UF, CEP: 12345-678"
          const addressParts = b.address ? b.address.split(', ') : []
          
          let street = addressParts[0] || ''
          let number = ''
          let complement = ''
          
          // Extract number and complement from second part
          if (addressParts[1]) {
            const numberPart = addressParts[1].split(' - ')
            number = numberPart[0] || ''
            complement = numberPart[1] || ''
          }
          
          const neighborhood = addressParts[2] || ''
          const city = addressParts[3] || ''
          const state = addressParts[4] || ''
          const zipCode = addressParts[5] ? addressParts[5].replace('CEP: ', '').trim() : ''
          
          return {
            id: b.code,
            beneficiaryCode: b.code,
            name: b.name,
            email: b.email,
            phone: b.phone,
            cpf: b.cpf,
            street,
            number,
            complement,
            neighborhood,
            city,
            state,
            zipCode
          }
        })
        setBeneficiaries(mappedBeneficiaries)
      }
    } catch (error) {
      console.error('Error loading beneficiaries:', error)
    }
  }

  const loadProducts = async () => {
    try {
      const response = await getProducts()
      if (response.products) {
        const mappedProducts: ClothingItem[] = response.products.map((p: any) => ({
          id: p.id,
          type: p.type,
          size: p.size,
          color: p.color,
          quality: p.quality,
          quantity: p.quantity,
          donorId: p.donorCode,
          donatedAt: p.createdAt ? p.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
          beneficiaryId: p.beneficiaryCode,
          distributedAt: p.distributedAt
        }))
        setClothingItems(mappedProducts)
      }
    } catch (error) {
      console.error('Error loading products:', error)
    }
  }

  const updateClothingQuantity = (id: string, newQuantity: number) => {
    setClothingItems(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, quantity: Math.max(0, newQuantity) }
          : item
      )
    )
  }

  const distributeClothing = async (clothingId: string, beneficiaryId: string, quantityToDistribute: number) => {
    try {
      // Find the item
      const item = clothingItems.find(i => i.id === clothingId)
      if (!item) return

      // Get the beneficiary code
      const beneficiary = beneficiaries.find(b => b.id === beneficiaryId)
      if (!beneficiary) return

      // Create distribution in backend
      await createDistribution({
        productId: clothingId,
        beneficiaryCode: beneficiary.beneficiaryCode,
        quantity: quantityToDistribute
      })

      // Update local state
      setClothingItems(prev => 
        prev.map(item => {
          if (item.id === clothingId) {
            const newQuantity = Math.max(0, item.quantity - quantityToDistribute)
            return { 
              ...item, 
              quantity: newQuantity,
              beneficiaryId: quantityToDistribute > 0 ? beneficiaryId : item.beneficiaryId,
              distributedAt: quantityToDistribute > 0 ? new Date().toISOString().split('T')[0] : item.distributedAt
            }
          }
          return item
        })
      )

      alert('Distribuição registrada com sucesso!')
    } catch (error: any) {
      console.error('Error distributing clothing:', error)
      alert(error.message || 'Erro ao distribuir roupa')
    }
  }

  const getCurrentDonorDonations = () => {
    if (!currentDonor) return []
    return clothingItems.filter(item => item.donorId === currentDonor.id)
  }

  const getDonorById = (donorId: string) => {
    return donors.find(donor => donor.id === donorId)
  }

  const getBeneficiaryById = (beneficiaryId: string) => {
    return beneficiaries.find(beneficiary => beneficiary.id === beneficiaryId)
  }

  const renderScreen = () => {
    if (isCheckingAuth) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-gray-600">Carregando...</div>
        </div>
      )
    }

    switch (currentScreen) {
      case 'login':
        return <LoginScreen onNavigateToPasswordRecovery={() => setCurrentScreen('password-recovery')} onNavigateToMenu={() => setCurrentScreen('menu')} onNavigateToSignup={() => setCurrentScreen('signup')} />
      case 'signup':
        return <SignupScreen onBack={() => setCurrentScreen('login')} onSuccess={() => setCurrentScreen('menu')} />
      case 'password-recovery':
        return <PasswordRecoveryScreen onBack={() => setCurrentScreen('login')} />
      case 'donor':
        return <DonorRegistration 
          onBack={() => setCurrentScreen('menu')} 
          onNext={(donor) => {
            setCurrentDonor(donor)
            setCurrentScreen('donor-donations')
          }} 
          onRefresh={loadDonors}
        />
      case 'beneficiary':
        return <BeneficiaryRegistration 
          onBack={() => setCurrentScreen('menu')} 
          onRefresh={loadBeneficiaries}
        />
      case 'donor-donations':
        return <DonorDonationsScreen donor={currentDonor} donations={getCurrentDonorDonations()} onBack={() => setCurrentScreen('donor')} onNext={() => setCurrentScreen('menu')} />
      case 'menu':
        return (
          <>
            <MenuScreen 
              onNavigateToDonor={() => setCurrentScreen('donor')} 
              onNavigateToBeneficiary={() => setCurrentScreen('beneficiary')} 
              onNavigateToProduct={() => setCurrentScreen('product')} 
              onNavigateToStock={() => setCurrentScreen('stock')} 
              onNavigateToSearch={() => setCurrentScreen('search')} 
              onNavigateToBeneficiarySearch={() => setCurrentScreen('beneficiary-search')} 
              onNavigateToReports={() => setCurrentScreen('reports')} 
              onBack={() => setCurrentScreen('login')} 
            />
            {isLoadingData && (
              <div className="fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
                Carregando dados...
              </div>
            )}
          </>
        )
      case 'product':
        return <ProductRegistration 
          onBack={() => setCurrentScreen('menu')} 
          donors={donors} 
          onRefresh={loadProducts}
        />
      case 'stock':
        return <StockScreen 
          clothingItems={clothingItems} 
          onUpdateQuantity={updateClothingQuantity} 
          onDistributeClothing={distributeClothing} 
          beneficiaries={beneficiaries} 
          onBack={() => setCurrentScreen('menu')} 
          getDonorById={getDonorById} 
          getBeneficiaryById={getBeneficiaryById} 
        />
      case 'search':
        return <DonorSearchScreen 
          donors={donors} 
          clothingItems={clothingItems} 
          onBack={() => setCurrentScreen('menu')} 
          onViewProfile={(donor) => {
            setSelectedDonorForProfile(donor)
            setCurrentScreen('profile')
          }}
        />
      case 'profile':
        return selectedDonorForProfile ? (
          <DonorProfileScreen 
            donor={selectedDonorForProfile} 
            clothingItems={clothingItems} 
            onBack={() => setCurrentScreen('search')} 
          />
        ) : (
          <div>Erro: Doador não encontrado</div>
        )
      case 'beneficiary-search':
        return <BeneficiarySearchScreen 
          beneficiaries={beneficiaries} 
          clothingItems={clothingItems} 
          onBack={() => setCurrentScreen('menu')} 
          onViewProfile={(beneficiary) => {
            setSelectedBeneficiaryForProfile(beneficiary)
            setCurrentScreen('beneficiary-profile')
          }}
        />
      case 'beneficiary-profile':
        return selectedBeneficiaryForProfile ? (
          <BeneficiaryProfileScreen 
            beneficiary={selectedBeneficiaryForProfile} 
            clothingItems={clothingItems} 
            onBack={() => setCurrentScreen('beneficiary-search')} 
          />
        ) : (
          <div>Erro: Beneficiário não encontrado</div>
        )
      case 'reports':
        return <ReportsScreen 
          clothingItems={clothingItems}
          donors={donors}
          beneficiaries={beneficiaries}
          getDonorById={getDonorById}
          getBeneficiaryById={getBeneficiaryById}
          onBack={() => setCurrentScreen('menu')}
        />
      default:
        return <div>Tela não encontrada</div>
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4">
      {renderScreen()}
    </div>
  )
}
