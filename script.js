document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('emotion-form');
    const confirmationMessage = document.getElementById('confirmation-message');

    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Impede o envio padrão do formulário

        // Esconde o formulário
        form.style.display = 'none';

        // Mostra a mensagem de confirmação
        confirmationMessage.style.display = 'block';
    });

    // Animação adicional nos botões de rádio
    const radioLabels = document.querySelectorAll('.emotion-options label');

    radioLabels.forEach(label => {
        label.addEventListener('click', () => {
            // Remove a classe 'selected' de todos os labels no mesmo grupo
            const radioName = document.getElementById(label.getAttribute('for')).name;
            const groupLabels = document.querySelectorAll(`input[name="${radioName}"] + label`);
            groupLabels.forEach(lbl => lbl.classList.remove('selected'));

            // Adiciona a classe 'selected' ao label clicado
            label.classList.add('selected');
        });
    });
});
