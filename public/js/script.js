// Example starter JavaScript for disabling form submissions if there are invalid fields
(() => {
  'use strict'

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.needs-validation')

  // Loop over them and prevent submission
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }

      form.classList.add('was-validated')
    }, false)
  })
})()

// Floating Icon click handler
document.addEventListener('DOMContentLoaded', function () {
    const fab = document.getElementById('lease-fab');
    if (!fab) return;

    function openAssistant() {
        // Change URL to your assistant page route
        window.location.href = '/assistant';
    }

    fab.addEventListener('click', openAssistant);

    // Keyboard accessibility (Enter or Space)
    fab.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openAssistant();
        }
    });
});
