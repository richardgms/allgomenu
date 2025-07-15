# PRD - Sistema de Delivery Personalizado

## 📋 Visão Geral do Produto

### **Resumo Executivo**
Sistema web de delivery personalizado que permite restaurantes criarem suas próprias páginas de pedidos online com integração automática ao WhatsApp, sem necessidade de conhecimentos técnicos.

### **Objetivo**
Criar uma plataforma que permita restaurantes configurarem rapidamente um sistema de delivery próprio, personalizável e integrado ao WhatsApp para processamento de pedidos.

### **Escopo**
- Sistema multi-tenant para múltiplos restaurantes
- Dashboard administrativo para configuração
- Interface de cliente para pedidos
- Integração com WhatsApp para envio de pedidos
- Sistema de personalização visual

---

## 🎯 Objetivos e Metas

### **Objetivos Primários**
- Permitir que restaurantes criem sistemas de delivery em menos de 30 minutos
- Processar pedidos via WhatsApp de forma automática
- Oferecer interface similar ao DigMenu em funcionalidade
- Permitir personalização completa da marca

### **Métricas de Sucesso**
- Tempo médio de setup: < 30 minutos
- Taxa de conversão de visitantes em pedidos: > 15%
- Tempo de carregamento da página: < 3 segundos
- Satisfação do usuário admin: > 4.5/5

---

## 👥 Personas e Casos de Uso

### **Persona 1: Administrador do Restaurante**
**Perfil:** Dono/gerente de restaurante, 25-55 anos, conhecimento básico de tecnologia
**Necessidades:**
- Configurar cardápio rapidamente
- Personalizar aparência do site
- Receber pedidos de forma organizada
- Controlar horários de funcionamento

**Casos de Uso:**
- Fazer login no dashboard admin
- Adicionar/editar produtos do cardápio
- Configurar informações do restaurante
- Personalizar cores e logo
- Ativar/desativar produtos

### **Persona 2: Cliente Final**
**Perfil:** Consumidor, 18-50 anos, usuário de smartphone
**Necessidades:**
- Navegar pelo cardápio facilmente
- Fazer pedidos rapidamente
- Visualizar informações claras sobre entrega
- Confirmar pedido via WhatsApp

**Casos de Uso:**
- Acessar página do restaurante
- Navegar pelo cardápio
- Adicionar itens ao carrinho
- Preencher dados para entrega
- Finalizar pedido via WhatsApp

---

## 🔧 Funcionalidades Detalhadas

### **Dashboard Administrativo**

#### **1. Autenticação**
- **Login seguro** com email/senha
- **Recuperação de senha** via email
- **Sessão persistente** com logout automático
- **Proteção contra força bruta**

#### **2. Configurações do Restaurante**
- **Informações Básicas**
  - Nome do restaurante
  - Descrição/bio
  - Telefone principal
  - Endereço completo
  - Horário de funcionamento (por dia da semana)
  
- **Configurações de Entrega**
  - Taxa de entrega
  - Valor mínimo do pedido
  - Tempo estimado de entrega
  - Raio de entrega

- **Integração WhatsApp**
  - Número do WhatsApp para pedidos
  - Mensagem personalizada de confirmação
  - Template de pedido customizável

#### **3. Gestão de Cardápio**
- **Categorias**
  - Criar/editar/excluir categorias
  - Ordenar categorias por prioridade
  - Ativar/desativar categorias
  
- **Produtos**
  - Adicionar produtos com foto, nome, descrição, preço
  - Organizar produtos por categoria
  - Marcar produtos como "em destaque"
  - Ativar/desativar produtos temporariamente
  - Definir opções/complementos (tamanhos, adicionais)

#### **4. Personalização Visual**
- **Identidade Visual**
  - Upload de logo
  - Seleção de cores primária e secundária
  - Escolha de fonte
  - Imagem de fundo (opcional)
  
- **Layout**
  - Estilo do cabeçalho
  - Disposição dos produtos
  - Estilo dos botões

#### **5. Configurações Avançadas**
- **Status do Restaurante**
  - Aberto/Fechado manual
  - Horário automático
  - Mensagem personalizada quando fechado
  
- **Notificações**
  - Alertas de novos pedidos
  - Configuração de sons
  - Integração com email

### **Interface do Cliente**

#### **1. Página Principal**
- **Cabeçalho**
  - Logo do restaurante
  - Status (aberto/fechado)
  - Informações de contato
  - Indicador de carrinho
  
- **Cardápio**
  - Listagem por categorias
  - Filtro por categoria
  - Busca por nome do produto
  - Cards de produtos com foto, nome, preço
  - Botão "Adicionar ao Carrinho"

