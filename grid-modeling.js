// Grid Modeling Variables
let currentGridType = 'none';
let currentGridSide = 'front';
let gridDivisions = 5;
let gridBeamMaterial = 'steel';
let gridBeamThickness = 0.02;
let gridBeams = [];
let gridMaterialType = 'rectTube';
let gridMaterialSize = '50×25×3.2mm';
let gridSides = new Set(); // Track which sides have grids

// Add tracking for grid configurations
let gridConfigurations = {
    front: { applied: false, type: 'none', divisions: 5 },
    back: { applied: false, type: 'none', divisions: 5 },
    left: { applied: false, type: 'none', divisions: 5 },
    right: { applied: false, type: 'none', divisions: 5 },
    top: { applied: false, type: 'none', divisions: 5 },
    bottom: { applied: false, type: 'none', divisions: 5 }
};

// Initialize Grid Controls
function initializeGridControls() {
    // Wait for DOM to be fully loaded
    if (!document.getElementById('grid-divisions')) {
        setTimeout(initializeGridControls, 100);
        return;
    }

    // Set default selections
    const noneOption = document.querySelector('.grid-type-option[data-type="none"]');
    const frontOption = document.querySelector('.grid-side-option[data-side="front"]');
    
    if (noneOption) noneOption.classList.add('selected');
    if (frontOption) frontOption.classList.add('selected');

    // Grid Type Selection
    document.querySelectorAll('.grid-type-option').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelectorAll('.grid-type-option').forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            currentGridType = option.dataset.type;
        });
    });

    // Grid Side Selection
    document.querySelectorAll('.grid-side-option').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelectorAll('.grid-side-option').forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            currentGridSide = option.dataset.side;
        });
    });

    // Grid Divisions
    const gridDivisionsInput = document.getElementById('grid-divisions');
    if (gridDivisionsInput) {
        gridDivisionsInput.addEventListener('input', (e) => {
            gridDivisions = parseInt(e.target.value);
        });
    }

    // Grid Beam Material
    const gridBeamMaterialSelect = document.getElementById('grid-beam-material');
    if (gridBeamMaterialSelect) {
        gridBeamMaterialSelect.addEventListener('change', (e) => {
            gridBeamMaterial = e.target.value;
        });
    }

    // Grid Beam Thickness
    const gridBeamThicknessInput = document.getElementById('grid-beam-thickness');
    const gridBeamThicknessValue = document.getElementById('grid-beam-thickness-value');
    if (gridBeamThicknessInput) {
        gridBeamThicknessInput.addEventListener('input', (e) => {
            gridBeamThickness = parseFloat(e.target.value);
            gridBeamThicknessValue.textContent = gridBeamThickness.toFixed(2);
        });
    }

    // Grid Material Type
    const gridMaterialTypeSelect = document.getElementById('grid-material-type');
    if (gridMaterialTypeSelect) {
        gridMaterialTypeSelect.addEventListener('change', (e) => {
            gridMaterialType = e.target.value;
            updateGridMaterialSizeOptions();
        });
    }

    // Grid Material Size
    const gridMaterialSizeSelect = document.getElementById('grid-material-size');
    if (gridMaterialSizeSelect) {
        gridMaterialSizeSelect.addEventListener('change', (e) => {
            gridMaterialSize = e.target.value;
        });
    }

    // Apply Grid Button
    const applyGridBtn = document.getElementById('apply-grid');
    if (applyGridBtn) {
        applyGridBtn.addEventListener('click', applyGridToSide);
    }

    // Clear Grid Button
    const clearGridBtn = document.getElementById('clear-grid');
    if (clearGridBtn) {
        clearGridBtn.addEventListener('click', () => clearGridForSide(currentGridSide));
    }
}

// Get Beam Size based on material type and size
function getBeamSize(materialType, materialSize) {
    const sizes = {
        'rectTube': {
            '50×25×3.2mm': { width: 0.05, height: 0.025, thickness: 0.0032 },
            '75×50×3.2mm': { width: 0.075, height: 0.05, thickness: 0.0032 },
            '100×50×4mm': { width: 0.1, height: 0.05, thickness: 0.004 },
            '120×60×4mm': { width: 0.12, height: 0.06, thickness: 0.004 },
            '150×75×5mm': { width: 0.15, height: 0.075, thickness: 0.005 },
            '200×100×6mm': { width: 0.2, height: 0.1, thickness: 0.006 }
        }
    };
    return sizes[materialType][materialSize] || sizes['rectTube']['50×25×3.2mm'];
}

// Update Grid Material Size Options
function updateGridMaterialSizeOptions() {
    const sizeSelect = document.getElementById('grid-material-size');
    sizeSelect.innerHTML = '';
    
    const sizes = {
        'rectTube': [
            '50×25×3.2mm', '75×50×3.2mm', '100×50×4mm', 
            '120×60×4mm', '150×75×5mm', '200×100×6mm'
        ]
    };
    
    sizes[gridMaterialType].forEach(size => {
        const option = document.createElement('option');
        option.value = size;
        option.textContent = size;
        sizeSelect.appendChild(option);
    });
}

