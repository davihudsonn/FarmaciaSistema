# 💊 Sistema de Controle de Falta de Medicamentos

Sistema web desenvolvido para auxiliar farmácias no gerenciamento de medicamentos em falta, permitindo registrar produtos, acompanhar pedidos, controlar o estoque e organizar informações de forma simples e eficiente.

O projeto foi desenvolvido utilizando **React**, **JavaScript**, **Supabase** e **Vite**, oferecendo uma interface moderna e responsiva para facilitar o uso no dia a dia.

---

## 🚀 Funcionalidades

- ✅ Cadastro de medicamentos em falta
- ✅ Edição completa dos pedidos
- ✅ Exclusão de pedidos
- ✅ Controle de status dos medicamentos
- ✅ Histórico de pedidos realizados e recebidos
- ✅ Pesquisa por nome, EAN, laboratório, categoria e responsável
- ✅ Filtros por status, categoria, laboratório e período
- ✅ Cadastro e leitura de código de barras (EAN)
- ✅ Opção de medicamento sem EAN
- ✅ Preenchimento automático de informações através do EAN
- ✅ Registro de responsável pelo pedido
- ✅ Registro do laboratório
- ✅ Controle de quantidade
- ✅ Datas automáticas de anotação, pedido e chegada
- ✅ Interface responsiva e intuitiva

---

## 📌 Fluxo dos Status

Cada medicamento passa pelas seguintes etapas:

- 🔴 Em Falta
- 🟡 Pendente
- 🟢 Pedido Realizado
- ✅ Pedido Chegou

---

## 🗂️ Categorias

O sistema permite organizar os medicamentos nas seguintes categorias:

- Ético
- Genérico
- Similar
- Controlado
- Antibiótico
- Cosmético
- Fralda

---

## 🔍 Pesquisa Inteligente

É possível localizar medicamentos pesquisando por:

- Nome
- Código EAN
- Laboratório
- Categoria
- Responsável
- Observações

---

## 📦 Informações armazenadas

Cada pedido registra:

- Medicamento
- Quantidade
- Código EAN
- Laboratório
- Categoria
- Responsável
- Observações
- Status
- Data da anotação
- Data do pedido
- Data da chegada

---

## 🛠️ Tecnologias utilizadas

- ⚛️ React
- 📜 JavaScript
- ⚡ Vite
- 🟢 Supabase
- 🎨 Tailwind CSS
- 🧩 shadcn/ui
- 🔄 React Query
- 🗄️ PostgreSQL

---

## 🎯 Objetivo do Projeto

Este projeto foi desenvolvido para solucionar uma necessidade real encontrada em uma farmácia, facilitando o controle de medicamentos em falta e o acompanhamento dos pedidos.

Além disso, serviu como prática para diversos conceitos de desenvolvimento web, como:

- Componentização
- Hooks do React
- CRUD completo
- Integração com banco de dados
- React Query
- Filtros e pesquisa
- Gerenciamento de estados
- Interface responsiva

---

## ▶️ Como executar o projeto

Clone o repositório:

```bash
git clone https://github.com/davihudsonn/FarmaciaSistema.git
```

Entre na pasta do projeto:

```bash
cd FarmaciaSistema
```

Instale as dependências:

```bash
npm install
```

Configure as variáveis de ambiente criando um arquivo `.env`:

```env
VITE_SUPABASE_URL=Sua_URL
VITE_SUPABASE_ANON_KEY=Sua_CHAVE
```

Execute o projeto:

```bash
npm run dev
```

---

## 📄 Licença

Este projeto está licenciado sob a licença MIT.

---

## 👨‍💻 Desenvolvedor

**Davi Hudson**

Estudante de Engenharia de Software apaixonado por desenvolvimento web e criação de soluções para problemas reais.

- GitHub: https://github.com/davihudsonn
- LinkedIn: *(adicione seu LinkedIn aqui)*
