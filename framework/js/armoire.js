import * as THREE from 'three';
import { Products } from './products.js';

export default class armoire {
    /** create the cupboard that hold the different object that when click on it, we will be redirect to other games
     * @param {number} w - width of the cupboard
     * @param {number} d - depth of the cupboard
     * @param {number} h - height of the cupboard
     * @returns {THREE.Group} The cupboard
     * @memberof armoire
     */
    constructor(w, d, h) {
        this.cupboardElement = new THREE.Group();
        this.size = { width: w, depth: d, height: h };
        this.createCupboard(w, d, h);
        
        // Add products to the cupboard
        this.products = new Products();
        // Adjust the number of products per shelf based on how many games you have
        const productsPerShelf = 5;
        const totalGames = this.products.gameLinks.length;
        
        this.products.createProducts(w, 25, 20, productsPerShelf);
        this.cupboardElement.add(this.products.getProducts());
    }
    
    /**
     * Create the cupboard
     * Create each part of the cupboard to add them to a same group. It will be easier to move the cupboard.
     * @returns {THREE.Group} The cupboard
     * @memberof armoire
     */
    createCupboard(w, d, h) {
       // Create the plane where we will put the objects 
       // the cupboard is a frame create by 4 walls and a bottom and a top and 2 shelves
        const cupboard = new THREE.BoxGeometry(w, h, d);
        const cupboardMaterial = new THREE.MeshStandardMaterial({ color: 'white', side: THREE.DoubleSide });
        const cupboardMesh = new THREE.Mesh(cupboard, cupboardMaterial);
        cupboardMesh.rotation.x = Math.PI / 2;
        cupboardMesh.position.set(0, 0, -80);
        cupboardMesh.name = "cupboard";
        this.cupboardElement.add(cupboardMesh);

        // Create the bottom shelves of the cupboard
        const bottom = new THREE.BoxGeometry(w, 1, 25);
        const bottomMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
        const bottomMesh = new THREE.Mesh(bottom, bottomMaterial);
        bottomMesh.position.set(0, h/1, -70);
        bottomMesh.name = "bottom";
        this.cupboardElement.add(bottomMesh);

        // Create the top shelves of the cupboard
        const top = new THREE.BoxGeometry(w, 1, 25);
        const topMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
        const topMesh = new THREE.Mesh(top, topMaterial);
        topMesh.position.set(0, h/0.3, -70);
        topMesh.name = "top";
        this.cupboardElement.add(topMesh);


      
    }

    
    getCupboard() {
        return this.cupboardElement;
    }
    
    getProducts() {
        return this.products;
    }
}
