document.addEventListener('DOMContentLoaded', function() {
    const userIcon = document.querySelector('.user-icon-link');
    const loginButtons = document.querySelector('.login-buttons');
    
    if (isLoggedIn()) {
        // Utente loggato - l'icona utente porta alla pagina profilo
        userIcon.href = '/utente';
        // Nascondi i pulsanti login/register
        if (loginButtons) {
            loginButtons.style.display = 'none';
        }
    } else {
        // Utente non loggato - l'icona utente porta al login
        userIcon.href = '/login';
    }
});

// Funzione per verificare se l'utente è loggato
function isLoggedIn() {
    // Implementare la logica per verificare lo stato di login
    // Per ora restituisce false
    return false;
}
