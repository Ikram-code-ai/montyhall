import * as THREE from 'three';
// ===========================
// État du jeu
// ===========================
let etatJeu = "choix";
let porteAvecCadeau = 0;
let porteChoisie = null;
let porteOuverte = null;
let aChangeLorsDernierePartie = null;
let nbParties = 0;
let nbGagneEnChangeant = 0;
let nbGagneSansChanger = 0;
// ===========================
// Configuration Three.js
// ===========================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
const container = document.getElementById("jeu");
const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.set(0, 2, 10);
camera.lookAt(0, 0, 0);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);
// Lumières
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 10, 7);
directionalLight.castShadow = true;
directionalLight.shadow.camera.left = -10;
directionalLight.shadow.camera.right = 10;
directionalLight.shadow.camera.top = 10;
directionalLight.shadow.camera.bottom = -10;
scene.add(directionalLight);
// Sol
const floorGeometry = new THREE.PlaneGeometry(20, 10);
const floorMaterial = new THREE.MeshStandardMaterial({
    color: 0x8b7355,
    roughness: 0.8
});
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -2;
floor.receiveShadow = true;
scene.add(floor);
const portes3D = [];
function creerPorte(x, index) {
    const group = new THREE.Group();
    group.position.set(x, 0, 0);
    // Cadre de la porte
    const frameGeometry = new THREE.BoxGeometry(2.2, 4.2, 0.3);
    const frameMaterial = new THREE.MeshStandardMaterial({
        color: 0x654321,
        roughness: 0.7
    });
    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    frame.castShadow = true;
    frame.receiveShadow = true;
    group.add(frame);
    // Porte elle-même (qui va s'ouvrir)
    const doorGeometry = new THREE.BoxGeometry(2, 4, 0.2);
    const doorMaterial = new THREE.MeshStandardMaterial({
        color: 0x0f4d99,
        roughness: 0.3,
        metalness: 0.2
    });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(0, 0, 0.15);
    door.castShadow = true;
    door.receiveShadow = true;
    // Point de pivot pour l'ouverture
    door.geometry.translate(1, 0, 0);
    door.position.x = -1;
    group.add(door);
    scene.add(group);
    return { group, door, frame, isOpen: false, targetRotation: 0, index };
}
// Création des 3 portes
portes3D.push(creerPorte(-4, 0));
portes3D.push(creerPorte(0, 1));
portes3D.push(creerPorte(4, 2));
// ===========================
// Création des objets 3D
// ===========================
// Cadeau 3D
function creerCadeau() {
    const group = new THREE.Group();
    // Boîte
    const boxGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
    const boxMaterial = new THREE.MeshStandardMaterial({
        color: 0xff1744,
        roughness: 0.3,
        metalness: 0.1
    });
    const box = new THREE.Mesh(boxGeometry, boxMaterial);
    box.castShadow = true;
    group.add(box);
    // Ruban horizontal
    const ribbonH = new THREE.Mesh(new THREE.BoxGeometry(1, 0.15, 0.85), new THREE.MeshStandardMaterial({ color: 0xffd700 }));
    ribbonH.castShadow = true;
    group.add(ribbonH);
    // Ruban vertical
    const ribbonV = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1, 0.85), new THREE.MeshStandardMaterial({ color: 0xffd700 }));
    ribbonV.castShadow = true;
    group.add(ribbonV);
    // Nœud
    const bow = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), new THREE.MeshStandardMaterial({ color: 0xffd700 }));
    bow.position.y = 0.5;
    bow.castShadow = true;
    group.add(bow);
    group.position.y = -1.6;
    group.visible = false;
    return group;
}
// Chèvre 3D (stylisée)
function creerChevre() {
    const group = new THREE.Group();
    // Corps
    const bodyGeometry = new THREE.CapsuleGeometry(0.3, 0.6, 8, 16);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.rotation.z = Math.PI / 2;
    body.position.y = -1.3;
    body.castShadow = true;
    group.add(body);
    // Tête
    const headGeometry = new THREE.SphereGeometry(0.25, 16, 16);
    const head = new THREE.Mesh(headGeometry, bodyMaterial);
    head.position.set(0.5, -1.1, 0);
    head.castShadow = true;
    group.add(head);
    // Cornes
    const hornGeometry = new THREE.ConeGeometry(0.08, 0.3, 8);
    const hornMaterial = new THREE.MeshStandardMaterial({ color: 0x8b7355 });
    const horn1 = new THREE.Mesh(hornGeometry, hornMaterial);
    horn1.position.set(0.55, -0.9, -0.15);
    horn1.rotation.z = -0.3;
    horn1.castShadow = true;
    group.add(horn1);
    const horn2 = new THREE.Mesh(hornGeometry, hornMaterial);
    horn2.position.set(0.55, -0.9, 0.15);
    horn2.rotation.z = -0.3;
    horn2.castShadow = true;
    group.add(horn2);
    // Pattes
    const legGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.5);
    const legMaterial = new THREE.MeshStandardMaterial({ color: 0x8b8b8b });
    for (let i = 0; i < 4; i++) {
        const leg = new THREE.Mesh(legGeometry, legMaterial);
        leg.position.set(i < 2 ? 0.2 : -0.2, -1.8, i % 2 === 0 ? -0.15 : 0.15);
        leg.castShadow = true;
        group.add(leg);
    }
    group.visible = false;
    return group;
}
// Création des objets pour chaque porte
const objetsDerrierePortes = [];
for (let i = 0; i < 3; i++) {
    const cadeau = creerCadeau();
    cadeau.position.set(portes3D[i].group.position.x, 0, -0.5);
    scene.add(cadeau);
    objetsDerrierePortes.push(cadeau);
    const chevre = creerChevre();
    chevre.position.set(portes3D[i].group.position.x, 0, -0.5);
    scene.add(chevre);
    objetsDerrierePortes.push(chevre);
}
// ===========================
// Raycasting pour détection de clic
// ===========================
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
function onMouseClick(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    // Collecter tous les objets cliquables
    const clickableObjects = [];
    portes3D.forEach(p => {
        clickableObjects.push(p.door);
        clickableObjects.push(p.frame);
    });
    const intersects = raycaster.intersectObjects(clickableObjects);
    if (intersects.length > 0) {
        const clicked = intersects[0].object;
        const porteCliquee = portes3D.find(p => p.door === clicked || p.frame === clicked);
        if (porteCliquee) {
            gererClicPorte(porteCliquee.index);
        }
    }
}
renderer.domElement.addEventListener('click', onMouseClick);
// ===========================
// Éléments UI
// ===========================
const messageElt = document.getElementById("message");
const boutonRejouerBas = document.getElementById("rejouer");
const boutonRejouerTop = document.getElementById("btn-rejouer-top");
const boutonAccueil = document.getElementById("btn-accueil");
const boutonStats = document.getElementById("btn-stats");
// ===========================
// Gestion du jeu
// ===========================
function ouvrirPorte(index) {
    portes3D[index].targetRotation = -Math.PI / 2;
    portes3D[index].isOpen = true;
}
function fermerPorte(index) {
    portes3D[index].targetRotation = 0;
    portes3D[index].isOpen = false;
}
function montrerObjet(index, estCadeau) {
    const cadeauIndex = index * 2;
    const chevreIndex = index * 2 + 1;
    objetsDerrierePortes[cadeauIndex].visible = estCadeau;
    objetsDerrierePortes[chevreIndex].visible = !estCadeau;
}
function cacherTousLesObjets() {
    objetsDerrierePortes.forEach(obj => obj.visible = false);
}
function lancerNouvellePartie() {
    etatJeu = "choix";
    porteAvecCadeau = Math.floor(Math.random() * 3);
    porteChoisie = null;
    porteOuverte = null;
    aChangeLorsDernierePartie = null;
    // Fermer toutes les portes
    portes3D.forEach((porte, i) => {
        fermerPorte(i);
        porte.door.material.color.setHex(0x0f4d99);
        porte.door.material.emissive.setHex(0x000000);
    });
    cacherTousLesObjets();
    messageElt.textContent = "Choisis une porte.";
}
function gererClicPorte(index) {
    if (etatJeu === "termine") {
        return;
    }
    if (etatJeu === "choix") {
        porteChoisie = index;
        // Highlight de la porte choisie
        portes3D.forEach((p, i) => {
            if (i === index) {
                p.door.material.color.setHex(0x1ea3ff);
                p.door.material.emissive.setHex(0x1ea3ff);
                p.door.material.emissiveIntensity = 0.3;
            }
            else {
                p.door.material.color.setHex(0x0f4d99);
                p.door.material.emissive.setHex(0x000000);
                p.door.material.emissiveIntensity = 0;
            }
        });
        // Révéler une chèvre
        const indicesPossibles = [0, 1, 2].filter((i) => i !== porteChoisie && i !== porteAvecCadeau);
        porteOuverte = indicesPossibles[Math.floor(Math.random() * indicesPossibles.length)];
        if (porteOuverte !== null) {
            ouvrirPorte(porteOuverte);
            setTimeout(() => {
                montrerObjet(porteOuverte, false);
            }, 800);
        }
        messageElt.textContent = "Je révèle une porte sans cadeau. Tu gardes ou tu changes ?";
        etatJeu = "switch";
        return;
    }
    if (etatJeu === "switch") {
        if (porteChoisie === null)
            return;
        aChangeLorsDernierePartie = index !== porteChoisie;
        porteChoisie = index;
        revelerResultat();
    }
}
function revelerResultat() {
    if (porteChoisie === null)
        return;
    etatJeu = "termine";
    nbParties += 1;
    // Ouvrir toutes les portes
    for (let i = 0; i < 3; i++) {
        if (i !== porteOuverte) {
            ouvrirPorte(i);
        }
        setTimeout(() => {
            if (i === porteAvecCadeau) {
                montrerObjet(i, true);
                portes3D[i].door.material.color.setHex(0x38c586);
            }
            else if (i !== porteOuverte) {
                montrerObjet(i, false);
                portes3D[i].door.material.color.setHex(0xf0774d);
            }
        }, 800 + i * 200);
    }
    const gagne = porteChoisie === porteAvecCadeau;
    setTimeout(() => {
        if (gagne) {
            messageElt.textContent = "🎉 Gagné ! Le cadeau était bien ici !";
            if (aChangeLorsDernierePartie) {
                nbGagneEnChangeant += 1;
            }
            else {
                nbGagneSansChanger += 1;
            }
        }
        else {
            messageElt.textContent = "😢 Raté pour cette fois, mais Monty adore qu'on retente.";
        }
    }, 1500);
}
function verifierFinPartieEt(action) {
    if (etatJeu !== "termine") {
        alert("⏳ Tu dois d'abord finir la partie avant d'utiliser ce bouton.");
        return;
    }
    action();
}
function afficherStats() {
    const texte = `Nombre de parties : ${nbParties}\n` +
        `Victoires en changeant de porte : ${nbGagneEnChangeant}\n` +
        `Victoires en gardant la même porte : ${nbGagneSansChanger}`;
    alert(texte);
}
// ===========================
// Boucle d'animation
// ===========================
function animate() {
    requestAnimationFrame(animate);
    // Animation d'ouverture des portes
    portes3D.forEach(porte => {
        const currentRotation = porte.door.rotation.y;
        const diff = porte.targetRotation - currentRotation;
        if (Math.abs(diff) > 0.01) {
            porte.door.rotation.y += diff * 0.1;
        }
    });
    // Petite rotation des objets
    objetsDerrierePortes.forEach((obj, i) => {
        if (obj.visible) {
            obj.rotation.y += 0.01;
        }
    });
    renderer.render(scene, camera);
}
// ===========================
// Événements
// ===========================
boutonRejouerBas.addEventListener("click", () => verifierFinPartieEt(lancerNouvellePartie));
boutonRejouerTop.addEventListener("click", () => verifierFinPartieEt(lancerNouvellePartie));
boutonAccueil.addEventListener("click", () => verifierFinPartieEt(lancerNouvellePartie));
boutonStats.addEventListener("click", () => verifierFinPartieEt(afficherStats));
// Responsive
window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
});
// Lancement
lancerNouvellePartie();
animate();
