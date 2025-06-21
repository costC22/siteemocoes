document.addEventListener('DOMContentLoaded', function() {
    const socket = io();

    const form = document.getElementById('emotion-form');
    const thankYouMessage = document.getElementById('thank-you-message');
    const analiseSection = document.getElementById('analise');

    // --- Configuração dos Gráficos ---
    const chartLabels = ['0%', '25%', '50%', '75%', '100%'];
    const chartInstances = {};

    function createChart(chartId, label, color) {
        const ctx = document.getElementById(chartId).getContext('2d');
        chartInstances[chartId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: chartLabels,
                datasets: [{
                    label: label,
                    data: [0, 0, 0, 0, 0],
                    backgroundColor: `rgba(${color}, 0.6)`,
                    borderColor: `rgba(${color}, 1)`,
                    borderWidth: 1
                }]
            },
            options: {
                indexAxis: 'y',
                scales: { x: { beginAtZero: true, ticks: { precision: 0 } } },
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } }
            }
        });
    }

    createChart('ansiedadeChart', 'Ansiedade', '208, 2, 27');
    createChart('tranquilaChart', 'Tranquilidade', '126, 211, 33');
    createChart('acolhidaChart', 'Acolhimento', '74, 144, 226');
    createChart('excluidaChart', 'Exclusão', '245, 166, 35');
    createChart('irritadaChart', 'Irritação', '208, 2, 27');

    // --- Lógica do Formulário ---
    form.addEventListener('submit', function(event) {
        event.preventDefault();

        const formData = new FormData(form);
        let voteData = null;

        // Encontrar qual emoção foi votada
        for (let [emotion, value] of formData.entries()) {
            if (value) {
                const valueIndex = chartLabels.indexOf(value + '%');
                voteData = { emotion, valueIndex };
                break;
            }
        }
        
        // Simplifiquei: pegando apenas o primeiro voto se o usuário clicar em vários
        const selectedRadio = form.querySelector('input[type="radio"]:checked');
        if (selectedRadio) {
            const emotion = selectedRadio.name;
            const value = selectedRadio.value;
            const valueIndex = chartLabels.indexOf(value);

            // Enviar voto para o servidor
            socket.emit('vote', { emotion: emotion, valueIndex: valueIndex });
            
            // Mostrar mensagem de agradecimento
            form.style.display = 'none';
            thankYouMessage.style.display = 'block';
        } else {
            alert('Por favor, selecione uma opção.');
        }
    });

    // --- Lógica do Socket.IO ---
    socket.on('updateData', (votes) => {
        // votes = { ansiedade: [0,1,2,0,0], tranquila: [...], ...}
        chartInstances.ansiedadeChart.data.datasets[0].data = votes.ansiedade;
        chartInstances.ansiedadeChart.update();

        chartInstances.tranquilaChart.data.datasets[0].data = votes.tranquila;
        chartInstances.tranquilaChart.update();

        chartInstances.acolhidaChart.data.datasets[0].data = votes.acolhida;
        chartInstances.acolhidaChart.update();
        
        chartInstances.excluidaChart.data.datasets[0].data = votes.excluida;
        chartInstances.excluidaChart.update();

        chartInstances.irritadaChart.data.datasets[0].data = votes.irritada;
        chartInstances.irritadaChart.update();
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
