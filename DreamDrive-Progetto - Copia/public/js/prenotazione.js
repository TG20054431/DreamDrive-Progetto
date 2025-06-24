document.addEventListener('DOMContentLoaded', function() {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const serviceParam = urlParams.get('service');
    const autoParam = urlParams.get('auto');

    // Get form elements
    const servizioSelect = document.getElementById('servizio');
    const autoSelect = document.getElementById('auto');
    const durataContainer = document.getElementById('durata-container');
    const durataSelect = document.getElementById('durata');
    const circuitoContainer = document.getElementById('circuito-container');
    const circuitoSelect = document.getElementById('circuito');

    // Pre-select service and car if parameters exist
    if (serviceParam) {
        servizioSelect.value = serviceParam;
        if (serviceParam === 'noleggio') {
            durataContainer.style.display = 'block';
            durataSelect.required = true;
            circuitoContainer.style.display = 'none';
            circuitoSelect.required = false;
        } else if (serviceParam === 'track-day') {
            durataContainer.style.display = 'none';
            durataSelect.required = false;
            circuitoContainer.style.display = 'block';
            circuitoSelect.required = true;
        }
    }

    if (autoParam) {
        autoSelect.value = autoParam;
    }

    const noleggioOptions = Array.from(autoSelect.options).filter(option => 
        ['porsche-911', 'ferrari-458', 'lambo-aventador', 'mustang-gt500', 'mercedes-amg', 'aston-vanquish']
        .includes(option.value)
    );
    const trackDayOptions = Array.from(autoSelect.options).filter(option => 
        ['audi-etron', 'pagani-zonda', 'mclaren-senna', 'lambo-huracan', 'bugatti-chiron', 'nissan-gtr']
        .includes(option.value)
    );

    servizioSelect.addEventListener('change', function() {
        // Clear all options except the first one
        while (autoSelect.options.length > 1) {
            autoSelect.remove(1);
        }

        // Add relevant options based on selected service
        if (this.value === 'noleggio') {
            noleggioOptions.forEach(option => autoSelect.add(option.cloneNode(true)));
        } else if (this.value === 'track-day') {
            trackDayOptions.forEach(option => autoSelect.add(option.cloneNode(true)));
        }

        // Reset car selection
        autoSelect.value = '';

        // Handle duration and track selection visibility
        if (this.value === 'noleggio') {
            durataContainer.style.display = 'block';
            durataSelect.required = true;
            circuitoContainer.style.display = 'none';
            circuitoSelect.required = false;
            circuitoSelect.value = '';
        } else if (this.value === 'track-day') {
            durataContainer.style.display = 'none';
            durataSelect.required = false;
            durataSelect.value = '';
            circuitoContainer.style.display = 'block';
            circuitoSelect.required = true;
        } else {
            durataContainer.style.display = 'none';
            circuitoContainer.style.display = 'none';
            durataSelect.required = false;
            circuitoSelect.required = false;
            durataSelect.value = '';
            circuitoSelect.value = '';
        }
    });

    document.getElementById('servizio').addEventListener('change', function() {
        const durataContainer = document.getElementById('durata-container');
        const circuitoContainer = document.getElementById('circuito-container');
        const durataSelect = document.getElementById('durata');
        const circuitoSelect = document.getElementById('circuito');
        
        if (this.value === 'noleggio') {
            durataContainer.style.display = 'block';
            circuitoContainer.style.display = 'none';
            durataSelect.required = true;
            circuitoSelect.required = false;
        } else if (this.value === 'track-day') {
            durataContainer.style.display = 'none';
            circuitoContainer.style.display = 'block';
            durataSelect.required = false;
            circuitoSelect.required = true;
        }
    });

    function updatePaymentUrl(event) {
        event.preventDefault();
        
        const service = document.getElementById('servizio').value;
        const auto = document.getElementById('auto').value;
        const duration = document.getElementById('durata')?.value || '1';
        const circuit = document.getElementById('circuito')?.value || '';
        const date = document.getElementById('data').value;
        const time = document.getElementById('ora').value;

        // Redirect to payment page with parameters
        const paymentUrl = `../payment/pay.html?` + new URLSearchParams({
            service: service,
            auto: auto,
            duration: duration,
            circuito: circuit,
            data: date,
            ora: time
        }).toString();

        window.location.href = paymentUrl;
        return false;
    }

    function handleSubmit(event) {
        event.preventDefault();
        
        const service = document.getElementById('servizio').value;
        const auto = document.getElementById('auto').value;
        const circuit = document.getElementById('circuito')?.value || '';
        const duration = document.getElementById('durata')?.value || '1';
        const date = document.getElementById('data').value;
        const time = document.getElementById('ora').value;

        const paymentUrl = `../payment/payment.html?service=${service}&auto=${auto}&duration=${duration}&circuito=${circuit}&data=${date}&ora=${time}`;
        
        window.location.href = paymentUrl;
        return false;
    }
});
