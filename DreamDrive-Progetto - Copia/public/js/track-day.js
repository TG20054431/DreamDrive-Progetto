document.addEventListener('DOMContentLoaded', function() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const cars = document.querySelectorAll('#car-grid .col');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.getAttribute('data-filter');
            
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            cars.forEach(car => {
                if (filter === 'all' || car.getAttribute('data-category') === filter) {
                    car.style.display = 'block';
                } else {
                    car.style.display = 'none';
                }
            });
        });
    });

    const nationalityFilter = document.getElementById('nationalityFilter');
    const brandFilter = document.getElementById('brandFilter');
    const engineFilter = document.getElementById('engineFilter');
    const searchButton = document.getElementById('searchButton');

    searchButton.addEventListener('click', function() {
        const selectedNationality = nationalityFilter.value;
        const selectedBrand = brandFilter.value;
        const selectedEngine = engineFilter.value;

        cars.forEach(car => {
            const nationality = car.dataset.nationality;
            const brand = car.dataset.brand;
            const engine = car.dataset.engine;

            const matchNationality = selectedNationality === 'all' || nationality === selectedNationality;
            const matchBrand = selectedBrand === 'all' || brand === selectedBrand;
            const matchEngine = selectedEngine === 'all' || engine === selectedEngine;

            if (matchNationality && matchBrand && matchEngine) {
                car.style.display = '';
            } else {
                car.style.display = 'none';
            }
        });
    });
});
