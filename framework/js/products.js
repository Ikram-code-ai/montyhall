import * as THREE from 'three';

/**
 * Class representing a collection of product items with interactive capabilities.
 * Used to populate shelves with game products that can be clicked to open their URLs.
 */
export class Products {
    /**
     * Creates a new Products instance.
     * Initializes a collection of educational games with their URLs and creates a THREE.Group to hold them.
     */
    constructor() {
        this.products = new THREE.Group();
        this.gameLinks = [
            { name: "Coloration dans les graphes en ligne", url: "https://scratch.mit.edu/projects/487885073/fullscreen/" },
            { name: "Compendre PageRank en ligne", url: "https://scratch.mit.edu/projects/555332313/fullscreen/" },
            { name: "Monty Hall en ligne", url: "https://scratch.mit.edu/projects/558471406/fullscreen/" },
            { name: "Algorithme des fourmis en ligne", url: "https://terra-numerica.github.io/simulation-mobilite-robot/antMath/index.html" },
            { name: "TaxiBot en ligne", url: "https://portail.terra-numerica.org/taxibot/home/index.html" },
            { name: "Jeu de la tablette de chocolat", url: "https://projet.liris.cnrs.fr/~mam/valise/#chocolat" },
            { name: "Jeu de la contamination/vie en ligne", url: "https://scratch.mit.edu/projects/517390361/fullscreen/" },
            { name: "Bloque moi si tu peux", url: "https://projet.liris.cnrs.fr/~mam/valise/#nim" },
            { name: "Dessin sans lever le crayon", url: "https://projet.liris.cnrs.fr/~mam/valise/#dessin" },
            { name: "Crêpier psychorigide en ligne", url: "https://terra-numerica.github.io/crepe-maker/" },
        ];
        
        /**
         * Array to store references to product mesh objects for interaction.
         * @type {Array<THREE.Mesh>}
         */
        this.productMeshes = [];
    }

    /**
     * Creates 3D product objects and positions them on shelves.
     * Products are created as colored boxes with associated game information.
     * 
     * @param {number} shelfWidth - Width of the shelf in world units
     * @param {number} shelfDepth - Depth of the shelf in world units
     * @param {number} maxHeight - Maximum height available for products
     * @param {number} [productsPerShelf=5] - Maximum number of products per shelf row
     */
    createProducts(shelfWidth, shelfDepth, maxHeight, productsPerShelf = 5) {
        // Vérification et normalisation des paramètres
        shelfWidth = Number(shelfWidth) || 100;
        shelfDepth = Number(shelfDepth) || 25;
        maxHeight = Number(maxHeight) || 20;
        productsPerShelf = Number(productsPerShelf) || 5;
        
        console.log("Creating products with dimensions:", 
                   {shelfWidth, shelfDepth, maxHeight, productsPerShelf});
        
        // Calculate product dimensions to fit the shelves
        const productWidth = (shelfWidth * 0.9) / productsPerShelf;
        const productHeight = maxHeight * 0.8; // 80% of available height
        const productDepth = shelfDepth * 0.8; // 80% of shelf depth
        
        console.log("Product dimensions:", {productWidth, productHeight, productDepth});
        
        const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff, 0xffa500];
        
        this.gameLinks.forEach((game, index) => {
            try {
                // Create product geometry with random color
                const product = new THREE.BoxGeometry(
                    Math.max(1, productWidth),
                    Math.max(1, productHeight),
                    Math.max(1, productDepth)
                );
                const colorIndex = index % colors.length;
                const productMaterial = new THREE.MeshStandardMaterial({ 
                    color: colors[colorIndex], 
                    emissive: 0x000000,
                    side: THREE.DoubleSide 
                });
                
                const productMesh = new THREE.Mesh(product, productMaterial);
                
                // Position products across shelves
                const shelfNumber = Math.floor(index / productsPerShelf);
                const positionInShelf = index % productsPerShelf;
                
                // Calculate x position (centered on shelf with spacing)
                const totalProductsWidth = productWidth * Math.min(productsPerShelf, this.gameLinks.length);
                const startX = -shelfWidth/2 + productWidth/2 + (shelfWidth - totalProductsWidth)/2;
                const x = startX + positionInShelf * productWidth;
                
                // y position depends on which shelf (0 = bottom, 1 = top in this case)
                let y, z;
                if (shelfNumber === 0) {
                    y = maxHeight/2; // Position for bottom shelf
                    z = -70;  // Z position aligned with shelf
                } else {
                    y = maxHeight * 1.7; // Position for top shelf
                    z = -70;
                }
                
                productMesh.position.set(x, y, z);
                productMesh.name = game.name;
                productMesh.userData = { 
                    url: game.url,
                    originalColor: colors[colorIndex],
                    isProduct: true
                };
                
                this.productMeshes.push(productMesh);
                this.products.add(productMesh);
                console.log(`Added product: ${game.name} at position:`, {x, y, z});
            } catch (error) {
                console.error(`Error creating product ${game.name}:`, error);
            }
        });
    }

    /**
     * Returns the THREE.Group containing all product objects.
     * 
     * @returns {THREE.Group} Group containing all product meshes
     */
    getProducts() {
        return this.products;
    }
    
    /**
     * Returns an array of all product mesh objects for interaction handling.
     * 
     * @returns {Array<THREE.Mesh>} Array of all product mesh objects
     */
    getAllProductMeshes() {
        return this.productMeshes;
    }
}