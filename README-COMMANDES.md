# 📬 Système de commandes O'SAMBOUSSA
## Email automatique (EmailJS) + Google Sheets

Ce guide te permet de configurer en **15 minutes** la réception automatique
des commandes par email ET dans un Google Sheets.

---

## PARTIE 1 — EmailJS (tu reçois un email à chaque commande)

### Étape 1 — Créer un compte EmailJS
1. Va sur https://www.emailjs.com
2. Clique **Sign Up** (gratuit — 200 emails/mois)
3. Connecte-toi avec ton Google ou email

### Étape 2 — Connecter ta boîte mail
1. Dans le menu gauche : **Email Services**
2. Clique **Add New Service**
3. Choisis **Gmail** (ou Outlook si tu utilises lalaprods@outlook.fr)
4. Clique **Connect Account** et autorise
5. Dans "Service ID" note bien l'identifiant (ex: `service_abc123`)
   → C'est ton **SERVICE_ID**

### Étape 3 — Créer le template d'email
1. Dans le menu gauche : **Email Templates**
2. Clique **Create New Template**
3. Colle ce contenu dans le champ "Content" :

```
🥟 NOUVELLE COMMANDE O'SAMBOUSSA
Référence : {{order_ref}}
Date       : {{order_date}}

━━━ CLIENT ━━━━━━━━━━━━━━━━━━
Nom      : {{client_nom}}
Téléphone: {{client_tel}}
Adresse  : {{client_adresse}}
Ville    : {{client_ville}}
Message  : {{client_msg}}

━━━ COMMANDE ━━━━━━━━━━━━━━━━
{{panier_detail}}

TOTAL    : {{total_ttc}}
Économies: {{economies}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Répondre au client : {{client_tel}}
```

4. Dans "To Email" mets : lalaprods@outlook.fr
5. Dans "Subject" mets : 🥟 Commande {{order_ref}} — {{client_nom}} — {{total_ttc}}
6. Clique **Save**
7. Note le **Template ID** (ex: `template_xyz789`)

### Étape 4 — Récupérer ta Public Key
1. Dans le menu gauche : **Account** → **General**
2. Copie ta **Public Key** (ex: `user_ABCDEFGH12345`)

### Étape 5 — Coller les clés dans le code
Ouvre `src/App.jsx` et remplace ces lignes vers la ligne 1220 :

```js
const EMAILJS_SERVICE_ID  = "service_abc123";      // ← ton Service ID
const EMAILJS_TEMPLATE_ID = "template_xyz789";     // ← ton Template ID
const EMAILJS_PUBLIC_KEY  = "user_ABCDEFGH12345";  // ← ta Public Key
```

---

## PARTIE 2 — Google Sheets (tableau de bord des commandes)

### Étape 1 — Créer le Google Sheets
1. Va sur https://sheets.google.com
2. Crée un nouveau fichier, nomme-le **Commandes O'SAMBOUSSA**
3. Dans la ligne 1, mets ces en-têtes (une par colonne) :
   `Référence | Date | Nom | Téléphone | Adresse | Ville | Message | Panier | Total (€) | Économies (€)`

### Étape 2 — Créer le script Google Apps Script
1. Dans ton Sheets, clique **Extensions** → **Apps Script**
2. Supprime tout le code existant
3. Colle ce code :

```javascript
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data  = JSON.parse(e.postData.contents);
    sheet.appendRow([
      data.ref       || "",
      data.date      || "",
      data.nom       || "",
      data.telephone || "",
      data.adresse   || "",
      data.ville     || "",
      data.message   || "",
      data.panier    || "",
      data.total     || "",
      data.economies || "",
    ]);
    return ContentService
      .createTextOutput(JSON.stringify({status:"OK"}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({status:"ERROR", message:err.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

4. Clique sur **Enregistrer** (icône disquette)
5. Clique **Déployer** → **Nouveau déploiement**
6. Clique l'icône ⚙️ → choisis **Application Web**
7. Dans "Qui a accès" → choisis **Tout le monde**
8. Clique **Déployer**
9. Autorise les permissions demandées
10. **Copie l'URL** qui apparaît (elle ressemble à :
    `https://script.google.com/macros/s/XXXXX/exec`)
    → C'est ton **SHEETS_WEBHOOK_URL**

### Étape 3 — Coller l'URL dans le code
Dans `src/App.jsx`, remplace :

```js
const SHEETS_WEBHOOK_URL = "https://script.google.com/macros/s/XXXXX/exec";
```

---

## PARTIE 3 — Tester

1. Lance le site : `npm run dev`
2. Ajoute un produit au panier
3. Remplis le formulaire et valide
4. Vérifie :
   - ✅ Tu reçois un email sur lalaprods@outlook.fr
   - ✅ Une ligne apparaît dans ton Google Sheets

---

## En cas de problème

- **Email non reçu** : vérifie les spams + vérifie que les 3 clés EmailJS sont correctes
- **Sheets ne se remplit pas** : vérifie que le déploiement Apps Script est "Tout le monde"
- **Erreur sur le site** : ouvre la console du navigateur (F12) pour voir le message d'erreur

## Support

📞 Si tu bloques, contacte-nous directement.
