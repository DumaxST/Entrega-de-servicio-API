# DUMAX BACKEND

An **api** for the project **entrega de servicio**

Author: **Erika F.**

Status : in-progress

---

## 🛠 System Requirements

Make sure you have the follosing installed:

- [Git](https://git-scm.com/) `>=2.34`
- [Node.js](https://nodejs.org/) `>=20`
- [npm](https://docs.npmjs.com/) `>=10.82`

Verify installation with:

```bash
git --version
node --version
npm --version
```

---

## 🌱 Branch workflow

- main → Production-ready branch (deployment target)

- develop → Integration branch for ongoing development
- story →
- epic →
- subtask →

---

## ⚙️ Setup

Clone the repo :

```bash
git clone git@github.com:<YourUsername>/Dumax_Backend-API.git
cd Dumax_Backend-Api
npm install
```

---
🔑 Environment Variables

This project requires some environment variables for sensitive configuration.

Copy the example file

```bash
 cp .env.example .env
```

Fill in the required values inside .env.

Example :

```env
TOKEN_SECRET=my-secret-token
```

## Development

Please read the [BE ARCHITECTURE.md](BE_ARCHITECTURE.md) for more information about the project structure and coding guidelines.

Also you could found the scripts available and how to use them.

## Notes about Platform endpoint

The platform is special because it handle some values and those values are handled by a secret manager
So, please read the [secret manager doc](secret-manager-setup.md) to understand how to work with those values.