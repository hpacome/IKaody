# IKaody — prototype de transfert d'argent par QR code

Application Angular (web) illustrant le parcours : saisie du montant → génération d'un QR code → scan par le destinataire → confirmation de réception.

## Démarrer en local

```bash
npm install
npm start
```

Puis ouvrez http://localhost:4200.

## Parcours implémenté

- `/` — accueil avec solde et deux actions : Envoyer / Recevoir
- `/envoyer` — saisie du montant, génération d'un QR code (librairie `qrcode`)
- `/recevoir` — ouverture de la caméra et scan du QR (librairie `html5-qrcode`), puis écran de confirmation

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
