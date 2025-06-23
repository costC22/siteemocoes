# Site de Análise de Emoções - DUCPSI

Um site interativo para análise de emoções em tempo real, desenvolvido para o projeto DUCPSI.

## 🚀 Funcionalidades

- **Formulário de Análise Emocional**: 6 perguntas sobre diferentes aspectos emocionais
- **Gráficos em Tempo Real**: Visualização dinâmica das respostas usando Chart.js
- **Comunicação em Tempo Real**: Atualizações instantâneas via Socket.IO
- **Visualização Alternativa**: Toggle entre gráficos e dados tabulares
- **Interface Responsiva**: Design moderno e adaptável

## 🛠️ Tecnologias Utilizadas

- **Backend**: Node.js + Express
- **Comunicação em Tempo Real**: Socket.IO
- **Frontend**: HTML5, CSS3, JavaScript
- **Gráficos**: Chart.js
- **Hospedagem**: Render

## 📋 Pré-requisitos

- Node.js (versão 16 ou superior)
- npm ou yarn

## 🔧 Instalação Local

1. Clone o repositório:

```bash
git clone https://github.com/costC22/siteemocoes.git
cd siteemocoes
```

2. Instale as dependências:

```bash
npm install
```

3. Execute o servidor:

```bash
npm start
```

4. Acesse o site em: `http://localhost:3000`

## 🚀 Deploy no Render

### Método 1: Deploy Automático via GitHub

1. Acesse [render.com](https://render.com) e faça login
2. Clique em "New +" e selecione "Web Service"
3. Conecte seu repositório GitHub
4. Configure o serviço:
   - **Name**: `siteemocoes`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/health`

### Método 2: Deploy Manual

1. Faça push do código para o GitHub
2. No Render, crie um novo Web Service
3. Use as configurações do arquivo `render.yaml`

## 📊 Estrutura do Projeto

```
siteemocoes/
├── index.html          # Página principal
├── style.css           # Estilos CSS
├── script.js           # JavaScript do frontend
├── server.js           # Servidor Node.js
├── package.json        # Dependências e scripts
├── render.yaml         # Configuração do Render
└── README.md           # Documentação
```

## 🔌 Endpoints da API

- `GET /` - Página principal
- `GET /health` - Health check para o Render
- `POST /` - Recebe dados do formulário via Socket.IO

## 📈 Perguntas do Formulário

1. **Ansiedade**: Como você se sente em relação à ansiedade?
2. **Tranquilidade**: Você se sente tranquilo(a)?
3. **Acolhimento**: Você se sente acolhido(a)?
4. **Exclusão**: Você se sente excluído(a)?
5. **Irritação**: Você se sente irritado(a)?
6. **Desistência**: Você já pensou em desistir?

Cada pergunta tem 5 opções de resposta (1-5), onde 1 = "Discordo Totalmente" e 5 = "Concordo Totalmente".

## 🎨 Personalização

- **Cores**: Edite as variáveis CSS em `style.css`
- **Perguntas**: Modifique o HTML em `index.html`
- **Lógica**: Ajuste o JavaScript em `script.js`
- **Backend**: Configure o servidor em `server.js`

## 🐛 Solução de Problemas

### Problemas Comuns no Render

1. **Build falha**: Verifique se todas as dependências estão no `package.json`
2. **Servidor não inicia**: Confirme se o `startCommand` está correto
3. **Health check falha**: Verifique se a rota `/health` está funcionando

### Logs

Para ver os logs no Render:

1. Acesse o dashboard do seu serviço
2. Vá para a aba "Logs"
3. Verifique se há erros de build ou runtime

## 📝 Licença

Este projeto está sob a licença ISC.

## 👥 Contribuição

Para contribuir com o projeto:

1. Faça um fork do repositório
2. Crie uma branch para sua feature
3. Faça commit das mudanças
4. Abra um Pull Request

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs no Render
2. Teste localmente primeiro
3. Abra uma issue no GitHub

---

**Desenvolvido para o projeto DUCPSI** 🎓
