document.addEventListener('DOMContentLoaded', function() {
    const socket = io();

    const form = document.getElementById('emotion-form');
    const thankYouMessage = document.getElementById('thank-you-message');

    // Elementos de alternância de visualização
    const showChartsBtn = document.getElementById('show-charts-btn');
    const showDataBtn = document.getElementById('show-data-btn');
    const chartsView = document.getElementById('charts-view');
    const dataView = document.getElementById('data-view');

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

    // Mapeia o ID da pergunta para um rótulo legível
    const questionLabels = {
        ansiedade: 'Ansiedade',
        tranquila: 'Tranquilidade',
        acolhida: 'Acolhimento',
        excluida: 'Exclusão',
        irritada: 'Irritação',
        desistir: 'Vontade de Desistir',
        ignorado: 'Ignorado(a)',
        conversar: 'Vontade de Conversar',
        importante: 'Importante',
        nao_entendido: 'Não Entendido(a)',
        negativos: 'Pensamentos Negativos'
    };

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

    // Inicializa todos os gráficos
    Object.keys(questionLabels).forEach(key => {
        createChart(`${key}Chart`, questionLabels[key]);
    });

    // Lógica para alternar a visualização
    showChartsBtn.addEventListener('click', () => {
        chartsView.style.display = 'grid';
        dataView.style.display = 'none';
        showChartsBtn.classList.add('active');
        showDataBtn.classList.remove('active');
    });

    showDataBtn.addEventListener('click', () => {
        chartsView.style.display = 'none';
        dataView.style.display = 'block';
        showDataBtn.classList.add('active');
        showChartsBtn.classList.remove('active');
    });

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

    // Função para atualizar a tabela de dados
    function updateDataView(votes) {
        let tableHTML = '<table class="data-table"><thead><tr><th>Pergunta</th>';
        chartLabels.forEach(label => {
            tableHTML += `<th>${label}</th>`;
        });
        tableHTML += '</tr></thead><tbody>';

        for (const emotion in votes) {
            if (questionLabels[emotion]) {
                tableHTML += `<tr><td>${questionLabels[emotion]}</td>`;
                votes[emotion].forEach(count => {
                    tableHTML += `<td>${count}</td>`;
                });
                tableHTML += '</tr>';
            }
        }

        tableHTML += '</tbody></table>';
        dataView.innerHTML = tableHTML;
    }

    // --- Lógica do Socket.IO ---
    socket.on('updateData', (votes) => {
        console.log('Dados recebidos:', votes);

        // Atualiza os gráficos
        for (const chartId in chartInstances) {
            const emotionKey = chartId.replace('Chart', '');
            if (votes[emotionKey]) {
                chartInstances[chartId].data.datasets[0].data = votes[emotionKey];
                chartInstances[chartId].update();
            }
        }

        // Atualiza a visualização de dados em tabela
        updateDataView(votes);
    });
});
