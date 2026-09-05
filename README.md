# Mnemio Frontend

## Tecnologias

- Expo (React Native)
- React
- Axios (chamadas HTTP)

## Setup

```bash
npm install
```

## Rodando

```bash
npm start      # Metro bundler (escolha android/ios/web)
npm run web    # atalho direto pro web
```

Tela inicial busca `GET http://localhost:8000/` no backend (FastAPI) via axios e mostra `Hello API`.

> Rodando em dispositivo físico ou emulador Android, troque `localhost` em `App.js` pelo IP da máquina host.
