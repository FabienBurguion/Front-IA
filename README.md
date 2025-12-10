## 🛠️ Installation et Configuration

### 1. Variables d'environnement

Créez un fichier `.env` à la racine du projet avec le contenu suivant :

```env
REACT_APP_API_PROXY=http://localhost
DANGEROUSLY_DISABLE_HOST_CHECK=true
HOST=localhost
```

### 2. Prérequis Docker

Le conteneur Docker de l'IA doit être lancé localement sur le port **80**.

> **⚠️ Port personnalisé**
>
> Si Docker tourne sur un autre port (ex: `8080`), modifiez la variable `REACT_APP_API_PROXY` en ajoutant le port à la fin :
>
> ```env
> REACT_APP_API_PROXY=http://localhost:8080
> ```