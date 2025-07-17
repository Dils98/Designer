// Collapsible Door Model
function createCollapsibleDoor(params = {}) {
    const {
        width = 2.4,
        height = 2.4,
        depth = 0.1,
        color = 0x111111,
        frameColor = 0x333333
    } = params;

    const doorGroup = new THREE.Group();
    
    const material = new THREE.MeshStandardMaterial({ 
        color: color,
        metalness: 0.8,
        roughness: 0.2
    });
    const frameMaterial = new THREE.MeshBasicMaterial({ color: frameColor });

    // Calculate number of vertical bars based on door width
    // For wider doors, we need more bars
    const numVerticalBars = Math.max(5, Math.round(width * 5)); // 5 bars per meter, minimum 5 bars
    
    // Adjust spacing based on door width
    const spacing = width / (numVerticalBars - 1);
    const gateHeight = height;
    const barThickness = 0.05;

    const verticalBars = [];
    for (let i = 0; i < numVerticalBars; i++) {
        const bar = new THREE.Mesh(
            new THREE.BoxGeometry(barThickness, gateHeight, barThickness),
            material
        );
        // Distribute bars evenly across the door width
        bar.position.x = -width/2 + i * spacing;
        verticalBars.push(bar);
        doorGroup.add(bar);
    }

    // Calculate diamond grid based on door width
    const diamondsPerRow = Math.max(3, Math.round(width * 3)); // 3 diamonds per meter, minimum 3
    const diamondsPerCol = 5;
    const diamondHeight = gateHeight / (diamondsPerCol + 1);
    const diamondWidth = width / diamondsPerRow;

    const stripThickness = 0.03;
    const stripDepth = 0.01;
    const stripLength = Math.sqrt(diamondWidth * diamondWidth + diamondHeight * diamondHeight);
    const stripAngle = Math.atan(diamondHeight / diamondWidth);

    const diamonds = [];
    for (let i = 0; i < diamondsPerRow; i++) {
        for (let j = 0; j < diamondsPerCol; j++) {
            if (j === Math.floor(diamondsPerCol / 2)) continue; // skip middle row

            // Distribute diamonds evenly across door width
            const centerX = -width/2 + (i + 0.5) * (width / diamondsPerRow);
            const centerY = (j - (diamondsPerCol - 1) / 2) * diamondHeight;

            const upStrip = new THREE.Mesh(
                new THREE.BoxGeometry(stripLength, stripThickness, stripDepth),
                material
            );
            upStrip.position.set(centerX, centerY, 0);
            upStrip.rotation.z = -stripAngle;

            const downStrip = new THREE.Mesh(
                new THREE.BoxGeometry(stripLength, stripThickness, stripDepth),
                material
            );
            downStrip.position.set(centerX, centerY, 0);
            downStrip.rotation.z = stripAngle;

            diamonds.push({ up: upStrip, down: downStrip, baseX: centerX });
            doorGroup.add(upStrip);
            doorGroup.add(downStrip);
        }
    }

    // Create door frame with the correct width
    const frameThickness = 0.1;
    const frameWidth = width;
    
    const topBar = new THREE.Mesh(new THREE.BoxGeometry(frameWidth, frameThickness, barThickness), frameMaterial);
    topBar.position.y = gateHeight / 2 + frameThickness / 2;
    
    const bottom = new THREE.Mesh(new THREE.BoxGeometry(frameWidth, frameThickness, barThickness), frameMaterial);
    bottom.position.y = -gateHeight / 2 - frameThickness / 2;
    
    const left = new THREE.Mesh(new THREE.BoxGeometry(frameThickness, gateHeight + frameThickness * 2, barThickness), frameMaterial);
    left.position.x = -frameWidth / 2 + frameThickness / 2;
    
    const right = new THREE.Mesh(new THREE.BoxGeometry(frameThickness, gateHeight + frameThickness * 2, barThickness), frameMaterial);
    right.position.x = frameWidth / 2 - frameThickness / 2;

    doorGroup.add(topBar);
    doorGroup.add(bottom);
    doorGroup.add(left);
    doorGroup.add(right);

    // Add functionality to open/close the gate
    doorGroup.isOpen = false;
    doorGroup.animating = false;
    
    doorGroup.toggle = function() {
        this.isOpen = !this.isOpen;
        this.animating = true;
        
        for (let i = 1; i < verticalBars.length; i++) {
            // Collapse all bars toward the first bar when opening
            const targetX = this.isOpen ? verticalBars[0].position.x + i * 0.02 : -width/2 + i * spacing;
            verticalBars[i].userData.targetX = targetX;
        }
        
        for (let d of diamonds) {
            const offset = (d.baseX - verticalBars[0].position.x);
            const targetX = this.isOpen ? verticalBars[0].position.x + offset * 0.02 : d.baseX;
            d.up.userData.targetX = targetX;
            d.down.userData.targetX = targetX;
        }
    };
    
    doorGroup.update = function() {
        let stillAnimating = false;
        for (let i = 1; i < verticalBars.length; i++) {
            const bar = verticalBars[i];
            if (bar.userData.targetX !== undefined) {
                const dx = bar.userData.targetX - bar.position.x;
                if (Math.abs(dx) > 0.001) {
                    bar.position.x += dx * 0.1;
                    stillAnimating = true;
                }
            }
        }
        
        for (let d of diamonds) {
            if (d.up.userData.targetX !== undefined) {
                const dxUp = d.up.userData.targetX - d.up.position.x;
                if (Math.abs(dxUp) > 0.001) {
                    d.up.position.x += dxUp * 0.1;
                    stillAnimating = true;
                }
            }
            if (d.down.userData.targetX !== undefined) {
                const dxDown = d.down.userData.targetX - d.down.position.x;
                if (Math.abs(dxDown) > 0.001) {
                    d.down.position.x += dxDown * 0.1;
                    stillAnimating = true;
                }
            }
        }
        
        this.animating = stillAnimating;
    };

    return doorGroup;
}
