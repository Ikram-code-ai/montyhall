type EtatJeu = "choix" | "switch" | "termine";

// je garde tout l'état du plateau ici
let etatJeu: EtatJeu = "choix";
let porteAvecCadeau = 0;
let porteChoisie: number | null = null;
let porteOuverte: number | null = null;
let aChangeLorsDernierePartie: boolean | null = null;

// je compte vite fait les stats pour l'écran Terra
let nbParties = 0;
let nbGagneEnChangeant = 0;
let nbGagneSansChanger = 0;

// je choppe mes éléments UI
const portes: HTMLButtonElement[] = [
  document.getElementById("porte1") as HTMLButtonElement,
  document.getElementById("porte2") as HTMLButtonElement,
  document.getElementById("porte3") as HTMLButtonElement,
];

const messageElt = document.getElementById("message") as HTMLParagraphElement;

const boutonRejouerBas = document.getElementById("rejouer") as HTMLButtonElement;
const boutonRejouerTop = document.getElementById("btn-rejouer-top") as HTMLButtonElement;
const boutonAccueil = document.getElementById("btn-accueil") as HTMLButtonElement;
const boutonStats = document.getElementById("btn-stats") as HTMLButtonElement;

// je remets tout en état neuf
function lancerNouvellePartie(): void {
  etatJeu = "choix";
  porteAvecCadeau = Math.floor(Math.random() * 3);
  porteChoisie = null;
  porteOuverte = null;
  aChangeLorsDernierePartie = null;

  portes.forEach((porte) => {
    porte.disabled = false;
    porte.textContent = "🚪";
    porte.classList.remove("gagne", "perdu", "ouverte", "selectionnee");
  });

  messageElt.textContent = "Choisis une porte.";
}

// je gère tout clic sur une porte
function gererClicPorte(index: number): void {
  if (etatJeu === "termine") {
    return;
  }

  if (etatJeu === "choix") {
    porteChoisie = index;

    // je montre clairement la porte sélectionnée
    portes.forEach((p) => p.classList.remove("selectionnee"));
    portes[index].classList.add("selectionnee");

    // je balance une porte chèvre histoire de teaser
    const indicesPossibles: number[] = [0, 1, 2].filter(
      (i) => i !== porteChoisie && i !== porteAvecCadeau
    );
    porteOuverte =
      indicesPossibles[Math.floor(Math.random() * indicesPossibles.length)];

    if (porteOuverte !== null) {
      portes[porteOuverte].classList.add("ouverte");
      portes[porteOuverte].textContent = "🐐";
      portes[porteOuverte].disabled = true;
    }

    messageElt.textContent =
      "Je révèle une porte sans cadeau. Tu gardes ou tu changes ?";
    etatJeu = "switch";
    return;
  }

  if (etatJeu === "switch") {
    if (porteChoisie === null) return;

    // je note si la personne a switché ou pas
    aChangeLorsDernierePartie = index !== porteChoisie;
    porteChoisie = index;

    revelerResultat();
  }
}

// je révèle toutes les portes et je mets à jour les stats
function revelerResultat(): void {
  if (porteChoisie === null) return;

  etatJeu = "termine";
  nbParties += 1;

  for (let i = 0; i < 3; i++) {
    if (i === porteAvecCadeau) {
      portes[i].textContent = "🎁";
      portes[i].classList.add("gagne");
    } else {
      portes[i].textContent = "🐐";
      portes[i].classList.add("perdu");
    }
    portes[i].disabled = true;
    portes[i].classList.remove("selectionnee");
  }

  const gagne = porteChoisie === porteAvecCadeau;

  if (gagne) {
    messageElt.textContent = "🎉 Gagné ! Le cadeau était bien ici !";
    if (aChangeLorsDernierePartie) {
      nbGagneEnChangeant += 1;
    } else {
      nbGagneSansChanger += 1;
    }
  } else {
    messageElt.textContent = "😢 Raté pour cette fois, mais Monty adore qu'on retente.";
  }
}

// je bloque les boutons Terra tant que la manche n'est pas close
function verifierFinPartieEt(action: () => void): void {
  if (etatJeu !== "termine") {
    alert("⏳ Tu dois d'abord finir la partie avant d'utiliser ce bouton.");
    return;
  }
  action();
}

// je balance les stats dans une alert simple
function afficherStats(): void {
  const texte =
    `Nombre de parties : ${nbParties}\n` +
    `Victoires en changeant de porte : ${nbGagneEnChangeant}\n` +
    `Victoires en gardant la même porte : ${nbGagneSansChanger}`;
  alert(texte);
}

// === branchement des événements ===
portes.forEach((porte, index) => {
  porte.addEventListener("click", () => gererClicPorte(index));
});

// je protège le bouton "rejouer" du bas
boutonRejouerBas.addEventListener("click", () =>
  verifierFinPartieEt(lancerNouvellePartie)
);

// je fais pareil pour le bouton Terra du haut
boutonRejouerTop.addEventListener("click", () =>
  verifierFinPartieEt(lancerNouvellePartie)
);

// je recycle le bouton accueil pour relancer le jeu local
boutonAccueil.addEventListener("click", () =>
  verifierFinPartieEt(lancerNouvellePartie)
);

// j'ouvre les stats quand on clique sur le bouton Terra
boutonStats.addEventListener("click", () =>
  verifierFinPartieEt(afficherStats)
);

// je lance une partie directe au chargement
lancerNouvellePartie();
