flowchart TD
    A[Usuário acessa o sistema] --> B{Tipo de acesso?}
    
    %% Fluxo Cliente
    B -->|Cliente| C[Acessa página do restaurante<br/>/slug]
    C --> D{Restaurante existe?}
    D -->|Não| E[Erro 404<br/>Restaurante não encontrado]
    D -->|Sim| F{Restaurante aberto?}
    F -->|Não| G[Exibe mensagem<br/>Restaurante fechado]
    F -->|Sim| H[Exibe cardápio<br/>e produtos ativos]
    
    H --> I[Cliente navega<br/>pelo cardápio]
    I --> J{Adicionar produto?}
    J -->|Sim| K[Adiciona ao carrinho]
    J -->|Não| L{Finalizar pedido?}
    K --> L
    L -->|Não| I
    L -->|Sim| M{Carrinho vazio?}
    M -->|Sim| N[Aviso: Carrinho vazio]
    M -->|Não| O[Formulário de dados<br/>do cliente]
    N --> I
    
    O --> P[Preenche nome,<br/>telefone, endereço]
    P --> Q[Seleciona método<br/>de pagamento]
    Q --> R[Resumo do pedido]
    R --> S{Confirmar pedido?}
    S -->|Não| O
    S -->|Sim| T[Gera mensagem<br/>do WhatsApp]
    T --> U[Redireciona para<br/>WhatsApp com mensagem]
    U --> V[Pedido enviado<br/>para restaurante]
    
    %% Fluxo Admin
    B -->|Admin| W[Acessa página de login<br/>/slug/admin]
    W --> X[Formulário de login]
    X --> Y[Insere email e senha]
    Y --> Z{Credenciais válidas?}
    Z -->|Não| AA[Erro de autenticação]
    Z -->|Sim| BB[Dashboard Admin]
    AA --> X
    
    BB --> CC{Ação do admin?}
    
    %% Configurações do Restaurante
    CC -->|Configurar Restaurante| DD[Configurações Gerais]
    DD --> EE[Edita nome, telefone,<br/>endereço, horários]
    EE --> FF[Configura WhatsApp<br/>e entrega]
    FF --> GG[Personaliza tema<br/>e cores]
    GG --> HH[Salva configurações]
    HH --> CC
    
    %% Gestão de Categorias
    CC -->|Gerenciar Categorias| II[Lista de categorias]
    II --> JJ{Ação na categoria?}
    JJ -->|Criar| KK[Formulário nova categoria]
    JJ -->|Editar| LL[Formulário editar categoria]
    JJ -->|Excluir| MM{Confirmar exclusão?}
    JJ -->|Voltar| CC
    
    KK --> NN[Preenche nome e descrição]
    LL --> NN
    NN --> OO[Salva categoria]
    OO --> II
    
    MM -->|Sim| PP[Remove categoria]
    MM -->|Não| II
    PP --> II
    
    %% Gestão de Produtos
    CC -->|Gerenciar Produtos| QQ[Lista de produtos]
    QQ --> RR{Ação no produto?}
    RR -->|Criar| SS[Formulário novo produto]
    RR -->|Editar| TT[Formulário editar produto]
    RR -->|Excluir| UU{Confirmar exclusão?}
    RR -->|Ativar/Desativar| VV[Altera status do produto]
    RR -->|Voltar| CC
    
    SS --> WW[Preenche nome, descrição,<br/>preço, categoria]
    TT --> WW
    WW --> XX[Upload da imagem]
    XX --> YY[Salva produto]
    YY --> QQ
    
    UU -->|Sim| ZZ[Remove produto]
    UU -->|Não| QQ
    ZZ --> QQ
    VV --> QQ
    
    %% Status do Restaurante
    CC -->|Alterar Status| AAA{Status atual?}
    AAA -->|Aberto| BBB[Marca como fechado]
    AAA -->|Fechado| CCC[Marca como aberto]
    BBB --> DDD[Atualiza status no banco]
    CCC --> DDD
    DDD --> CC
    
    %% Logout
    CC -->|Logout| EEE[Encerra sessão]
    EEE --> FFF[Redireciona para login]
    FFF --> W
    
    %% Estilos
    classDef clientFlow fill:#e1f5fe,stroke:#0277bd,stroke-width:2px
    classDef adminFlow fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef decision fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef error fill:#ffebee,stroke:#d32f2f,stroke-width:2px
    classDef success fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    
    class C,D,F,H,I,J,K,L,M,O,P,Q,R,S,T,U,V clientFlow
    class W,X,Y,Z,BB,CC,DD,EE,FF,GG,HH,II,JJ,KK,LL,NN,OO,PP,QQ,RR,SS,TT,WW,XX,YY,ZZ,VV,AAA,BBB,CCC,DDD,EEE,FFF adminFlow
    class B,D,F,J,L,M,S,Z,JJ,MM,RR,UU,AAA decision
    class E,AA,N error
    class V,HH,OO,YY,DDD success