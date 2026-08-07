# 💊 Sistema de Controle de Falta de Medicamentos

Um sistema web desenvolvido para auxiliar farmácias no gerenciamento de medicamentos em falta, permitindo registrar solicitações, acompanhar pedidos e organizar o processo de reposição de estoque de forma simples, rápida e intuitiva.

O projeto foi criado pensando principalmente em pequenas e médias farmácias que ainda realizam esse controle de maneira manual, oferecendo uma solução prática para reduzir perdas, facilitar a comunicação da equipe e melhorar a organização dos pedidos.

---

## 🚀 Tecnologias Utilizadas

* **React**
* **JavaScript (ES6+)**
* **Vite**
* **Tailwind CSS**
* **Supabase**
* **React Query**
* **Lucide React**
* **Date-fns**

---

## ✨ Funcionalidades

### 🔐 Autenticação de Usuários

O sistema possui autenticação para controlar o acesso à aplicação.

* Tela de login.
* Autenticação de usuários.
* Proteção do acesso ao sistema.
* Encerramento de sessão (Logout).
* Redirecionamento para a tela de login após sair.
* Integração com o sistema de autenticação do Supabase.

---

### 📋 Registro de medicamentos em falta

O sistema permite registrar medicamentos que estão em falta na farmácia.

* Cadastro de medicamentos em falta.
* Registro do responsável pela anotação.
* Seleção da categoria do medicamento.
* Registro do laboratório.
* Campo para observações.
* Registro automático da data e hora da anotação.
* Identificação de medicamentos OL.

---

### 📦 Controle de pedidos

Cada medicamento possui um fluxo completo de acompanhamento:

* ⏳ **Pendente**
* 📦 **Pedido Realizado**
* ✅ **Pedido Chegou**

Também são registrados:

* Data da anotação.
* Data do pedido.
* Data da chegada.
* Quantidade recebida.
* Status atual do pedido.

---

### 🔍 Pesquisa por EAN

O sistema permite informar o código de barras (**EAN**) do medicamento.

Ao localizar um cadastro existente, o sistema:

* Identifica automaticamente o medicamento.
* Preenche informações já cadastradas.
* Exibe laboratório, categoria e responsável.
* Reduz erros de digitação.
* Facilita o registro de medicamentos.

Também existe a opção **EAN desconhecido** para medicamentos sem código disponível.

---

### 🏷️ Sugestões Inteligentes

Durante o preenchimento dos campos, o sistema fornece sugestões automáticas baseadas nos registros existentes.

As sugestões estão disponíveis para:

* Medicamentos.
* Laboratórios.
* Responsáveis.

Isso torna o cadastro mais rápido e reduz a necessidade de digitação repetitiva.

---

### 🧬 Medicamentos OL

O sistema possui suporte para medicamentos de **Operador Logístico (OL)**.

Ao marcar a opção OL durante o cadastro, o sistema identifica que o medicamento pertence a essa categoria e permite trabalhar com os laboratórios configurados para esse tipo de operação.

Essa funcionalidade facilita o cadastro e reduz erros na seleção do laboratório.

---

### 🔎 Filtros de Medicamentos OL

O sistema possui filtros específicos para facilitar a visualização dos medicamentos relacionados a **Operadores Logísticos (OL)**.

É possível:

* Visualizar medicamentos OL.
* Separar medicamentos OL dos demais registros.
* Localizar rapidamente pedidos relacionados a OL.
* Facilitar o acompanhamento dos pedidos.
* Organizar melhor a consulta dos medicamentos.

---

### ⚠️ Detecção de medicamentos duplicados

Quando um medicamento já foi registrado anteriormente, o sistema apresenta informações do histórico para evitar registros desnecessários.

São exibidos dados como:

* Última anotação.
* Último pedido.
* Última chegada.
* Quantidade registrada.
* Status atual.

Essa funcionalidade ajuda a evitar duplicidades e melhora o acompanhamento do processo de reposição.

---

### 📊 Dashboard

O sistema possui um **Dashboard** para acompanhamento geral das solicitações.

O painel permite visualizar rapidamente informações relacionadas aos medicamentos cadastrados e ao andamento dos pedidos.

