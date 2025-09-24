window.addEventListener('DOMContentLoaded', () => {
    // Clear input when X icon is clicked
    document.querySelectorAll('.icon.clear').forEach(icon => {
        icon.addEventListener('click', () => {
            const targetId = icon.getAttribute('data-target');
            if (targetId) {
                const input = document.getElementById(targetId) as HTMLInputElement | null;
                if (input) input.value = '';
            }
        });
    });
    const form = document.getElementById('registrationForm') as HTMLFormElement | null;
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
    
            const passwordInput = document.getElementById('password') as HTMLInputElement | null;
            const confirmPasswordInput = document.getElementById('confirmPassword') as HTMLInputElement | null;
            const password = passwordInput ? passwordInput.value : '';
            const confirmPassword = confirmPasswordInput ? confirmPasswordInput.value : '';
    
            if (password !== confirmPassword) {
                alert('Passwords do not match!');
                return;
            }
    
            // You can add more validation or submit logic here
            alert('Registration successful!');
            form.reset();
        });
    }
});