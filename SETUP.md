# brrrain — Setup Guide

Guia completo para configurar Firebase + Google Auth e colocar o app em funcionamento.

---

## 1. Criar o projeto Firebase

1. Acesse [console.firebase.google.com](https://console.firebase.google.com)
2. Clique em **Adicionar projeto**
3. Escolha um nome (ex: `brrrain`)
4. Desative o Google Analytics se não quiser (opcional)
5. Clique em **Criar projeto**

---

## 2. Criar o app Web

Dentro do projeto Firebase:

1. Clique no ícone **`</>`** (Web) na tela inicial
2. Registre o app com um apelido (ex: `brrrain-web`)
3. **Não** marque "Firebase Hosting" por enquanto
4. Clique em **Registrar app**
5. Copie o objeto `firebaseConfig` que aparecer — você vai precisar dele no passo 5

Exemplo do que você vai ver:
```js
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "brrrain.firebaseapp.com",
  projectId: "brrrain",
  storageBucket: "brrrain.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc..."
};
```

---

## 3. Configurar o Firestore

1. No menu lateral: **Build → Firestore Database**
2. Clique em **Criar banco de dados**
3. Escolha **Iniciar no modo de produção** (as regras corretas estão na seção 6)
4. Selecione a região mais próxima (ex: `southamerica-east1` para São Paulo)
5. Clique em **Ativar**

---

## 4. Configurar a Autenticação Google

1. No menu lateral: **Build → Authentication**
2. Clique em **Começar**
3. Na aba **Método de login**, clique em **Google**
4. Ative o toggle **Ativar**
5. Preencha o **Nome público do projeto** (ex: `brrrain`)
6. Selecione seu **e-mail de suporte**
7. Clique em **Salvar**

> **GCP — domínio autorizado:** O `localhost` já está na lista por padrão para desenvolvimento.
> Para produção, adicione seu domínio em **Authentication → Settings → Domínios autorizados**.

---

## 5. Configurar o `.env`

Na raiz do projeto, copie o arquivo de exemplo:

```bash
cp .env.example .env
```

Preencha com os valores do `firebaseConfig` copiado no passo 2:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=brrrain.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=brrrain
VITE_FIREBASE_STORAGE_BUCKET=brrrain.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc...
```

Após preencher, reinicie o servidor de desenvolvimento:

```bash
npm run dev
```

---

## 6. Regras de Segurança do Firestore

No Firebase Console: **Firestore Database → Regras**

### Opção A — Apenas usuário autenticado (qualquer conta Google)

Adequado se você for o único com acesso ao app:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Opção B — Restrito ao seu e-mail (recomendado para uso pessoal)

Substitua `seu@email.com` pelo seu e-mail Google:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null
        && request.auth.token.email == "seu@email.com";
    }
  }
}
```

### Opção C — Restrito ao seu UID (mais seguro)

1. Faça login no app uma vez
2. No Firebase Console: **Authentication → Users** → copie seu UID
3. Use nas regras:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth.uid == "SEU_UID_AQUI";
    }
  }
}
```

Após editar, clique em **Publicar**.

---

## 7. Verificar se está tudo funcionando

1. `npm run dev` → acesse `http://localhost:5173`
2. Você deve ver a tela de login com o botão **Entrar com Google**
3. Clique e faça login com sua conta Google
4. Você deve ser redirecionado para o Dashboard
5. Adicione uma área/conceito diretamente no Firestore Console e veja aparecer em tempo real

---

## Estrutura das coleções no Firestore

O app usa as seguintes coleções no nível raiz:

| Coleção | Descrição |
|---|---|
| `areas` | Áreas de estudo (Programação, Matemática, etc.) |
| `concepts` | Conceitos dentro de cada área |
| `sessions` | Sessões de estudo realizadas |
| `flashcards` | Flashcards para revisão espaçada |

---

## Sem Firebase (modo desenvolvimento)

Se o `.env` não estiver preenchido, o app funciona com **dados demonstrativos** locais.
Nenhum login é necessário nesse modo — ideal para testar a UI sem configurar Firebase.