#### **2. Carrinho de Compras**
- **Funcionalidades**
  - Adicionar/remover itens
  - Alterar quantidade
  - Visualizar subtotal
  - Calcular taxa de entrega
  - Aplicar cupons (futura implementação)

#### **3. Processo de Checkout**
- **Dados do Cliente**
  - Nome completo
  - Telefone
  - Email (opcional)
  
- **Endereço de Entrega**
  - Endereço completo
  - Ponto de referência
  - Observações especiais
  
- **Método de Pagamento**
  - Dinheiro
  - PIX
  - Cartão (débito/crédito)
  - Observações sobre pagamento

#### **4. Finalização**
- **Resumo do Pedido**
  - Itens selecionados
  - Dados de entrega
  - Método de pagamento
  - Valor total
  
- **Envio para WhatsApp**
  - Geração automática de mensagem
  - Redirecionamento para WhatsApp
  - Confirmação de envio

---

## 🛠️ Especificações Técnicas

### **Arquitetura**
- **Frontend:** React/Next.js com TypeScript
- **Backend:** Node.js/Express com TypeScript
- **Banco de Dados:** PostgreSQL
- **Autenticação:** JWT
- **Upload de Imagens:** Cloudinary
- **Hospedagem:** Vercel (Frontend) + Railway (Backend)

### **Estrutura do Banco de Dados**

#### **Tabela: restaurants**
```sql
- id (UUID, PK)
- slug (VARCHAR, UNIQUE)
- name (VARCHAR)
- description (TEXT)
- phone (VARCHAR)
- whatsapp (VARCHAR)
- address (TEXT)
- opening_hours (JSONB)
- delivery_fee (DECIMAL)
- minimum_order (DECIMAL)
- is_active (BOOLEAN)
- theme_config (JSONB)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### **Tabela: categories**
```sql
- id (UUID, PK)
- restaurant_id (UUID, FK)
- name (VARCHAR)
- description (TEXT)
- order_priority (INTEGER)
- is_active (BOOLEAN)
- created_at (TIMESTAMP)
```

#### **Tabela: products**
```sql
- id (UUID, PK)
- category_id (UUID, FK)
- name (VARCHAR)
- description (TEXT)
- price (DECIMAL)
- image_url (VARCHAR)
- is_featured (BOOLEAN)
- is_active (BOOLEAN)
- options (JSONB)
- created_at (TIMESTAMP)
```

#### **Tabela: admin_users**
```sql
- id (UUID, PK)
- restaurant_id (UUID, FK)
- email (VARCHAR, UNIQUE)
- password_hash (VARCHAR)
- name (VARCHAR)
- created_at (TIMESTAMP)
- last_login (TIMESTAMP)
```

### **APIs Principais**

#### **Admin APIs**
- `POST /api/admin/login` - Login do administrador
- `GET /api/admin/restaurant/:slug` - Dados do restaurante
- `PUT /api/admin/restaurant/:slug` - Atualizar restaurante
- `GET /api/admin/categories` - Listar categorias
- `POST /api/admin/categories` - Criar categoria
- `PUT /api/admin/categories/:id` - Atualizar categoria
- `DELETE /api/admin/categories/:id` - Deletar categoria
- `GET /api/admin/products` - Listar produtos
- `POST /api/admin/products` - Criar produto
- `PUT /api/admin/products/:id` - Atualizar produto
- `DELETE /api/admin/products/:id` - Deletar produto
- `POST /api/admin/upload` - Upload de imagem

#### **Client APIs**
- `GET /api/restaurant/:slug` - Dados públicos do restaurante
- `GET /api/restaurant/:slug/menu` - Cardápio completo
- `POST /api/orders/whatsapp` - Gerar link do WhatsApp

### **Integração WhatsApp**

#### **Geração de Link**
```javascript
const whatsappLink = `https://wa.me/${restaurantPhone}?text=${encodeURIComponent(orderMessage)}`;
```

#### **Template de Mensagem**
```
🍴 *Novo Pedido - ${restaurantName}*

👤 *Cliente:* ${customerName}
📱 *Telefone:* ${customerPhone}
📍 *Endereço:* ${deliveryAddress}

🛍️ *Pedido:*
${orderItems.map(item => `• ${item.quantity}x ${item.name} - R$ ${item.price}`).join('\n')}

💰 *Total:* R$ ${totalAmount}
💳 *Pagamento:* ${paymentMethod}
🚚 *Entrega:* ${deliveryType}

