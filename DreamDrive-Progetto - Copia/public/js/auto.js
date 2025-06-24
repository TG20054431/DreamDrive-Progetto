document.addEventListener('DOMContentLoaded', function() {
    // Initialize filter elements
    const brandFilter = document.getElementById('brand-filter');
    const categoryFilter = document.getElementById('category-filter');
    const priceFilter = document.getElementById('price-filter');
    const priceDisplay = document.getElementById('price-display');
    
    // Load initial data
    fetchAllCars();
    
    // Populate filter dropdowns
    fetchFilterOptions();
    
    // Setup event listeners for filters
    if (brandFilter) {
        brandFilter.addEventListener('change', applyFilters);
    }
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', applyFilters);
    }
    
    if (priceFilter) {
        priceFilter.addEventListener('input', function() {
            if (priceDisplay) {
                priceDisplay.textContent = `€${priceFilter.value}`;
            }
            applyFilters();
        });
    }
});

function fetchAllCars() {
    const carsGrid = document.getElementById('cars-grid');
    if (!carsGrid) return;
    
    carsGrid.innerHTML = '<p class="loading">Caricamento delle auto in corso...</p>';
    
    fetch('/api/cars')
        .then(response => response.json())
        .then(cars => {
            if (cars.length === 0) {
                carsGrid.innerHTML = '<p>Nessuna auto disponibile al momento.</p>';
                return;
            }
            
            renderCars(cars);
        })
        .catch(error => {
            console.error('Errore nel caricare le auto:', error);
            carsGrid.innerHTML = '<p>Si è verificato un errore nel caricare le auto.</p>';
        });
}

function fetchFilterOptions() {
    // Fetch brands for filter
    fetch('/api/cars/brands')
        .then(response => response.json())
        .then(brands => {
            populateFilterDropdown('brand-filter', brands);
        })
        .catch(error => console.error('Errore nel caricare le marche:', error));
    
    // Fetch categories for filter
    fetch('/api/cars/categories')
        .then(response => response.json())
        .then(categories => {
            populateFilterDropdown('category-filter', categories);
        })
        .catch(error => console.error('Errore nel caricare le categorie:', error));
}

function populateFilterDropdown(elementId, options) {
    const dropdown = document.getElementById(elementId);
    if (!dropdown) return;
    
    // Keep the first option (default) and append new ones
    const defaultOption = dropdown.options[0];
    dropdown.innerHTML = '';
    dropdown.appendChild(defaultOption);
    
    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.textContent = option;
        dropdown.appendChild(optionElement);
    });
}

function applyFilters() {
    const brandFilter = document.getElementById('brand-filter');
    const categoryFilter = document.getElementById('category-filter');
    const priceFilter = document.getElementById('price-filter');
    
    const brand = brandFilter ? brandFilter.value : '';
    const category = categoryFilter ? categoryFilter.value : '';
    const maxPrice = priceFilter ? priceFilter.value : '';
    
    // Build query string based on selected filters
    let queryParams = new URLSearchParams();
    if (brand) queryParams.append('marca', brand);
    if (category) queryParams.append('categoria', category);
    if (maxPrice) queryParams.append('maxPrezzo', maxPrice);
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/api/cars?${queryString}` : '/api/cars';
    
    const carsGrid = document.getElementById('cars-grid');
    if (!carsGrid) return;
    
    carsGrid.innerHTML = '<p class="loading">Filtro in corso...</p>';
    
    fetch(endpoint)
        .then(response => response.json())
        .then(cars => {
            if (cars.length === 0) {
                carsGrid.innerHTML = '<p>Nessuna auto corrisponde ai filtri selezionati.</p>';
                return;
            }
            
            renderCars(cars);
        })
        .catch(error => {
            console.error('Errore nell\'applicare i filtri:', error);
            carsGrid.innerHTML = '<p>Si è verificato un errore durante il filtraggio.</p>';
        });
}

function renderCars(cars) {
    const carsGrid = document.getElementById('cars-grid');
    if (!carsGrid) return;
    
    let html = '';
    cars.forEach(car => {
        html += `
            <div class="car-card">
                <div class="car-image">
                    <img src="${car.immagini[0]}" alt="${car.marca} ${car.modello}">
                </div>
                <div class="car-info">
                    <h3 class="car-title">${car.marca} ${car.modello}</h3>
                    <div class="car-category">${car.categoria}</div>
                    <div class="car-price">€${car.prezzo} <span>/ giorno</span></div>
                    <div class="car-features">
                        <div class="car-feature">
                            <i class="fas fa-tachometer-alt"></i>
                            <span>${car.specifiche.potenza} CV</span>
                        </div>
                        <div class="car-feature">
                            <i class="fas fa-bolt"></i>
                            <span>${car.specifiche.accelerazione}s</span>
                        </div>
                        <div class="car-feature">
                            <i class="fas fa-gas-pump"></i>
                            <span>${car.specifiche.carburante}</span>
                        </div>
                    </div>
                    <a href="/auto/${car.id}" class="btn-secondary btn-full">Dettagli</a>
                </div>
            </div>
        `;
    });
    
    carsGrid.innerHTML = html;
}
