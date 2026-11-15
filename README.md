# Notre Belle Famille – version serveur (Vercel + base de données Postgres)

Application web installable (PWA) pour la famille : annuaire, anniversaires, calendrier, cotisations et caisse,
messages et vocaux, sondages, élections, réunions vidéo. Les données sont dans une **vraie base de données** ;
toutes les règles de sécurité sont vérifiées **par le serveur**, pas par le téléphone.

## 1. Mise en ligne (une seule fois, environ 10 minutes)
1. Déposez ce dossier sur GitHub (les fichiers à la racine : `index.html`, `api/`, `lib/`, `package.json`, `vercel.json`…).
2. Sur vercel.com : « Add New > Project », choisissez le dépôt, puis « Deploy ».
3. Dans le projet Vercel : onglet **Storage** > « Create Database » > **Neon (Postgres)** > connectez-la au projet.
   Vercel ajoute tout seul la variable `DATABASE_URL`. Les tables se créent automatiquement.
4. Onglet **Settings > Environment Variables**, ajoutez :
   - `SESSION_SECRET` : une longue phrase aléatoire (40 caractères ou plus). Elle signe les connexions. Ne la partagez jamais.
   - `ADMIN_INITIAL_CODE` : un code de départ pour l'administrateur (8 caractères minimum).
   - `FAMILY_TZ` (facultatif) : fuseau horaire, par exemple `Africa/Lome` ou `Europe/Paris`.
5. Onglet **Deployments** : « Redeploy » pour prendre en compte les variables.

## 2. Premiers pas
1. Ouvrez le site, connectez-vous avec le nom **Administrateur** et le code `ADMIN_INITIAL_CODE`.
   L'application vous oblige aussitôt à choisir votre vrai code secret (8 caractères minimum).
   Ensuite `ADMIN_INITIAL_CODE` ne sert plus : vous pouvez le changer ou le supprimer dans Vercel.
2. Allez dans « Annuaire > Ajouter un membre » : à chaque ajout, un **code provisoire** s'affiche une seule fois.
   Remettez-le au membre : il se connecte avec son nom + ce code, puis choisit son propre code.
3. Ouvrez la fiche d'un membre pour lui donner son **titre et son rôle** (Président, Secrétaire, Trésorier, membre du bureau).
4. Le nom de la famille se règle dans Paramètres (bureau et administrateur).

## 3. Qui peut quoi (vérifié par le serveur)
| Action | Qui |
|---|---|
| Voir les données de la famille | Tout membre connecté (un visiteur ne voit rien) |
| Ajouter un membre, nom de la famille, événements, sondages, élections, annonces | Bureau et administrateur |
| Modifier son propre profil et son code | Chaque membre |
| Donner un titre ou un rôle, nommer un élu, retirer un membre du bureau | Administrateur seulement |
| Caisse (cotisations, dépenses) | Trésorier (et Président) |
| Annuler une opération de caisse | Demande du Trésorier + **3 approbations** de membres du bureau |
| Voir une liste de cotisation d'événement masquée | Collecteur, Trésorier, Président |
| Élire | Tous les membres votent ; l'administrateur nomme l'élu |

## 4. Sécurité mise en place
- Connexions vérifiées sur le serveur ; mots de passe chiffrés (scrypt) ; jamais envoyés ni stockés en clair.
- Session dans un cookie `HttpOnly` + `Secure` + `SameSite=Strict` (illisible par JavaScript) ; droits relus dans la base à chaque requête :
  un changement de rôle ou un code réinitialisé prend effet immédiatement.
- Blocage de 5 minutes après 5 mauvais codes ; code provisoire obligatoirement changé à la première connexion.
- Votes secrets : le serveur n'envoie jamais qui a voté quoi.
- Listes de cotisation masquées : les données masquées ne quittent même pas le serveur.
- En-têtes de sécurité et politique CSP dans `vercel.json` ; aucun accès sans connexion.
- Aucun mot de passe de départ n'existe dans le code : l'administrateur est créé avec `ADMIN_INITIAL_CODE` (variable secrète).
- Réinitialiser l'administrateur (code perdu) : dans la console Neon, exécutez `DELETE FROM comptes WHERE cle = 'admin';`
  puis reconnectez-vous avec `ADMIN_INITIAL_CODE`.

## 5. Mise à jour en direct
L'application interroge le serveur toutes les 8 secondes (et dès qu'on revient sur l'onglet) :
ce que fait le bureau apparaît chez tous les membres en quelques secondes. Chaque action personnelle est visible tout de suite chez soi.

## 6. Réunions vidéo (Jitsi Meet)
Menu « Réunion vidéo » ou bouton « Rejoindre » sur un événement. La salle est privée (nom secret généré par le serveur,
visible seulement des membres connectés). Par défaut la réunion s'ouvre sur meet.jit.si dans un nouvel onglet ; la première
personne qui la lance doit se connecter à un compte (Google, GitHub…). Pour l'afficher dans l'application, installez votre propre
serveur Jitsi puis réglez `const VISIO = { domaine: '...', integre: true }` dans `index.html`.

## 7. Limites à connaître
- Les vocaux sont enregistrés dans la base (maximum environ 1 Mo, soit quelques minutes). Neon gratuit : 0,5 Go de stockage.
- La mise à jour « en direct » est une interrogation régulière, pas une connexion permanente : un délai de quelques secondes est normal.
- Les notifications de rappel s'affichent à l'ouverture de l'application (il n'y a pas de notification quand elle est fermée).
- Changement de serveur ou de base : exportez d'abord une sauvegarde (Administrateur > « Sauvegarde (JSON) »).

## 8. Développement local (facultatif)
`node --no-warnings test/backend.js` lance 82 vérifications du serveur sur une base SQLite temporaire. `node test/local-server.js`
démarre le site sur http://localhost:8099 avec les mêmes règles (administrateur : `AdminInit1`).
