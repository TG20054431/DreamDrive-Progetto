document.addEventListener('DOMContentLoaded', function() {
    // Get date and time elements
    const dateInput = document.getElementById('data');
    const timeSelect = document.getElementById('ora');
    
    // Set minimum date to today
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    dateInput.min = formattedDate;
    
    // Initial validation of time slots
    validateTimeSlots();
    
    // Validate time slots when date changes
    dateInput.addEventListener('change', validateTimeSlots);
    
    function validateTimeSlots() {
        const selectedDate = dateInput.value;
        const today = new Date();
        const todayFormatted = today.toISOString().split('T')[0];
        
        // If selected date is today, disable past times
        if (selectedDate === todayFormatted) {
            const currentHour = today.getHours();
            
            // Loop through all time options
            Array.from(timeSelect.options).forEach(option => {
                if (option.value === '') return; // Skip the placeholder option
                
                // Extract hour from the option (format: HH:00)
                const optionHour = parseInt(option.value.split(':')[0]);
                
                // Disable options if they're in the past
                option.disabled = optionHour <= currentHour;
            });
            
            // If the currently selected time is now disabled, reset selection
            if (timeSelect.selectedIndex > 0 && timeSelect.options[timeSelect.selectedIndex].disabled) {
                timeSelect.selectedIndex = 0;
            }
        } else {
            // For future dates, enable all time slots
            Array.from(timeSelect.options).forEach(option => {
                if (option.value === '') return; // Skip the placeholder option
                option.disabled = false;
            });
        }
    }
});
