document.addEventListener('DOMContentLoaded', function() {
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('data').setAttribute('min', today);

    // Update available times based on selected date
    document.getElementById('data').addEventListener('change', function() {
        const selectedDate = new Date(this.value);
        const now = new Date();
        const timeSelect = document.getElementById('ora');
        const times = timeSelect.options;

        // If selected date is today, disable past times
        if (selectedDate.toDateString() === now.toDateString()) {
            const currentHour = now.getHours();
            for (let i = 1; i < times.length; i++) {
                const timeHour = parseInt(times[i].value.split(':')[0]);
                times[i].disabled = timeHour <= currentHour;
            }
        } else {
            // Enable all times for future dates
            for (let i = 1; i < times.length; i++) {
                times[i].disabled = false;
            }
        }

        // Reset selection if disabled option was selected
        if (timeSelect.selectedOptions[0].disabled) {
            timeSelect.value = '';
        }
    });

    // Trigger date check on page load
    document.getElementById('data').dispatchEvent(new Event('change'));
});
