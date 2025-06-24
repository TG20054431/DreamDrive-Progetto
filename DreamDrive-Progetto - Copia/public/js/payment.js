document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const service = urlParams.get('service');
    const date = urlParams.get('date');
    const endDate = urlParams.get('endDate');
    const time = urlParams.get('time');

    console.log('Parametri ricevuti:', { service, date, endDate, time }); // Debug

    // Calcolo prezzo basato sul servizio
    let amount;
    if (service === 'noleggio') {
        if (date && endDate) {
            const startDate = new Date(date);
            const days = parseInt(endDate) || 1;
            const endingDate = new Date(startDate);
            endingDate.setDate(startDate.getDate() + days);
            amount = days * 200;
            
            // Aggiorna il riepilogo con formattazione
            document.getElementById('selected-service').textContent = service || '-';
            document.getElementById('selected-date').textContent = formatDate(date) || '-';
            document.getElementById('selected-time').textContent = `Per ${days} giorni fino al ${formatDate(endingDate)}`;
        } else {
            amount = 200;
        }
    } else if (service === 'track-day') {
        amount = 350;
        // Aggiorna il riepilogo per track day
        document.getElementById('selected-service').textContent = service || '-';
        document.getElementById('selected-date').textContent = formatDate(date) || '-';
        document.getElementById('selected-time').textContent = time || '-';
    }

    document.getElementById('total-amount').textContent = amount ? `€${amount.toFixed(2)}` : '-';

    // Gestione form di pagamento
    const form = document.getElementById('payment-form');
    const cardNumber = document.getElementById('cardNumber');
    const expiry = document.getElementById('expiry');
    const cvv = document.getElementById('cvv');

    // Validazione numero carta
    cardNumber.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 16) value = value.substr(0, 16);
        e.target.value = value.replace(/(\d{4})/g, '$1 ').trim();
    });

    // Validazione data scadenza
    expiry.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 4) value = value.substr(0, 4);
        if (value.length > 2) {
            value = value.substr(0, 2) + '/' + value.substr(2);
        }
        e.target.value = value;
    });

    // Validazione CVV
    cvv.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 3) value = value.substr(0, 3);
        e.target.value = value;
    });

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Crea una prenotazione di esempio
        const booking = {
            service: service,
            date: date,
            endDate: endDate,
            time: time,
            car: urlParams.get('car'),
            circuito: service === 'track-day' ? urlParams.get('circuito') : null,
            amount: amount,
            paymentDetails: {
                cardName: document.getElementById('cardName').value,
                cardNumber: document.getElementById('cardNumber').value.slice(-4), // Salva solo le ultime 4 cifre
                timestamp: new Date().toISOString()
            }
        };

        // Recupera le prenotazioni esistenti o inizializza un array vuoto
        const existingBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
        
        // Aggiungi la nuova prenotazione
        existingBookings.push(booking);
        
        // Salva nel localStorage
        localStorage.setItem('bookings', JSON.stringify(existingBookings));

        //alert('Pagamento effettuato con successo!');
        window.location.href = '../../index_page/index.html';
    });
});

function formatDate(dateString) {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function saveBooking(booking) {
    // Implementa la logica per salvare la prenotazione
    console.log('Prenotazione salvata:', booking);
}
