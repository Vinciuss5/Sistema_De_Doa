# Guia do Sistema de Temas

## Visão Geral

Este projeto possui um sistema de temas dual-mode (claro/escuro) implementado com variáveis CSS e integração com Tailwind CSS.

## Variáveis de Cores Semânticas

### Background (Fundo)
- `--bg-primary`: Fundo principal (#FFFFFF → #0F172A)
- `--bg-secondary`: Fundo secundário (#F8FAFC → #1E293B)
- `--bg-tertiary`: Fundo terciário (#F1F5F9 → #334155)

### Text (Texto)
- `--text-primary`: Texto principal (#0F172A → #F8FAFC)
- `--text-secondary`: Texto secundário (#475569 → #94A3B8)
- `--text-muted`: Texto esmaecido (#94A3B8 → #475569)

### Border (Bordas)
- `--border-default`: Borda padrão (#E2E8F0 → #334155)
- `--border-strong`: Borda forte (#CBD5E1 → #475569)

### Accent (Destaque)
- `--accent-primary`: Cor de destaque primária (#4F46E5 → #6366F1)
- `--accent-hover`: Cor de destaque ao passar o mouse (#4338CA → #818CF8)

### Status (Estados)
- `--status-success`: Sucesso (#10B981 → #34D399)
- `--status-warning`: Aviso (#F59E0B → #FBBF24)
- `--status-error`: Erro (#EF4444 → #F87171)

## Como Usar

### 1. Com Tailwind (Recomendado)

As variáveis estão disponíveis como classes Tailwind:

```tsx
// Backgrounds
<div className="bg-bg-primary">Fundo principal</div>
<div className="bg-bg-secondary">Fundo secundário</div>
<div className="bg-bg-tertiary">Fundo terciário</div>

// Text
<p className="text-text-primary">Texto principal</p>
<p className="text-text-secondary">Texto secundário</p>
<p className="text-text-muted">Texto esmaecido</p>

// Borders
<div className="border border-border-default">Borda padrão</div>
<div className="border-2 border-border-strong">Borda forte</div>

// Accent
<button className="bg-accent-primary hover:bg-accent-hover">Botão</button>

// Status
<div className="bg-status-success">Sucesso</div>
<div className="bg-status-warning">Aviso</div>
<div className="bg-status-error">Erro</div>
```

### 2. Com CSS Direto

```css
.meu-componente {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-default);
}

.meu-botao {
  background-color: var(--accent-primary);
  color: white;
}

.meu-botao:hover {
  background-color: var(--accent-hover);
}
```

### 3. Classes de Utilidade Customizadas

```tsx
// Cards com tema aplicado automaticamente
<div className="card-themed">Card com tema</div>
<div className="card-secondary-themed">Card secundário com tema</div>
```

## Alternando Temas

### Componente ThemeToggle

O componente `ThemeToggle` já está integrado no sistema:

```tsx
import { ThemeToggle } from './components/ThemeToggle'

function MeuComponente() {
  return (
    <div>
      <ThemeToggle />
    </div>
  )
}
```

### Alternância Manual

```tsx
// Adicionar classe 'dark' ao elemento raiz
document.documentElement.classList.add('dark')

// Remover classe 'dark' para voltar ao modo claro
document.documentElement.classList.remove('dark')
```

### Persistência

O tema é salvo automaticamente no `localStorage` e é restaurado quando o usuário retorna:

```tsx
// O ThemeToggle já faz isso automaticamente
localStorage.setItem('theme', 'dark') // ou 'light'
const savedTheme = localStorage.getItem('theme')
```

## Detectar Tema Atual

```tsx
import { useEffect, useState } from 'react'

function useTheme() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'))
    }
    
    checkTheme()
    
    // Observar mudanças
    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })
    
    return () => observer.disconnect()
  }, [])

  return isDark
}
```

## Exemplos de Uso Comum

### Card Responsivo ao Tema
```tsx
<Card className="bg-bg-primary border-border-default">
  <CardHeader>
    <h2 className="text-text-primary">Título</h2>
  </CardHeader>
  <CardContent>
    <p className="text-text-secondary">Conteúdo</p>
  </CardContent>
</Card>
```

### Botão de Ação
```tsx
<Button className="bg-accent-primary hover:bg-accent-hover text-white">
  Clique Aqui
</Button>
```

### Mensagens de Status
```tsx
<div className="bg-status-success text-white p-4 rounded">
  Operação realizada com sucesso!
</div>

<div className="bg-status-warning text-white p-4 rounded">
  Atenção: verifique os dados
</div>

<div className="bg-status-error text-white p-4 rounded">
  Erro ao processar solicitação
</div>
```

## Transições Suaves

As transições entre temas são suaves (0.3s) e aplicadas automaticamente a:
- Cores de fundo
- Cores de texto
- Todos os elementos

## Melhores Práticas

1. **Use sempre as variáveis semânticas** ao invés de cores hard-coded
2. **Teste em ambos os temas** (claro e escuro)
3. **Mantenha bom contraste** entre texto e fundo
4. **Use `text-primary` para títulos** e `text-secondary` para descrições
5. **Evite usar cores absolutas** como `bg-white` ou `text-black` em componentes que devem responder ao tema
