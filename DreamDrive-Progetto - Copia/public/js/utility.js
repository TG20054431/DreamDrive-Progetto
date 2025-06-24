function handleRedirect(event) {
    event.preventDefault();
    const urlParams = new URLSearchParams(window.location.search);
    const service = urlParams.get('service');
    window.location.href = service === 'track-day' 
        ? '../servizi/track-day/track-day.html'
        : '../servizi/noleggio/noleggio.html';
}

function passServiceParam(event) {
    const service = new URLSearchParams(window.location.search).get('service');
    if (service) {
        event.preventDefault();
        const isLoginPage = window.location.pathname.includes('login.html');
        window.location.href = `${isLoginPage ? 'register' : 'login'}.html?service=${service}`;
    }
}

function handleLogin(event) {
    event.preventDefault();
    const urlParams = new URLSearchParams(window.location.search);
    const service = urlParams.get('service');    
    
    if (service === 'noleggio') {
        window.location.href = '../servizi/noleggio/noleggio.html';
    } else if (service === 'track-day') {
        window.location.href = '../servizi/track-day/track-day.html';
    } else {
        window.location.href = '../servizi/services.html';
    }
}

function handleRegistration(event) {
    event.preventDefault();
    const urlParams = new URLSearchParams(window.location.search);
    const service = urlParams.get('service');
    
    if (service === 'noleggio') {
        window.location.href = '../servizi/noleggio/noleggio.html';
    } else if (service === 'track-day') {
        window.location.href = '../servizi/track-day/track-day.html';
    } else {
        window.location.href = '../servizi/services.html';
    }
}

// Funzioni per gestire le prenotazioni
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

// Funzione per visualizzare le prenotazioni nella pagina utente
function displayBookings() {
    const activeBookings = getActiveBookings();
    const pastBookings = getPastBookings();
    
    const activeContainer = document.getElementById('activeBookings');
    const historyContainer = document.getElementById('bookingHistory');
    
    if (activeBookings.length > 0) {
        activeContainer.innerHTML = activeBookings.map(booking => `
            <div class="booking-item mb-3 p-3 border rounded">
                <h6>${booking.service}</h6>
                <p>Data: ${new Date(booking.date).toLocaleDateString('it-IT')}</p>
                <p>Auto: ${booking.car}</p>
                ${booking.service === 'track-day' ? `<p>Circuito: ${booking.circuito}</p>` : ''}
            </div>
        `).join('');
    }
    
    if (pastBookings.length > 0) {
        historyContainer.innerHTML = pastBookings.map(booking => `
            <div class="booking-item mb-3 p-3 border rounded">
                <h6>${booking.service}</h6>
                <p>Data: ${new Date(booking.date).toLocaleDateString('it-IT')}</p>
                <p>Auto: ${booking.car}</p>
                ${booking.service === 'track-day' ? `<p>Circuito: ${booking.circuito}</p>` : ''}
            </div>
        `).join('');
    }
}

// Funzioni per gestire lo stato del login
function login(userData) {
    localStorage.setItem('loggedInUser', JSON.stringify(userData));
}

function logout() {
    localStorage.removeItem('loggedInUser');
    window.location.href = '../index_page/index.html';
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
        window.location.href = '../login-register_page/login.html';
    }
}