# Mnemio Frontend

## Tecnologias

- Expo (React Native)
- React
- Axios (chamadas HTTP)

## Setup

```bash
npm install
cp .env.example .env
```

### Login com Google

1. Acesse https://console.cloud.google.com/apis/credentials
2. Crie um OAuth client ID tipo **Web application** (funciona no Expo Go e web via proxy do Expo).
   - Authorized redirect URI: `https://auth.expo.io/@SEU_USUARIO_EXPO/mnemio`
3. (Opcional, build standalone) crie client IDs **iOS** e **Android** também.
4. Cole os IDs em `.env`:
   - `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
   - `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`
   - `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`

Tela de login fica em `screens/LoginScreen.js`. Tem espaço reservado pro logo (`logoPlaceholder`) — troque por `<Image>` quando tiver a arte.

## Rodando

```bash
npm start      # Metro bundler (escolha android/ios/web)
npm run web    # atalho direto pro web
```

Tela inicial busca `GET http://localhost:8000/` no backend (FastAPI) via axios e mostra `Hello API`.

> Rodando em dispositivo físico ou emulador Android, troque `localhost` em `App.js` pelo IP da máquina host.
