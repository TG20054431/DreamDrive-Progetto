document.addEventListener('DOMContentLoaded', function() {
    // Setup image gallery
    initImageGallery();
    
    // Setup add to favorites
    setupFavoriteButton();
    
    // Load related cars
    const carId = getCarIdFromUrl();
    if (carId) {
        fetchRelatedCars(carId);
    }
});

function initImageGallery() {
    const thumbnails = document.querySelectorAll('.thumbnail');
    const mainImage = document.querySelector('.main-image img');
    
    if (!thumbnails.length || !mainImage) return;
    
    thumbnails.forEach(thumb => {
        thumb.addEventListener('click', function() {
            // Update active thumbnail
            thumbnails.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Update main image
            const imgSrc = this.querySelector('img').src;
            mainImage.src = imgSrc;
        });
    });
}

function setupFavoriteButton() {
    const favoriteBtn = document.getElementById('add-to-favorites');
    if (!favoriteBtn) return;
    
    favoriteBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        const carId = this.getAttribute('data-id');
        if (!carId) return;
        
        // Check if we have favorites in local storage
        let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        
        // Check if this car is already in favorites
        const isAlreadyFavorite = favorites.includes(carId);
        
        if (isAlreadyFavorite) {
            // Remove from favorites
            favorites = favorites.filter(id => id !== carId);
            this.innerHTML = '<i class="far fa-heart"></i> Aggiungi ai preferiti';
        } else {
            // Add to favorites
            favorites.push(carId);
            this.innerHTML = '<i class="fas fa-heart"></i> Rimuovi dai preferiti';
        }
        
        // Save updated favorites to local storage
        localStorage.setItem('favorites', JSON.stringify(favorites));
        
        // Show feedback to user
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = isAlreadyFavorite ? 'Rimosso dai preferiti' : 'Aggiunto ai preferiti';
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => {
                    document.body.removeChild(toast);
                }, 300);
            }, 3000);
        }, 100);
    });
    
    // Check if this car is already in favorites when page loads
    const carId = favoriteBtn.getAttribute('data-id');
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    
    if (favorites.includes(carId)) {
        favoriteBtn.innerHTML = '<i class="fas fa-heart"></i> Rimuovi dai preferiti';
    }
}

function getCarIdFromUrl() {
    const pathname = window.location.pathname;
    const parts = pathname.split('/');
    return parts[parts.length - 1];
}

function fetchRelatedCars(carId) {
    const relatedCarsContainer = document.getElementById('related-cars');
    if (!relatedCarsContainer) return;
    
    fetch(`/api/cars/${carId}/related`)
        .then(response => response.json())
        .then(cars => {
            if (cars.length === 0) {
                relatedCarsContainer.innerHTML = '<p>Nessuna auto correlata disponibile.</p>';
                return;
            }
            
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
                            <a href="/auto/${car.id}" class="btn-secondary btn-full">Dettagli</a>
                        </div>
                    </div>
                `;
            });
            
            relatedCarsContainer.innerHTML = html;
        })
        .catch(error => {
            console.error('Errore nel caricare le auto correlate:', error);
            relatedCarsContainer.innerHTML = '<p>Si è verificato un errore nel caricare le auto correlate.</p>';
        });
}
