import * as THREE from 'three';

export default class Table {
    constructor(w,d) {
        this.tableElement = new THREE.Group();
        this.size = {width : w, depth : d};

        this.createTable(w,d);
      }

      /**
       * Create the table
       * Create each part of the table to add them to a same group. It will be easier to move the table.
       * @returns {THREE.Group} The table
       * @memberof Table
       */
      createTable(w,d) {
          //Create the plane where we will put the objects
          const table = new THREE.PlaneGeometry(w, d);
          const tableMaterial = new THREE.MeshStandardMaterial({ color: 'white', side: THREE.DoubleSide});
          const tableMesh = new THREE.Mesh(table, tableMaterial);
          tableMesh.rotation.x = Math.PI / 2;
          tableMesh.position.set(0, 10, 0);
          tableMesh.name = "table";
          this.tableElement.add(tableMesh);

          const box = new THREE.BoxGeometry(w, 1, d);
          const boxMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
          const boxMesh = new THREE.Mesh(box, boxMaterial);
          boxMesh.position.set(0, 0, 0);
          boxMesh.name = "box";
          this.tableElement.add(boxMesh);

          //Create each poll to support the table
          const posW = w/2;
          const posD = d/2;

          const pole1 = this.createPole();
          pole1.position.set(-posW, 0, -posD);
          this.tableElement.add(pole1);

          const pole2 = this.createPole();
          pole2.position.set(posW, 0, -posD);
          this.tableElement.add(pole2);

          const pole3 = this.createPole();
          pole3.position.set(-posW, 0, posD);
          this.tableElement.add(pole3);

          const pole4 = this.createPole();
          pole4.position.set(posW, 0, posD);
          this.tableElement.add(pole4);

          //Create contour of the table
          this.createContour(w,d);

      }

      createContour(w,d){
            const contour = new THREE.BoxGeometry(w, 3, 1);
            const contourMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
            const contourMesh = new THREE.Mesh(contour, contourMaterial);
            contourMesh.position.set(0, 10, -d/2);
            contourMesh.name = "contour1";
            this.tableElement.add(contourMesh);

            const contour2 = new THREE.BoxGeometry(w, 3, 1);
            const contourMaterial2 = new THREE.MeshStandardMaterial({ color: 0x808080 });
            const contourMesh2 = new THREE.Mesh(contour2, contourMaterial2);
            contourMesh2.position.set(0, 10, d/2);
            contourMesh2.name = "contour2";
            this.tableElement.add(contourMesh2);

            const contour3 = new THREE.BoxGeometry(1, 3, d);
            const contourMaterial3 = new THREE.MeshStandardMaterial({ color: 0x808080 });
            const contourMesh3 = new THREE.Mesh(contour3, contourMaterial3);
            contourMesh3.position.set(-w/2, 10, 0);
            contourMesh3.name = "contour3";
            this.tableElement.add(contourMesh3);

            const contour4 = new THREE.BoxGeometry(1, 3, d);
            const contourMaterial4 = new THREE.MeshStandardMaterial({ color: 0x808080 });
            const contourMesh4 = new THREE.Mesh(contour4, contourMaterial4);
            contourMesh4.position.set(w/2, 10, 0);
            contourMesh4.name = "contour4";
            this.tableElement.add(contourMesh4);
        }

      createPole() {
          const pole = new THREE.Group();

          const cylinder = new THREE.CylinderGeometry(1, 1, 25,50);
          const cylinderMaterial = new THREE.MeshStandardMaterial({ color: 'grey' });
          const poleMesh = new THREE.Mesh(cylinder, cylinderMaterial);
          pole.add(poleMesh);

          return pole;

      }

      getTable() {
          return this.tableElement;
      }

      render() {
          return this.table;
        }
}

