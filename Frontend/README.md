# IKaody — prototype de transfert d'argent par QR code

Application Angular (web) illustrant le parcours : saisie du montant → génération d'un QR code → scan par le destinataire → confirmation de réception.

## Démarrer en local

```bash
npm install
npm start
```

Puis ouvrez http://localhost:4200.

## Parcours implémenté

- `/` — accueil avec solde (recalculé à partir de l'historique), section Historique, et deux actions : Envoyer / Recevoir
- `/envoyer` — saisie du montant, génération d'un QR code (librairie `qrcode`), partage / copie / enregistrement de l'image
- `/recevoir` — scan caméra ou import d'une image de QR (librairie `html5-qrcode`), puis écran de confirmation

## Historique des transactions

Chaque envoi (génération d'un QR) et chaque réception (scan réussi) est enregistré dans `localStorage`, sous la clé `ikaody-history`. C'est propre à chaque navigateur/appareil — il n'y a pas de synchronisation entre appareils tant qu'il n'y a pas de backend. Le solde affiché à l'accueil est recalculé à partir de cet historique (solde de départ +/- transactions).

Chaque transaction envoyée a un statut **« En attente »** tant qu'on ignore si le destinataire l'a scannée (ce prototype n'a pas de backend pour le confirmer) ; les réceptions, elles, sont toujours marquées comme terminées puisque l'argent est déjà crédité localement.

## Important — ceci est un prototype front-end uniquement

Toutes les informations de la transaction (montant, expéditeur, référence) sont encodées **directement dans le QR code**, sans backend. C'est volontaire pour la démonstration, mais **ce n'est pas suffisant pour une vraie application financière**. Avant d'aller en production, il faudrait a minima :

- Un backend qui valide chaque transaction et vérifie le solde de l'expéditeur.
- Un mécanisme empêchant qu'un même QR code soit scanné deux fois (le QR ne devrait contenir qu'un identifiant, pas le montant réel).
- De l'authentification pour l'expéditeur et le destinataire.
- Un chiffrement / une signature du contenu du QR pour éviter la falsification.

## Prochaines étapes possibles

- Brancher un vrai backend (API REST) à la place du `TransferService`.
- Ajouter un historique des transactions.
- Ajouter l'authentification.
