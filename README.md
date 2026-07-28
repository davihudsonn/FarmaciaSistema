# 💊 Sistema de Controle de Falta de Medicamentos

Um sistema web desenvolvido para auxiliar farmácias no gerenciamento de medicamentos em falta, permitindo registrar solicitações, acompanhar pedidos e organizar o processo de reposição de estoque de forma simples, rápida e intuitiva.

O projeto foi criado pensando principalmente em pequenas e médias farmácias que ainda realizam esse controle de maneira manual, oferecendo uma solução prática para reduzir perdas, facilitar a comunicação da equipe e melhorar a organização dos pedidos.

---

## 🚀 Tecnologias Utilizadas

* React
* JavaScript (ES6+)
* Vite
* Tailwind CSS
* Supabase
* React Query
* Lucide React
* Date-fns

---

## ✨ Funcionalidades

### 📋 Registro de medicamentos em falta

* Cadastro de medicamentos em falta.
* Registro do responsável pela anotação.
* Seleção da categoria do medicamento.
* Campo para observações.
* Registro automático da data e hora da anotação.

---

### 📦 Controle de pedidos

Cada medicamento possui um fluxo completo de acompanhamento:

* ⏳ Pendente
* 📦 Pedido Realizado
* ✅ Pedido Chegou

Também são registrados automaticamente:

* Data da anotação
* Data do pedido
* Data da chegada
* Quantidade recebida

---

### 🔍 Pesquisa por EAN

O sistema permite informar o código de barras (EAN) do medicamento.

Ao localizar um cadastro existente, o sistema:

* identifica automaticamente o medicamento;
* preenche informações já cadastradas;
* exibe laboratório, categoria e responsável;
* reduz erros de digitação.

Também existe a opção **EAN desconhecido** para medicamentos sem código disponível.

---

### 🏷️ Sugestões Inteligentes

Durante o preenchimento dos campos, o sistema fornece sugestões automáticas para:

* Medicamentos
* Laboratórios
* Responsáveis

Essas sugestões são baseadas nos registros já existentes, tornando o cadastro muito mais rápido.

---

### 🧬 Medicamentos OL

O sistema possui suporte para medicamentos de Operador Logístico (OL).

Ao marcar essa opção, a lista de laboratórios é filtrada automaticamente para exibir apenas os laboratórios configurados para OL, facilitando o processo de cadastro.

---

### ⚠️ Detecção de medicamentos duplicados

Quando um medicamento já foi registrado anteriormente, o sistema apresenta um histórico contendo:

* Última anotação
* Último pedido
* Última chegada
* Quantidade registrada
* Status atual

Isso evita registros desnecessários e melhora o acompanhamento dos pedidos.

---

### 📊 Dashboard

O sistema possui um painel com indicadores para acompanhamento das solicitações, permitindo visualizar rapidamente a situação dos medicamentos cadastrados.

---

### 🗂️ Organização por categorias

Os medicamentos podem ser classificados em:

* 💊 Genérico / Similar
* 💊 Controlado
* 💊 Antibiótico
* 🚼 Fralda
* 💅 Cosmético
* 💊 Ético

---

### ✏️ Gerenciamento completo

O sistema permite:

* Criar registros
* Editar informações
* Atualizar status
* Excluir pedidos
* Pesquisar medicamentos
* Filtrar informações

---

## 🎯 Objetivo

O objetivo deste projeto é facilitar o controle interno de medicamentos em falta dentro de farmácias, proporcionando maior organização, redução de retrabalho e melhor acompanhamento do processo de reposição de estoque.

---

## 📸 Interface

O sistema possui uma interface moderna, responsiva e intuitiva, desenvolvida para tornar o registro e o acompanhamento dos medicamentos rápidos e simples para qualquer colaborador da farmácia.

---

## 📌 Melhorias Futuras

* Controle de usuários e permissões
* Histórico completo de alterações
* Relatórios em PDF
* Exportação para Excel
* Notificações de pedidos pendentes
* Dashboard com gráficos
* Controle de distribuidores
* Registro de movimentações

---

## 👨‍💻 Desenvolvedor

Desenvolvido por **Davi Hudson Frazao** como projeto de estudos e aperfeiçoamento em desenvolvimento Full Stack, aplicando conceitos de React, Supabase, banco de dados, gerenciamento de estado e construção de interfaces modernas.