Os indicadores auxiliam a equipe a identificar a situação atual dos registros e acompanhar o fluxo de reposição.

---

### 🗂️ Organização por categorias

Os medicamentos podem ser classificados de acordo com suas categorias:

* 💊 **Genérico / Similar**
* 💊 **Controlado**
* 💊 **Antibiótico**
* 🚼 **Fralda**
* 💅 **Cosmético**
* 💊 **Ético**

---

### 📤 Exportação para Excel

O sistema permite exportar os dados dos medicamentos e pedidos para **Excel**, facilitando:

* Análise dos registros.
* Compartilhamento das informações.
* Organização dos pedidos.
* Criação de controles externos.
* Consulta e armazenamento dos dados.

---

### ✏️ Gerenciamento completo

O sistema permite realizar diversas operações sobre os registros:

* Criar registros.
* Editar informações.
* Atualizar status.
* Excluir pedidos.
* Pesquisar medicamentos.
* Filtrar informações.
* Visualizar medicamentos OL.
* Exportar informações para Excel.
* Acompanhar indicadores através do Dashboard.
* Gerenciar a sessão do usuário.

---

## 🎯 Objetivo

O objetivo deste projeto é facilitar o controle interno de medicamentos em falta dentro de farmácias, proporcionando maior organização, redução de retrabalho e melhor acompanhamento do processo de reposição de estoque.

A aplicação busca substituir processos manuais, como anotações em papel ou planilhas, por uma solução web centralizada e de fácil utilização.

Além disso, o sistema foi desenvolvido para permitir que a equipe acompanhe o status dos pedidos, identifique medicamentos OL, pesquise registros rapidamente e tenha uma visão geral das solicitações através do Dashboard.

---

## 🖥️ Interface

O sistema possui uma interface moderna, responsiva e intuitiva, desenvolvida para tornar o registro e o acompanhamento dos medicamentos rápidos e simples para os colaboradores da farmácia.

A aplicação conta com:

* 🔐 Tela de login.
* 📊 Dashboard.
* 📋 Cadastro de medicamentos.
* 📦 Gerenciamento de pedidos.
* 🔍 Pesquisa por EAN.
* 🔎 Filtros de pesquisa.
* 🧬 Filtro de medicamentos OL.
* 📤 Exportação para Excel.
* 🔄 Controle de sessão do usuário.

---

## 🛠️ Conceitos e Práticas Aplicados

Durante o desenvolvimento do projeto foram aplicados conceitos de:

* Desenvolvimento Front-end.
* Desenvolvimento Full Stack.
* Componentização com React.
* Gerenciamento de estado.
* Consumo de APIs.
* Integração com banco de dados.
* Autenticação de usuários.
* Controle de sessão.
* Operações CRUD.
* Pesquisa e filtragem de dados.
* Validação de informações.
* Responsividade.
* Organização de componentes.
* Gerenciamento de pedidos.
* Exportação de dados.
* Controle de versões com Git e GitHub.

---

## 📌 Melhorias Futuras

Algumas funcionalidades planejadas para futuras versões:

* Controle de usuários e permissões.
* Diferentes níveis de acesso para usuários.
* Histórico completo de alterações.
* Relatórios em PDF.
* Notificações de pedidos pendentes.
* Gráficos e indicadores mais avançados.
* Controle de distribuidores.
* Registro detalhado de movimentações.
* Recuperação de senha.

---

## 👨‍💻 Desenvolvedor

Desenvolvido por **Davi Hudson Frazao** como projeto de estudos e aperfeiçoamento em desenvolvimento Full Stack.

O projeto foi desenvolvido com o objetivo de aplicar, na prática, conhecimentos em **React, JavaScript, Supabase, autenticação, banco de dados, gerenciamento de estado, CRUD, integração de dados e construção de interfaces modernas**.

---

## 📚 Projeto

Este projeto faz parte do processo de aprendizado e aperfeiçoamento em desenvolvimento de software, buscando aplicar conceitos utilizados no desenvolvimento de sistemas reais e na resolução de problemas do cotidiano de uma farmácia.
