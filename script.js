document.addEventListener('DOMContentLoaded', function() {
    const socket = io();

    const form = document.getElementById('emotion-form');
    const thankYouMessage = document.getElementById('thank-you-message');

    // --- Configuração dos Gráficos de Rosca ---
    const chartLabels = ['0%', '25%', '50%', '75%', '100%'];
    const chartInstances = {};

    const chartColors = [
        'rgba(255, 99, 132, 0.7)',
        'rgba(54, 162, 235, 0.7)',
        'rgba(255, 206, 86, 0.7)',
        'rgba(75, 192, 192, 0.7)',
        'rgba(153, 102, 255, 0.7)',
    ];

    function createChart(chartId, label) {
        const ctx = document.getElementById(chartId).getContext('2d');
        chartInstances[chartId] = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: chartLabels,
                datasets: [{
                    label: label,
                    data: [0, 0, 0, 0, 0],
                    backgroundColor: chartColors,
                    borderColor: '#fff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed !== null) {
                                    label += context.parsed + ' votos';
                                }
                                return label;
                            }
                        }
                    }
                }
            }
        });
    }

    createChart('ansiedadeChart', 'Ansiedade');
    createChart('tranquilaChart', 'Tranquilidade');
    createChart('acolhidaChart', 'Acolhimento');
    createChart('excluidaChart', 'Exclusão');
    createChart('irritadaChart', 'Irritação');

    // --- Lógica do Formulário ---
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const selectedRadio = form.querySelector('input[type="radio"]:checked');
        if (selectedRadio) {
            const emotion = selectedRadio.name;
            const value = selectedRadio.value;
            // O valor já é a porcentagem (0, 25, 50...). Precisamos do índice.
            const valueIndex = chartLabels.findIndex(label => label.startsWith(value));

            if (valueIndex !== -1) {
                // Enviar voto para o servidor
                socket.emit('vote', { emotion: emotion, valueIndex: valueIndex });
                
                // Mostrar mensagem de agradecimento
                form.style.display = 'none';
                thankYouMessage.style.display = 'block';
            }
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
});
