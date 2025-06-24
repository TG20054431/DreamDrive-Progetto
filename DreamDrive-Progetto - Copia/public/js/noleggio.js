document.addEventListener('DOMContentLoaded', function() {
    const nationalityFilter = document.getElementById('nationalityFilter');
    const brandFilter = document.getElementById('brandFilter');
    const engineFilter = document.getElementById('engineFilter');
    const searchButton = document.getElementById('searchButton');
    const cars = document.querySelectorAll('#car-grid .col');

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
