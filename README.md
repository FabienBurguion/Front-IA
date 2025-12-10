Requirements:

Un .env avec:

REACT_APP_API_PROXY=http://localhost
DANGEROUSLY_DISABLE_HOST_CHECK=true
HOST=localhost

Avoir le docker de l'ia lancé en local sur le port 80.
Si ce n'est pas le cas, update la variable REACT_APP_API_PROXY, et lui ajouter :<PORT>