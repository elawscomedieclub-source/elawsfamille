# Notre Belle Famille – mise en ligne et synchronisation

## 1. Mise en ligne (HTTPS obligatoire pour le micro et l'installation)
Déposez tous les fichiers sur Netlify, Vercel, GitHub Pages ou Render (site statique).

## 2. Synchronisation entre téléphones (Firebase, gratuit)
1. console.firebase.google.com : créer un projet, ajouter une application Web, copier `firebaseConfig`.
2. Dans index.html, remplacer `const FIREBASE_CONFIG = null;` par `const FIREBASE_CONFIG = { ... };`.
3. Authentication > Sign-in method : activer « Anonyme ».
4. Firestore Database (mode production) > Règles :

       rules_version = '2';
       service cloud.firestore {
         match /databases/{db}/documents {
           match /familles/{code} {
             allow get, create, update: if request.auth != null && code.size() >= 16;
             allow list, delete: if false;
           }
         }
       }

5. Storage (vocaux) > Règles :

       rules_version = '2';
       service firebase.storage {
         match /b/{bucket}/o {
           match /familles/{code}/audios/{f} {
             allow read: if request.auth != null;
             allow write: if request.auth != null && request.resource.size < 5 * 1024 * 1024
                          && request.resource.contentType.matches('audio/.*');
           }
         }
       }

6. Déployer. Dans Paramètres > « Synchronisation famille », le bureau clique sur « Générer », enregistre le code,
   puis envoie à la famille le lien `https://votre-site/#code=LE_CODE`. Le lien règle tout automatiquement.

## Sécurité : ce que cela protège
Le code famille est un secret long : sans lui, personne ne peut lire les données, même en connaissant la config.
Ne le publiez pas. Pour aller plus loin : Firebase App Check. Si le code fuite, générez-en un nouveau.

## Fonctions de l'application
Annuaire (ajout, modification, suppression, photo depuis le téléphone), anniversaires automatiques, calendrier
(export vers l'agenda du téléphone), cotisations et dépenses, messages texte et vocaux, annonces du secrétaire,
suggestions au président, rappels à l'ouverture, mode sombre automatique, sauvegarde JSON, installation sur l'écran d'accueil.
Les notifications fonctionnent à l'ouverture de l'application (pas de notification quand elle est fermée).

## Cotisations d'événement (Aînés / Jeunes)
- Chaque membre a un groupe (Aînés ou Jeunes), modifiable dans son profil.
- Le bureau ouvre une cotisation sur un événement (montant par personne + collecteur), à la création ou plus tard.
- Le collecteur (ou le Trésorier / Président) enregistre les versements et peut afficher ou masquer, séparément,
  la liste des Aînés et celle des Jeunes. Quand une liste est masquée, les autres membres voient seulement
  « Liste masquée par le collecteur » ; le total général de l'événement reste visible.
- Ces cotisations sont suivies par événement, séparément de la caisse générale.

## Réunion en vidéo (Jitsi Meet)
- Menu « 📹 Réunion vidéo » : « Réunion de famille maintenant », ou bouton « Rejoindre » sur un événement
  (le bureau coche « Réunion en vidéo » à la création, ou clique « Activer la vidéo » sur un événement existant).
- Seuls les membres connectés peuvent entrer ; leur nom s'affiche dans la réunion.
- La salle est privée : son nom contient le code famille (Paramètres > Synchronisation famille). Définissez ce code
  d'abord, sur chaque appareil (le lien `#code=...` le règle automatiquement).
- Par défaut (`VISIO.integre = false`), la réunion s'ouvre dans un nouvel onglet sur meet.jit.si, gratuit et sans
  installation. Le serveur public demande à la première personne qui lance la réunion de se connecter (Google, GitHub…) :
  elle devient l'animateur, les autres entrent directement.
- Pour afficher la visio DANS l'application, il faut votre propre serveur Jitsi (guide « Self-hosting » sur jitsi.github.io,
  un petit serveur Linux suffit), puis dans index.html : `const VISIO = { domaine: 'visio.votre-site.com', integre: true };`.
  Le serveur public meet.jit.si limite l'affichage intégré à 5 minutes, c'est pourquoi il n'est pas utilisé ainsi.

## Finitions de cette version
- Guide d'utilisation intégré (menu « ❓ Guide d'utilisation »), message d'accueil personnalisé.
- Le statut de cotisation « À jour » repart à zéro chaque mois ; journal de la caisse pour le Trésorier.
- Chaque membre peut changer son code secret ; l'administrateur peut télécharger et restaurer une sauvegarde complète.
- Navigation au clavier, meta de partage, message si JavaScript est désactivé.

## Événements : participation et modification
- Chaque membre connecté peut confirmer sa présence (« Je participe ») ; le nombre et la liste des participants s'affichent.
- Le bureau peut modifier un événement (✏️) en plus de l'ajouter ou le supprimer.

## Erreur de caisse : annulation à 3 approbations
- Le Trésorier (ou le Président) indique le motif et touche ↩ à côté de l'opération dans le journal de la caisse.
- La demande compte comme la 1re approbation ; 2 autres membres du bureau (Président, Secrétaire, Trésorier, adjoints
  compris) doivent approuver dans « 🛡️ Validations du bureau ». Chaque personne ne vote qu'une fois.
- À la 3e approbation, l'opération est annulée automatiquement (caisse corrigée, trace conservée dans le journal,
  cotisation du membre remise « En retard »). L'administrateur ne peut pas voter à la place du bureau.
- Il faut au moins 3 membres ayant une fonction au bureau (champ « Rôle » du profil : Président, Secrétaire, Trésorier).
- Les comptes rendus de réunion s'ajoutent sur chaque événement (bureau).

## Sondages
Le bureau publie une question avec 2 à 6 choix (menu « 🗳️ Sondages »). Chaque membre connecté vote une fois et peut
changer son vote jusqu'à la clôture. Les résultats s'affichent en pourcentages, sans les noms.

## Fichier _headers
Sur Netlify ou Cloudflare Pages, le fichier `_headers` ajoute des protections (interdiction d'intégrer le site dans
un autre site, pas de détection de type de fichier) et empêche la mise en cache du fichier `sw.js`. Sur un autre
hébergeur, il peut être ignoré sans conséquence.

## Premiers pas après la mise en ligne
1. Connectez-vous en « Administrateur » (ajoutez ?admin à l'adresse) : le premier code saisi est conservé.
2. Connectez-vous en « Président », « Trésorier », « Secrétaire » : chacun crée son code à la première connexion.
3. Remplacez les membres d'exemple par les vrais (Annuaire), puis activez la synchronisation (section 2).

## Fonctionnement
- Fusion automatique (plus de « dernier qui écrit écrase tout ») : les ajouts de chacun sont conservés ; les suppressions sont propagées.
- Les caisses (cotisations/dépenses) : en cas de modification simultanée, la plus récente l'emporte.
- Les codes personnels (connexion) restent propres à chaque appareil.