---
⏰ Pedido realizado em: ${timestamp}
```

---

## 🔒 Segurança e Validações

### **Autenticação e Autorização**
- Senhas com hash bcrypt
- JWT com expiração de 24h
- Refresh tokens para renovação
- Rate limiting para APIs sensíveis

### **Validações de Entrada**
- Sanitização de dados de entrada
- Validação de formato de email/telefone
- Validação de tipos de arquivo para upload
- Proteção contra XSS e SQL injection

### **Privacidade**
- Dados do cliente não são armazenados
- Logs de acesso com retenção limitada
- Compliance com LGPD

---

## 📱 Responsividade e Performance

### **Mobile-First Design**
- Interface otimizada para smartphones
- Touch-friendly (botões com pelo menos 44px)
- Navegação intuitiva com gestos
- Carregamento progressivo de imagens

### **Performance**
- Lazy loading de imagens
- Compressão de assets
- Cache estratégico
- Otimização de queries SQL

### **PWA Features**
- Instalação no dispositivo
- Funcionamento offline básico
- Notificações push (futura implementação)

---

## 🧪 Testes e Qualidade

### **Testes Unitários**
- Cobertura mínima de 80%
- Testes de funções críticas
- Mocks para APIs externas

### **Testes de Integração**
- Fluxo completo de pedido
- Integração com WhatsApp
- Upload de imagens

### **Testes de Usabilidade**
- Tempo de conclusão de pedido
- Taxa de abandono do carrinho
- Facilidade de uso do admin

---

## 🚀 Roadmap de Desenvolvimento

### **Sprint 1 (2 semanas) - Fundação**
- Setup do projeto e arquitetura
- Autenticação básica
- Estrutura do banco de dados
- Dashboard admin básico

### **Sprint 2 (2 semanas) - CRUD Básico**
- Gestão de categorias
- Gestão de produtos
- Upload de imagens
- Configurações básicas do restaurante

### **Sprint 3 (2 semanas) - Interface do Cliente**
- Página principal do restaurante
- Listagem de produtos
- Carrinho de compras
- Responsividade mobile

### **Sprint 4 (2 semanas) - Checkout e WhatsApp**
- Processo de checkout
- Integração com WhatsApp
- Geração de mensagens
- Testes de fluxo completo

### **Sprint 5 (1 semana) - Personalização**
- Sistema de temas
- Configurações visuais
- Preview em tempo real
- Otimizações de performance

### **Sprint 6 (1 semana) - Polimento**
- Correção de bugs
- Melhorias de UX
- Testes finais
- Documentação

---

## 🎨 Guia de Design

### **Princípios de Design**
- **Simplicidade:** Interface limpa e intuitiva
- **Consistência:** Padrões visuais uniformes
- **Acessibilidade:** Contraste adequado, navegação por teclado
- **Performance:** Carregamento rápido e responsivo

### **Componentes Principais**
- Cards de produtos padronizados
- Botões de ação consistentes
- Formulários com validação visual
- Modais e overlays para ações secundárias

### **Paleta de Cores Padrão**
- Primária: #3B82F6 (azul)
- Secundária: #10B981 (verde)
- Neutra: #6B7280 (cinza)
- Sucesso: #059669 (verde escuro)
- Erro: #DC2626 (vermelho)

---

## 📊 Métricas e Analytics

### **Métricas do Admin**
- Tempo médio de configuração inicial
- Frequência de uso do dashboard
- Número de produtos cadastrados
- Taxa de ativação de recursos

### **Métricas do Cliente**
- Taxa de conversão (visitante → pedido)
- Tempo médio no site
- Taxa de abandono do carrinho
- Valor médio do pedido

### **Métricas Técnicas**
- Tempo de resposta das APIs
- Uptime do sistema
- Taxa de erro
- Uso de recursos do servidor

---

## 🔧 Configuração e Deploy

### **Ambiente de Desenvolvimento**
- Node.js 18+
- PostgreSQL 14+
- Redis para cache
- Docker para containerização

### **Ambiente de Produção**
- Auto-scaling configurado
- Backup automático do banco
- Monitoramento de logs
- SSL/TLS obrigatório

### **CI/CD Pipeline**
- Testes automáticos
- Deploy automático para staging
- Deploy manual para produção
- Rollback automático em caso de erro

---

## 📝 Considerações Finais

### **Riscos e Mitigações**
- **Dependência do WhatsApp:** Implementar fallback via email
- **Sobrecarga do servidor:** Auto-scaling e cache eficiente
- **Segurança:** Auditoria regular e updates de segurança

### **Próximos Passos**
1. Aprovação do PRD
2. Definição da equipe de desenvolvimento
3. Setup do ambiente de desenvolvimento
4. Início do Sprint 1

### **Suporte e Manutenção**
- Documentação técnica completa
- Guia de troubleshooting
- Processo de atualização
- Suporte técnico estruturado