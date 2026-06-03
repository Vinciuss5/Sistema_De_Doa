import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { ArrowLeft, TrendingUp, Users, Package, Award, Download, Filter, Calendar } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import jsPDF from 'jspdf'
import * as XLSX from 'xlsx'
import type { ClothingItem, Donor, Beneficiary } from '../App'

interface ReportsScreenProps {
  clothingItems: ClothingItem[]
  donors: Donor[]
  beneficiaries: Beneficiary[]
  getDonorById: (id: string) => Donor | undefined
  getBeneficiaryById: (id: string) => Beneficiary | undefined
  onBack: () => void
}

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1', '#14b8a6']

export function ReportsScreen({ clothingItems, donors, beneficiaries, getDonorById, getBeneficiaryById, onBack }: ReportsScreenProps) {
  const [period, setPeriod] = useState<'month' | 'semester' | 'year'>('year')
  const [clothingTypeFilter, setClothingTypeFilter] = useState<string>('all')

  // Função para calcular se uma data está no período selecionado
  const isInPeriod = (dateString: string): boolean => {
    const date = new Date(dateString)
    const now = new Date()
    const monthsAgo = period === 'month' ? 1 : period === 'semester' ? 6 : 12

    const startDate = new Date(now)
    startDate.setMonth(now.getMonth() - monthsAgo)

    return date >= startDate && date <= now
  }

  // Filtrar itens doados no período
  const donatedItemsInPeriod = clothingItems.filter(item => isInPeriod(item.donatedAt))

  // Filtrar itens distribuídos no período
  const distributedItemsInPeriod = clothingItems.filter(item => 
    item.distributedAt && isInPeriod(item.distributedAt)
  )

  // Calcular total de peças doadas
  const totalDonatedPieces = donatedItemsInPeriod.reduce((sum, item) => sum + item.quantity, 0)

  // Calcular total de peças distribuídas
  const totalDistributedPieces = distributedItemsInPeriod.length

  // Ranking de doadores (quem mais doou)
  const donorRanking = donors.map(donor => {
    const donorItems = donatedItemsInPeriod.filter(item => item.donorId === donor.id)
    const totalPieces = donorItems.reduce((sum, item) => sum + item.quantity, 0)
    return {
      donor,
      totalPieces,
      totalDonations: donorItems.length
    }
  })
    .filter(d => d.totalPieces > 0)
    .sort((a, b) => b.totalPieces - a.totalPieces)
    .slice(0, 10)

  // Ranking de beneficiários (quem mais recebeu)
  const beneficiaryRanking = beneficiaries.map(beneficiary => {
    const receivedItems = distributedItemsInPeriod.filter(item => item.beneficiaryId === beneficiary.id)
    return {
      beneficiary,
      totalReceived: receivedItems.length
    }
  })
    .filter(b => b.totalReceived > 0)
    .sort((a, b) => b.totalReceived - a.totalReceived)
    .slice(0, 10)

  // Análise de tipos de roupas doadas
  const clothingTypeStats = donatedItemsInPeriod.reduce((acc, item) => {
    if (!acc[item.type]) {
      acc[item.type] = 0
    }
    acc[item.type] += item.quantity
    return acc
  }, {} as Record<string, number>)

  const clothingTypeData = Object.entries(clothingTypeStats)
    .map(([type, quantity]) => ({ type, quantity }))
    .sort((a, b) => b.quantity - a.quantity)

  // Dados para gráfico de barras de doadores
  const topDonorsChartData = donorRanking.slice(0, 5).map(d => ({
    name: d.donor.name.split(' ')[0],
    pecas: d.totalPieces
  }))

  // Dados para gráfico de pizza de tipos de roupas
  const topClothingTypesData = clothingTypeData.slice(0, 8)

  // Filtrar por tipo de roupa se selecionado
  const filteredItemsForStats = clothingTypeFilter === 'all' 
    ? donatedItemsInPeriod 
    : donatedItemsInPeriod.filter(item => item.type === clothingTypeFilter)

  // Dados temporais - evolução mensal
  const getMonthlyData = () => {
    const monthlyStats: Record<string, { donations: number, distributions: number }> = {}
    
    // Determinar quantos meses para trás
    const monthsBack = period === 'month' ? 4 : period === 'semester' ? 6 : 12
    const now = new Date()
    
    // Inicializar os últimos N meses
    for (let i = monthsBack - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const label = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
      monthlyStats[key] = { donations: 0, distributions: 0 }
    }

    // Contar doações por mês
    clothingItems.forEach(item => {
      const donatedDate = new Date(item.donatedAt)
      const key = `${donatedDate.getFullYear()}-${String(donatedDate.getMonth() + 1).padStart(2, '0')}`
      if (monthlyStats[key]) {
        monthlyStats[key].donations += item.quantity
      }

      if (item.distributedAt) {
        const distributedDate = new Date(item.distributedAt)
        const distKey = `${distributedDate.getFullYear()}-${String(distributedDate.getMonth() + 1).padStart(2, '0')}`
        if (monthlyStats[distKey]) {
          monthlyStats[distKey].distributions += 1
        }
      }
    })

    return Object.entries(monthlyStats).map(([key, stats]) => {
      const [year, month] = key.split('-')
      const date = new Date(parseInt(year), parseInt(month) - 1, 1)
      return {
        month: date.toLocaleDateString('pt-BR', { month: 'short' }),
        Doações: stats.donations,
        Distribuições: stats.distributions
      }
    })
  }

  const monthlyData = getMonthlyData()

  // Obter todos os tipos de roupas únicos
  const allClothingTypes = Array.from(new Set(clothingItems.map(item => item.type))).sort()

  // Função para exportar para Excel
  const exportToExcel = () => {
    const wb = XLSX.utils.book_new()
    
    // Aba 1: Resumo
    const summaryData = [
      ['RELATÓRIO DE DOAÇÕES - ' + getPeriodLabel().toUpperCase()],
      [''],
      ['Total de Peças Doadas', totalDonatedPieces],
      ['Total de Peças Distribuídas', totalDistributedPieces],
      [''],
      ['TOP 10 DOADORES'],
      ['Posição', 'Nome', 'Código', 'Total de Peças', 'Doações'],
      ...donorRanking.map((d, idx) => [
        idx + 1,
        d.donor.name,
        d.donor.donorCode,
        d.totalPieces,
        d.totalDonations
      ])
    ]
    const ws1 = XLSX.utils.aoa_to_sheet(summaryData)
    XLSX.utils.book_append_sheet(wb, ws1, 'Resumo')

    // Aba 2: Tipos de Roupas
    const typesData = [
      ['ANÁLISE POR TIPO DE ROUPA'],
      [''],
      ['Tipo', 'Quantidade Doada', 'Percentual'],
      ...clothingTypeData.map(item => [
        item.type,
        item.quantity,
        ((item.quantity / totalDonatedPieces) * 100).toFixed(1) + '%'
      ])
    ]
    const ws2 = XLSX.utils.aoa_to_sheet(typesData)
    XLSX.utils.book_append_sheet(wb, ws2, 'Tipos de Roupas')

    // Aba 3: Evolução Mensal
    const evolutionData = [
      ['EVOLUÇÃO MENSAL'],
      [''],
      ['Mês', 'Doações', 'Distribuições'],
      ...monthlyData.map(m => [m.month, m.Doações, m.Distribuições])
    ]
    const ws3 = XLSX.utils.aoa_to_sheet(evolutionData)
    XLSX.utils.book_append_sheet(wb, ws3, 'Evolução')

    // Exportar
    XLSX.writeFile(wb, `relatorio-doacoes-${period}-${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  // Função para exportar para PDF
  const exportToPDF = () => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    let yPos = 20

    // Título
    doc.setFontSize(18)
    doc.text('RELATÓRIO DE DOAÇÕES', pageWidth / 2, yPos, { align: 'center' })
    yPos += 10
    
    doc.setFontSize(12)
    doc.text(getPeriodLabel(), pageWidth / 2, yPos, { align: 'center' })
    yPos += 15

    // Resumo
    doc.setFontSize(14)
    doc.text('Resumo Geral', 14, yPos)
    yPos += 8
    
    doc.setFontSize(10)
    doc.text(`Total de Peças Doadas: ${totalDonatedPieces}`, 14, yPos)
    yPos += 6
    doc.text(`Total de Peças Distribuídas: ${totalDistributedPieces}`, 14, yPos)
    yPos += 12

    // Top 5 Doadores
    doc.setFontSize(14)
    doc.text('Top 5 Doadores', 14, yPos)
    yPos += 8
    
    doc.setFontSize(10)
    donorRanking.slice(0, 5).forEach((d, idx) => {
      doc.text(`${idx + 1}. ${d.donor.name} (${d.donor.donorCode}) - ${d.totalPieces} peças`, 14, yPos)
      yPos += 6
      if (yPos > 270) {
        doc.addPage()
        yPos = 20
      }
    })
    yPos += 8

    // Tipos de Roupas
    doc.setFontSize(14)
    doc.text('Top 5 Tipos de Roupas Doadas', 14, yPos)
    yPos += 8
    
    doc.setFontSize(10)
    clothingTypeData.slice(0, 5).forEach((item) => {
      const percentage = ((item.quantity / totalDonatedPieces) * 100).toFixed(1)
      doc.text(`${item.type}: ${item.quantity} peças (${percentage}%)`, 14, yPos)
      yPos += 6
      if (yPos > 270) {
        doc.addPage()
        yPos = 20
      }
    })

    // Salvar
    doc.save(`relatorio-doacoes-${period}-${new Date().toISOString().split('T')[0]}.pdf`)
  }

  const getPeriodLabel = () => {
    switch (period) {
      case 'month': return 'Último Mês'
      case 'semester': return 'Último Semestre'
      case 'year': return 'Último Ano'
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 space-y-6">
      {/* Header */}
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-2xl text-gray-800">Relatórios de Doações</CardTitle>
            <div className="w-8" />
          </div>
          <p className="text-sm text-gray-600 text-center">
            Análise completa de doações, doadores e beneficiários
          </p>
        </CardHeader>
      </Card>

      {/* Banner Informativo */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          💡 <strong>Recursos disponíveis:</strong> Alterne entre períodos (Mês/Semestre/Ano), 
          filtre por tipo de roupa específica, visualize evolução temporal e exporte os relatórios em PDF ou Excel com um clique!
        </p>
      </div>

      {/* Seletor de Período */}
      <Tabs value={period} onValueChange={(v) => setPeriod(v as 'month' | 'semester' | 'year')} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="month">Mês</TabsTrigger>
          <TabsTrigger value="semester">Semestre</TabsTrigger>
          <TabsTrigger value="year">Ano</TabsTrigger>
        </TabsList>

        <TabsContent value={period} className="space-y-6">
          {/* Filtros e Exportação */}
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="flex items-center gap-3 flex-wrap">
                  <Filter className="h-5 w-5 text-gray-600" />
                  <div className="flex flex-col gap-1">
                    <label className="text-sm text-gray-600">Filtrar por tipo:</label>
                    <Select value={clothingTypeFilter} onValueChange={setClothingTypeFilter}>
                      <SelectTrigger className="w-48 bg-gray-50">
                        <SelectValue placeholder="Todos os tipos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os tipos</SelectItem>
                        {allClothingTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {clothingTypeFilter !== 'all' && (
                      <p className="text-xs text-blue-600 mt-1">
                        📊 Exibindo apenas: {clothingTypeFilter}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  <div className="flex gap-2">
                    <Button 
                      onClick={exportToExcel}
                      className="bg-green-600 hover:bg-green-700 text-white gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Excel
                    </Button>
                    <Button 
                      onClick={exportToPDF}
                      className="bg-red-600 hover:bg-red-700 text-white gap-2"
                    >
                      <Download className="h-4 w-4" />
                      PDF
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Exporte os dados completos do período
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Total de Peças Doadas</CardTitle>
                <Package className="h-4 w-4 opacity-80" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl">{totalDonatedPieces}</div>
                <p className="text-xs opacity-80 mt-1">{getPeriodLabel()}</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Peças Distribuídas</CardTitle>
                <TrendingUp className="h-4 w-4 opacity-80" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl">{totalDistributedPieces}</div>
                <p className="text-xs opacity-80 mt-1">{getPeriodLabel()}</p>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de Evolução Temporal */}
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-indigo-600" />
                Evolução Temporal - {getPeriodLabel()}
              </CardTitle>
              <p className="text-sm text-gray-600">
                Acompanhe a evolução de doações e distribuições ao longo do tempo
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="Doações" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    dot={{ fill: '#8b5cf6', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Distribuições" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={{ fill: '#10b981', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de Top Doadores */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-purple-600" />
                  Top 5 Doadores
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topDonorsChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="pecas" fill="#8b5cf6" name="Peças Doadas" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Gráfico de Tipos de Roupas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-600" />
                  Tipos de Roupas Doadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={topClothingTypesData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ type, percent }) => `${type} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="quantity"
                    >
                      {topClothingTypesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Ranking Completo de Doadores */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-orange-600" />
                Ranking de Doadores - {getPeriodLabel()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 text-sm text-gray-700">Posição</th>
                      <th className="text-left p-3 text-sm text-gray-700">Código</th>
                      <th className="text-left p-3 text-sm text-gray-700">Nome</th>
                      <th className="text-left p-3 text-sm text-gray-700">Total de Peças</th>
                      <th className="text-left p-3 text-sm text-gray-700">Doações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donorRanking.map((item, index) => (
                      <tr key={item.donor.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            {index === 0 && <span className="text-xl">🥇</span>}
                            {index === 1 && <span className="text-xl">🥈</span>}
                            {index === 2 && <span className="text-xl">🥉</span>}
                            <span>{index + 1}º</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-sm">
                            {item.donor.donorCode}
                          </span>
                        </td>
                        <td className="p-3">{item.donor.name}</td>
                        <td className="p-3">
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded">
                            {item.totalPieces} peças
                          </span>
                        </td>
                        <td className="p-3 text-gray-600">{item.totalDonations} doações</td>
                      </tr>
                    ))}
                    {donorRanking.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-gray-500">
                          Nenhuma doação registrada neste período
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Ranking de Beneficiários */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-teal-600" />
                Ranking de Beneficiários - {getPeriodLabel()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 text-sm text-gray-700">Posição</th>
                      <th className="text-left p-3 text-sm text-gray-700">Código</th>
                      <th className="text-left p-3 text-sm text-gray-700">Nome</th>
                      <th className="text-left p-3 text-sm text-gray-700">Peças Recebidas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {beneficiaryRanking.map((item, index) => (
                      <tr key={item.beneficiary.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            {index === 0 && <span className="text-xl">🥇</span>}
                            {index === 1 && <span className="text-xl">🥈</span>}
                            {index === 2 && <span className="text-xl">🥉</span>}
                            <span>{index + 1}º</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="bg-teal-100 text-teal-700 px-2 py-1 rounded text-sm">
                            {item.beneficiary.beneficiaryCode}
                          </span>
                        </td>
                        <td className="p-3">{item.beneficiary.name}</td>
                        <td className="p-3">
                          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded">
                            {item.totalReceived} peças
                          </span>
                        </td>
                      </tr>
                    ))}
                    {beneficiaryRanking.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-gray-500">
                          Nenhuma distribuição registrada neste período
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Análise de Tipos de Roupas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600" />
                Tipos de Roupas Doadas - {getPeriodLabel()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 text-sm text-gray-700">Posição</th>
                      <th className="text-left p-3 text-sm text-gray-700">Tipo de Roupa</th>
                      <th className="text-left p-3 text-sm text-gray-700">Quantidade</th>
                      <th className="text-left p-3 text-sm text-gray-700">Percentual</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clothingTypeData.map((item, index) => {
                      const percentage = ((item.quantity / totalDonatedPieces) * 100).toFixed(1)
                      return (
                        <tr key={item.type} className="border-b hover:bg-gray-50">
                          <td className="p-3">{index + 1}º</td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                              />
                              <span>{item.type}</span>
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded">
                              {item.quantity} peças
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <div className="w-full max-w-[200px] bg-gray-200 rounded-full h-2">
                                <div 
                                  className="h-2 rounded-full" 
                                  style={{ 
                                    width: `${percentage}%`,
                                    backgroundColor: COLORS[index % COLORS.length]
                                  }}
                                />
                              </div>
                              <span className="text-sm text-gray-600 min-w-[45px]">{percentage}%</span>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                    {clothingTypeData.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-gray-500">
                          Nenhuma roupa doada neste período
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
