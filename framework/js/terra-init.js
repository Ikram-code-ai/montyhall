import CTABanner from './CTABanner.js';
import Modal from './modal.js';

const banner = new CTABanner();
const modalFactory = new Modal(banner);

// Récupérer le conteneur de navigation personnalisé
const navContainer = document.getElementById('nav-container');

const navButtons = [
  { id: 'btn-accueil', label: '🏠 Accueil', title: "Je reviens au hub Terra" },
  { id: 'btn-stats', label: '📊 Statistiques', title: "Je veux voir mes chiffres" },
  { id: 'btn-rejouer-top', label: '🔄 Rejouer', title: "Je relance une manche" }
];

navButtons.forEach(({ id, label, title }) => {
  // Créer un bouton directement dans le DOM
  const btn = document.createElement('button');
  btn.id = id;
  btn.type = 'button';
  btn.className = 'tn-nav-btn';
  btn.textContent = label;
  btn.title = title;
  
  // L'ajouter au conteneur de navigation personnalisé
  if (navContainer) {
    navContainer.appendChild(btn);
  }
});

const modal = modalFactory.getPermanentModal({
  title: 'Briefing Monty Hall',
  id: 'terra-briefing',
  position: { right: 4, top: 18 },
  width: '320px',
  theme: 'light'
});

if (modal.clear) {
  modal.clear();
}

modal.addLabel("Je résume vite fait : Monty cache un cadeau derrière une porte et balance une chèvre pour te piéger.", {
  bold: true,
  fontSize: '16px'
});
modal.addLabel("Choisis une porte, attends que Monty ouvre une chèvre, puis décide si tu restes ou si tu switches.");
modal.addSeparator();
modal.addLabel("Pro tips Terra Numerica", { bold: true });
modal.addLabel("Changer double tes chances, mais je ne t'empêche pas de tenter le coup de poker.");
modal.addButton('Je veux rejouer', () => {
  document.getElementById('btn-rejouer-top')?.click();
});
modal.addButton('Je check mes stats', () => {
  document.getElementById('btn-stats')?.click();
});
