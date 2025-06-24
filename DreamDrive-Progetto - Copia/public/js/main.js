document.addEventListener('DOMContentLoaded', function() {
    // Funzioni per gestire lo stato del login
    function isLoggedIn() {
        return localStorage.getItem('loggedInUser') !== null;
    }

    const userIcon = document.querySelector('.user-icon-link');
    const loginButtons = document.querySelector('.login-buttons');
    
    if (isLoggedIn()) {
        // Utente loggato - l'icona utente porta alla pagina profilo
        if (userIcon) userIcon.href = '/utente';
        // Nascondi i pulsanti login/register
        if (loginButtons) loginButtons.style.display = 'none';
    } else {
        // Utente non loggato - l'icona utente porta al login
        if (userIcon) userIcon.href = '/login';
    }

    // Inizializza tooltip e popover se presenti
    if (typeof bootstrap !== 'undefined') {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });

        const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
        popoverTriggerList.map(function (popoverTriggerEl) {
            return new bootstrap.Popover(popoverTriggerEl);
        });
    }
});

// Funzioni per gestire prenotazioni e autenticazione
function saveBooking(booking) {
    const bookings = getBookings();
    bookings.push(booking);
    localStorage.setItem('bookings', JSON.stringify(bookings));
}

function getBookings() {
    const bookings = localStorage.getItem('bookings');
    return bookings ? JSON.parse(bookings) : [];
}

function getActiveBookings() {
    const bookings = getBookings();
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Resetta l'ora a mezzanotte
    
    return bookings.filter(booking => {
        const bookingDate = new Date(booking.date);
        bookingDate.setHours(0, 0, 0, 0);
        
        // Se è un noleggio, controlla anche la data di fine
        if (booking.service === 'noleggio' && booking.endDate) {
            const endDate = new Date(booking.date);
            endDate.setDate(endDate.getDate() + parseInt(booking.endDate));
            return endDate >= today;
        }
        
        return bookingDate >= today;
    });
}

function getPastBookings() {
    const bookings = getBookings();
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Resetta l'ora a mezzanotte
    
    return bookings.filter(booking => {
        const bookingDate = new Date(booking.date);
        bookingDate.setHours(0, 0, 0, 0);
        
        // Se è un noleggio, controlla anche la data di fine
        if (booking.service === 'noleggio' && booking.endDate) {
            const endDate = new Date(booking.date);
            endDate.setDate(endDate.getDate() + parseInt(booking.endDate));
            return endDate < today;
        }
        
        return bookingDate < today;
    });
}

function login(userData) {
    localStorage.setItem('loggedInUser', JSON.stringify(userData));
}

function logout() {
    localStorage.removeItem('loggedInUser');
    window.location.href = '/';
}

function isLoggedIn() {
    return localStorage.getItem('loggedInUser') !== null;
}

function getLoggedInUser() {
    const userData = localStorage.getItem('loggedInUser');
    return userData ? JSON.parse(userData) : null;
}

function checkAuth() {
    if (!isLoggedIn()) {
        window.location.href = '/login';
    }
}
