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

## Busca de mídias

O botão "+" das listas abre `components/MediaSearchScreen.js`, que busca em tempo real
nas fontes externas pelo backend (`GET /busca`): TMDB para filmes, séries e doramas,
Google Books para livros. O que o usuário escolher vai para o formulário já preenchido,
com `media_ref` — é isso que liga a avaliação ao catálogo.

- Debounce de 350 ms e `AbortController` cancelando a busca anterior: uma request por
  pausa da digitação, não por tecla.
- Se a fonte externa estiver fora, a tela mostra um aviso discreto e os resultados que já
  estiverem em cache — nunca um alerta de erro.
- "Cadastrar manualmente" continua disponível para o que a fonte não tiver.

O app cuida de livros, séries, filmes e doramas. Anime foi removido da interface (a API
da AniList está desativada), mas os dados continuam na API — voltar é reinserir as
entradas em `screens/midias/midiaTypes.js`, `mediaProgress.js`, `context/ThemeContext.js`,
`resources.js` e `screens/HomeScreen.js`.

Como a busca e o cache funcionam do lado do servidor: `docs/busca-e-cache-de-midias.md`
no repositório da API.

## Rodando

```bash
npm start      # Metro bundler (escolha android/ios/web)
npm run web    # atalho direto pro web
```

Tela inicial busca `GET http://localhost:8000/` no backend (FastAPI) via axios e mostra `Hello API`.

> Rodando em dispositivo físico ou emulador Android, troque `localhost` em `App.js` pelo IP da máquina host.