// Apply Grid to Specific Side
function applyGridToSide() {
    if (!currentGridSide) {
        alert('Please select a side to apply the grid to');
        return;
    }

    if (currentGridType === 'none') {
        clearGridForSide(currentGridSide);
        return;
    }

    // Remove any existing grid beams for this side
    clearGridForSide(currentGridSide);

    const width = parseInt(document.getElementById('elevatorWidth').value) * 0.001;
    const height = parseInt(document.getElementById('elevatorHeight').value) * 0.001;
    const depth = parseInt(document.getElementById('elevatorDepth').value) * 0.001;
    
    // Use the integrated grid approach from main designer.html
    if (typeof integrateGridWithCabinFrame === 'function') {
        // Create frame material using grid settings
        const material = new THREE.MeshStandardMaterial({ 
            color: 0x777777,
            metalness: 0.7,
            roughness: 0.3
        });
        
        integrateGridWithCabinFrame(cabinFrame, width, height, depth, currentGridSide, material);
    } else {
        // Fallback to original implementation if integrateGridWithCabinFrame is not available
        const beamSize = getBeamSize(gridMaterialType, gridMaterialSize);
        
        // Create frame material using grid settings
        const material = new THREE.MeshStandardMaterial({ 
            color: 0x777777,
            metalness: 0.7,
            roughness: 0.3
        });

        // Create grid beams based on type
        if (currentGridType === 'vertical' || currentGridType === 'crossed') {
            const verticalBeamGeometry = new THREE.BoxGeometry(
                beamSize.width,
                height,
                beamSize.thickness
            );

            const divisionSize = width / (gridDivisions + 1);
            for (let i = 1; i <= gridDivisions; i++) {
                const gridBeam = new THREE.Mesh(verticalBeamGeometry, material);
                const xPos = (i * divisionSize) - (width / 2);
                
                // Position based on selected side
                switch (currentGridSide) {
                    case 'front':
                        gridBeam.position.set(xPos, height/2, depth/2);
                        break;
                    case 'back':
                        gridBeam.position.set(xPos, height/2, -depth/2);
                        break;
                    case 'left':
                        gridBeam.position.set(-width/2, height/2, xPos);
                        gridBeam.rotation.y = Math.PI / 2;
                        break;
                    case 'right':
                        gridBeam.position.set(width/2, height/2, xPos);
                        gridBeam.rotation.y = Math.PI / 2;
                        break;
                    case 'top':
                        gridBeam.position.set(xPos, height, 0);
                        gridBeam.rotation.x = Math.PI / 2;
                        break;
                    case 'bottom':
                        gridBeam.position.set(xPos, 0, 0);
                        gridBeam.rotation.x = Math.PI / 2;
                        break;
                }

                gridBeam.userData = {
                    type: 'grid',
                    side: currentGridSide,
                    gridType: currentGridType
                };

                cabinFrame.add(gridBeam);
                gridBeams.push(gridBeam);
            }
        }

        if (currentGridType === 'horizontal' || currentGridType === 'crossed') {
            const horizontalBeamGeometry = new THREE.BoxGeometry(
                width,
                beamSize.width,
                beamSize.thickness
            );

            const divisionSize = height / (gridDivisions + 1);
            for (let i = 1; i <= gridDivisions; i++) {
                const gridBeam = new THREE.Mesh(horizontalBeamGeometry, material);
                const yPos = (i * divisionSize);
                
                // Position based on selected side
                switch (currentGridSide) {
                    case 'front':
                        gridBeam.position.set(0, yPos, depth/2);
                        break;
                    case 'back':
                        gridBeam.position.set(0, yPos, -depth/2);
                        break;
                    case 'left':
                        gridBeam.position.set(-width/2, yPos, 0);
                        gridBeam.rotation.y = Math.PI / 2;
                        break;
                    case 'right':
                        gridBeam.position.set(width/2, yPos, 0);
                        gridBeam.rotation.y = Math.PI / 2;
                        break;
                    case 'top':
                        gridBeam.position.set(0, height, yPos);
                        gridBeam.rotation.x = Math.PI / 2;
                        break;
                    case 'bottom':
                        gridBeam.position.set(0, 0, yPos);
                        gridBeam.rotation.x = Math.PI / 2;
                        break;
                }

                gridBeam.userData = {
                    type: 'grid',
                    side: currentGridSide,
                    gridType: currentGridType
                };

                cabinFrame.add(gridBeam);
                gridBeams.push(gridBeam);
            }
        }
    }

    // Add side to tracked sides
    gridSides.add(currentGridSide);
}

// Clear Grid for Specific Side
function clearGridForSide(side) {
    // Update the grid configuration to track removal
    if (typeof gridConfigurations !== 'undefined') {
        gridConfigurations[side] = {
            applied: false,
            type: 'none',
            divisions: 5
        };
    }
    
    gridBeams = gridBeams.filter(beam => {
        if (beam.userData.side === side) {
            if (beam.parent) {
                beam.parent.remove(beam);
                beam.geometry.dispose();
                beam.material.dispose();
            }
            return false;
        }
        return true;
    });
    gridSides.delete(side);
}

// Initialize Grid Controls when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Wait for the scene to be initialized
    setTimeout(initializeGridControls, 1000);
}); 