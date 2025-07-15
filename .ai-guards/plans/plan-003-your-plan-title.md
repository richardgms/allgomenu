---
id: plan-003
title: AllGoMenu - Sistema Funcional de Pedidos para WhatsApp
createdAt: 2025-07-15
author: Richard
status: active
---

## 🧩 Scope

Transformar o AllGoMenu em um sistema completamente funcional de delivery com:
- Homepage moderna e profissional para clientes
- Sistema de carrinho funcional
- Checkout completo com dados do cliente
- Envio automático de pedidos para WhatsApp
- Painel administrativo funcional
- Sistema de personalização visual aplicado

## ✅ Functional Requirements

### Frontend do Cliente
- Homepage responsiva com design moderno
- Exibição de produtos organizados por categorias
- Sistema de carrinho com add/remove/quantidade
- Checkout com formulário de dados do cliente
- Cálculo automático de taxas e totais
- Geração de link WhatsApp com pedido formatado
- Aplicação em tempo real das configurações de tema

### Painel Administrativo
- Sistema de login funcional
- Configurações de restaurante (dados, horários, entrega)
- Gestão de produtos e categorias
- Sistema de personalização visual (cores, logo, fontes)
- Configuração de template WhatsApp
- Status de funcionamento (aberto/fechado)

### Sistema de Pedidos
- Validação de horário de funcionamento
- Verificação de pedido mínimo
- Formatação automática da mensagem WhatsApp
- Suporte a delivery e retirada
- Cálculo de zonas de entrega

## ⚙️ Non-Functional Requirements

- **Performance**: Carregamento < 3 segundos
- **Security**: Autenticação JWT, validação de dados
- **Scalability**: Suporte a múltiplos restaurantes
- **Usability**: Interface intuitiva e responsiva
- **Reliability**: Tratamento de erros e fallbacks

## 📚 Guidelines & Packages

- **Framework**: Next.js 14 com TypeScript
- **Styling**: Tailwind CSS com CSS Variables dinâmicas
- **Database**: PostgreSQL com Prisma ORM
- **Authentication**: JWT com middleware personalizado
- **State Management**: React useState/useEffect
- **Validation**: Zod para validação de dados
- **Icons**: Emojis e Lucide React
- **Fonts**: Google Fonts dinâmicas

## 🔐 Threat Model

- **Input Validation**: Sanitização de dados do usuário
- **Authentication**: Proteção de rotas administrativas
- **XSS Prevention**: Escape de conteúdo dinâmico
- **Rate Limiting**: Proteção contra spam de pedidos
- **Data Privacy**: Não armazenar dados sensíveis do cliente

## 🔢 Execution Plan

### Phase 1: Homepage Profissional (Prioridade Alta)
1. **Redesign completo da homepage**
   - Hero section com informações do restaurante
   - Cards de produtos com imagens e descrições
   - Sistema de categorias navegável
   - Layout responsivo e moderno

2. **Sistema de carrinho aprimorado**
   - Interface visual melhorada
   - Animações de feedback
   - Cálculos dinâmicos de totais
   - Persistência local do carrinho

### Phase 2: Sistema de Checkout (Prioridade Alta)
3. **Formulário de checkout completo**
   - Dados do cliente (nome, telefone, endereço)
   - Seleção de delivery/retirada
   - Validação de campos obrigatórios
   - Cálculo final com taxas

4. **Integração WhatsApp**
   - Formatação profissional da mensagem
   - Template customizável pelo admin
   - Geração de link WhatsApp
   - Redirecionamento automático

### Phase 3: Personalização Visual (Prioridade Média)
5. **Sistema de tema dinâmico**
   - Aplicação em tempo real de cores
   - Upload e exibição de logo
   - Seleção de fontes Google
   - Preview das mudanças

6. **Componentes visuais**
   - Cards modernos e responsivos
   - Botões com estados visuais
   - Loading states e animações
   - Feedback visual de ações

### Phase 4: Funcionalidades Avançadas (Prioridade Baixa)
7. **Sistema de horários**
   - Verificação de funcionamento
   - Horários com intervalos
   - Status automático aberto/fechado

8. **Zonas de entrega**
   - Cálculo de taxa por zona
   - Validação de endereço
   - Raio de entrega configurável

### Phase 5: Polimento e Testes (Prioridade Baixa)
9. **Otimizações de performance**
   - Lazy loading de imagens
   - Compressão de assets
   - Cache de dados

10. **Testes e validação**
    - Testes de funcionalidade
    - Validação de responsividade
    - Testes de integração WhatsApp

## 📋 Success Criteria

- [ ] Homepage carrega em < 3 segundos
- [ ] Cliente consegue fazer pedido completo
- [ ] Pedido é enviado corretamente para WhatsApp
- [ ] Admin consegue configurar restaurante
- [ ] Tema é aplicado em tempo real
- [ ] Sistema funciona em mobile e desktop
- [ ] Tratamento de erros funcional
- [ ] Interface profissional e intuitiva

## 🚀 Next Steps

1. Implementar homepage profissional
2. Criar sistema de checkout
3. Integrar WhatsApp
4. Aplicar personalização visual
5. Testes e ajustes finais 