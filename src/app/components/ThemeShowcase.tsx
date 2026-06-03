import { Card, CardContent, CardHeader } from './ui/card'
import { ThemeToggle } from './ThemeToggle'

/**
 * ThemeShowcase - Demonstração visual do sistema de temas
 *
 * Este componente exibe todos os tokens de cor do sistema de temas,
 * útil para desenvolvimento e testes de design.
 */
export function ThemeShowcase() {
  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-text-primary">Sistema de Temas</h1>
        <ThemeToggle />
      </div>

      {/* Background Colors */}
      <Card className="bg-bg-primary border-border-default transition-colors">
        <CardHeader>
          <h2 className="text-2xl font-semibold text-text-primary">Backgrounds</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="h-20 bg-bg-primary border-2 border-border-default rounded-lg"></div>
              <p className="text-sm text-text-secondary">bg-primary</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 bg-bg-secondary border-2 border-border-default rounded-lg"></div>
              <p className="text-sm text-text-secondary">bg-secondary</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 bg-bg-tertiary border-2 border-border-default rounded-lg"></div>
              <p className="text-sm text-text-secondary">bg-tertiary</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Text Colors */}
      <Card className="bg-bg-primary border-border-default transition-colors">
        <CardHeader>
          <h2 className="text-2xl font-semibold text-text-primary">Textos</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <p className="text-text-primary text-lg">text-primary - Texto principal</p>
            <p className="text-text-secondary text-lg">text-secondary - Texto secundário</p>
            <p className="text-text-muted text-lg">text-muted - Texto esmaecido</p>
          </div>
        </CardContent>
      </Card>

      {/* Border Colors */}
      <Card className="bg-bg-primary border-border-default transition-colors">
        <CardHeader>
          <h2 className="text-2xl font-semibold text-text-primary">Bordas</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="h-20 border-4 border-border-default rounded-lg bg-bg-secondary"></div>
              <p className="text-sm text-text-secondary">border-default</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 border-4 border-border-strong rounded-lg bg-bg-secondary"></div>
              <p className="text-sm text-text-secondary">border-strong</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accent Colors */}
      <Card className="bg-bg-primary border-border-default transition-colors">
        <CardHeader>
          <h2 className="text-2xl font-semibold text-text-primary">Accent</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="h-20 bg-accent-primary rounded-lg"></div>
              <p className="text-sm text-text-secondary">accent-primary</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 bg-accent-hover rounded-lg"></div>
              <p className="text-sm text-text-secondary">accent-hover</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Colors */}
      <Card className="bg-bg-primary border-border-default transition-colors">
        <CardHeader>
          <h2 className="text-2xl font-semibold text-text-primary">Status</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="h-20 bg-status-success rounded-lg"></div>
              <p className="text-sm text-text-secondary">status-success</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 bg-status-warning rounded-lg"></div>
              <p className="text-sm text-text-secondary">status-warning</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 bg-status-error rounded-lg"></div>
              <p className="text-sm text-text-secondary">status-error</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Examples */}
      <Card className="bg-bg-primary border-border-default transition-colors">
        <CardHeader>
          <h2 className="text-2xl font-semibold text-text-primary">Componentes Interativos</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <button className="px-6 py-3 bg-accent-primary hover:bg-accent-hover text-white rounded-lg transition-colors">
            Botão Principal
          </button>

          <div className="p-4 bg-status-success/10 border border-status-success rounded-lg">
            <p className="text-status-success font-medium">Mensagem de Sucesso</p>
          </div>

          <div className="p-4 bg-status-warning/10 border border-status-warning rounded-lg">
            <p className="text-status-warning font-medium">Mensagem de Aviso</p>
          </div>

          <div className="p-4 bg-status-error/10 border border-status-error rounded-lg">
            <p className="text-status-error font-medium">Mensagem de Erro</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
