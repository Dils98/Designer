// Grid Modeling Variables
let currentGridType = 'none';
let currentGridSide = 'front';
let gridDivisions = 5;
let gridBeamMaterial = 'steel';
let gridBeamThickness = 0.02;
let gridBeams = [];

// Initialize Grid Controls
function initializeGridControls() {
    // Set default selections
    document.querySelector('.grid-type-option[data-type="none"]').classList.add('selected');
    document.querySelector('.grid-side-option[data-side="front"]').classList.add('selected');

    // Grid Type Selection
    const gridTypeOptions = document.querySelectorAll('.grid-type-option');
    gridTypeOptions.forEach(option => {
        option.addEventListener('click', () => {
            gridTypeOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            currentGridType = option.dataset.type;
        });
    });

    // Grid Side Selection
    const gridSideOptions = document.querySelectorAll('.grid-side-option');
    gridSideOptions.forEach(option => {
        option.addEventListener('click', () => {
            gridSideOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            currentGridSide = option.dataset.side;
        });
    });

    // Grid Divisions
    const gridDivisionsInput = document.getElementById('grid-divisions');
    gridDivisionsInput.addEventListener('input', (e) => {
        gridDivisions = parseInt(e.target.value);
    });

    // Grid Beam Material
    const gridBeamMaterialSelect = document.getElementById('grid-beam-material');
    gridBeamMaterialSelect.addEventListener('change', (e) => {
        gridBeamMaterial = e.target.value;
    });

    // Grid Beam Thickness
    const gridBeamThicknessInput = document.getElementById('grid-beam-thickness');
    const gridBeamThicknessValue = document.getElementById('grid-beam-thickness-value');
    gridBeamThicknessInput.addEventListener('input', (e) => {
        gridBeamThickness = parseFloat(e.target.value);
        gridBeamThicknessValue.textContent = gridBeamThickness.toFixed(2);
    });

    // Apply Grid Button
    document.getElementById('apply-grid').addEventListener('click', applyGrid);

    // Clear Grid Button
    document.getElementById('clear-grid').addEventListener('click', clearGrid);
}

// Apply Grid Function
function applyGrid() {
    if (currentGridType === 'none') {
        clearGrid();
        return;
    }

    clearGrid(); // Clear existing grid before applying new one

    const cabinDimensions = getCabinDimensions();
    const gridBeamMaterial = new THREE.MeshStandardMaterial({
        color: 0x808080,
        metalness: 0.5,
        roughness: 0.5
    });

    if (currentGridType === 'vertical' || currentGridType === 'crossed') {
        const verticalBeamGeometry = new THREE.BoxGeometry(
            gridBeamThickness,
            cabinDimensions.height,
            gridBeamThickness
        );

        const divisionSize = cabinDimensions.width / (gridDivisions + 1);
        for (let i = 1; i <= gridDivisions; i++) {
            const gridBeam = new THREE.Mesh(verticalBeamGeometry, gridBeamMaterial);
            gridBeam.position.x = (i * divisionSize) - (cabinDimensions.width / 2);
            
            // Position based on selected side
            switch (currentGridSide) {
                case 'front':
                    gridBeam.position.z = cabinDimensions.depth / 2;
                    break;
                case 'back':
                    gridBeam.position.z = -cabinDimensions.depth / 2;
                    break;
                case 'left':
                    gridBeam.position.x = -cabinDimensions.width / 2;
                    break;
                case 'right':
                    gridBeam.position.x = cabinDimensions.width / 2;
                    break;
                case 'top':
                    gridBeam.position.y = cabinDimensions.height / 2;
                    break;
                case 'bottom':
                    gridBeam.position.y = -cabinDimensions.height / 2;
                    break;
            }

            scene.add(gridBeam);
            gridBeams.push(gridBeam);
        }
    }

    if (currentGridType === 'horizontal' || currentGridType === 'crossed') {
        const horizontalBeamGeometry = new THREE.BoxGeometry(
            cabinDimensions.width,
            gridBeamThickness,
            gridBeamThickness
        );

        const divisionSize = cabinDimensions.height / (gridDivisions + 1);
        for (let i = 1; i <= gridDivisions; i++) {
            const gridBeam = new THREE.Mesh(horizontalBeamGeometry, gridBeamMaterial);
            gridBeam.position.y = (i * divisionSize) - (cabinDimensions.height / 2);
            
            // Position based on selected side
            switch (currentGridSide) {
                case 'front':
                    gridBeam.position.z = cabinDimensions.depth / 2;
                    break;
                case 'back':
                    gridBeam.position.z = -cabinDimensions.depth / 2;
                    break;
                case 'left':
                    gridBeam.position.x = -cabinDimensions.width / 2;
                    break;
                case 'right':
                    gridBeam.position.x = cabinDimensions.width / 2;
                    break;
                case 'top':
                    gridBeam.position.y = cabinDimensions.height / 2;
                    break;
                case 'bottom':
                    gridBeam.position.y = -cabinDimensions.height / 2;
                    break;
            }

            scene.add(gridBeam);
            gridBeams.push(gridBeam);
        }
    }
}

// Clear Grid Function
function clearGrid() {
    gridBeams.forEach(beam => {
        scene.remove(beam);
        beam.geometry.dispose();
        beam.material.dispose();
    });
    gridBeams = [];
}

// Get Cabin Dimensions
function getCabinDimensions() {
    // Get actual cabin dimensions from the scene
    const cabin = scene.getObjectByName('cabin');
    if (cabin) {
        const box = new THREE.Box3().setFromObject(cabin);
        return {
            width: box.max.x - box.min.x,
            height: box.max.y - box.min.y,
            depth: box.max.z - box.min.z
        };
    }
    // Default dimensions if cabin not found
    return {
        width: 2,
        height: 2.5,
        depth: 2
    };
}

// Initialize Grid Controls when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Wait for the scene to be initialized
    setTimeout(initializeGridControls, 1000);
}); 