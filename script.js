document.addEventListener('DOMContentLoaded', function() {
    const socket = io();

    const form = document.getElementById('emotion-form');
    const thankYouMessage = document.getElementById('thank-you-message');

    // Elementos de alternância de visualização
    const showChartsBtn = document.getElementById('show-charts-btn');
    const showDataBtn = document.getElementById('show-data-btn');
    const chartsView = document.getElementById('charts-view');
    const dataView = document.getElementById('data-view');

    const chartLabels = ['0%', '25%', '50%', '75%', '100%'];
    const chartInstances = {};
    let updateTimeout = null;
    let scrollTimeout = null;

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

    // Função debounce para otimizar performance
    function debounce(func, wait) {
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(updateTimeout);
                func(...args);
            };
            clearTimeout(updateTimeout);
            updateTimeout = setTimeout(later, wait);
        };
    }

    // Configuração dos sliders com debounce
    const sliders = document.querySelectorAll('.slider');
    sliders.forEach(slider => {
        const valueDisplay = document.getElementById(`${slider.id}-value`);
        
        // Atualiza o valor exibido quando o slider é movido (com debounce)
        slider.addEventListener('input', debounce(function() {
            valueDisplay.textContent = this.value + '%';
        }, 50));
        
        // Inicializa o valor
        valueDisplay.textContent = slider.value + '%';
    });

    function createChart(chartId, label) {
        const ctx = document.getElementById(chartId).getContext('2d');
        
        const config = {
            type: 'doughnut',
            data: {
                labels: chartLabels,
                datasets: [{
                    data: [0, 0, 0, 0, 0],
                    backgroundColor: [
                        'rgba(34, 197, 94, 0.7)',   // Verde para 0%
                        'rgba(59, 130, 246, 0.7)',  // Azul para 25%
                        'rgba(245, 158, 11, 0.7)',  // Amarelo para 50%
                        'rgba(239, 68, 68, 0.7)',   // Vermelho para 75%
                        'rgba(147, 51, 234, 0.7)',  // Roxo para 100%
                    ],
                    borderColor: [
                        'rgba(34, 197, 94, 1)',
                        'rgba(59, 130, 246, 1)',
                        'rgba(245, 158, 11, 1)',
                        'rgba(239, 68, 68, 1)',
                        'rgba(147, 51, 234, 1)',
                    ],
                    borderWidth: 2,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            font: {
                                size: 12,
                                family: 'Inter'
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: 'white',
                        bodyColor: 'white',
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: true,
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed;
                                return `${label}: ${value} votos`;
                            }
                        }
                    }
                },
                animation: {
                    animateRotate: false, // Desabilita animação de rotação
                    animateScale: false,  // Desabilita animação de escala
                    duration: 300        // Reduz duração das animações
                },
                transitions: {
                    active: {
                        animation: {
                            duration: 200
                        }
                    }
                }
            }
        };
        
        chartInstances[chartId] = new Chart(ctx, config);
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

    // Lógica do formulário
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const formData = new FormData(form);
        const data = {};
        
        // Converte os valores dos sliders para o formato esperado pelo servidor
        for (let [key, value] of formData.entries()) {
            const percentage = parseInt(value);
            let category;
            
            if (percentage <= 20) category = 0;      // 0%
            else if (percentage <= 40) category = 1; // 25%
            else if (percentage <= 60) category = 2; // 50%
            else if (percentage <= 80) category = 3; // 75%
            else category = 4;                       // 100%
            
            data[key] = category;
        }
        
        socket.emit('submitEmotion', data);
        
        // Mostra mensagem de agradecimento
        thankYouMessage.style.display = 'flex';
        form.style.display = 'none';
    });

    // Função para atualizar a tabela de dados
    function updateDataView(votes) {
        let tableHTML = '<table class="data-table"><thead><tr><th>Indicador Emocional</th>';
        chartLabels.forEach(label => {
            tableHTML += `<th>${label}</th>`;
        });
        tableHTML += '</tr></thead><tbody>';

        for (const emotion in votes) {
            if (questionLabels[emotion]) {
                tableHTML += `<tr><td><strong>${questionLabels[emotion]}</strong></td>`;
                votes[emotion].forEach(count => {
                    tableHTML += `<td>${count}</td>`;
                });
                tableHTML += '</tr>';
            }
        }

        tableHTML += '</tbody></table>';
        dataView.innerHTML = tableHTML;
    }

    // Atualiza contador de participantes
    function updateParticipantCount(count) {
        const participantElement = document.querySelector('.stat-card .stat-number');
        if (participantElement) {
            participantElement.textContent = count;
        }
    }

    // Função otimizada para atualizar gráficos
    const updateCharts = debounce((votes) => {
        for (const chartId in chartInstances) {
            const emotionKey = chartId.replace('Chart', '');
            if (votes[emotionKey]) {
                const chart = chartInstances[chartId];
                chart.data.datasets[0].data = votes[emotionKey];
                chart.update('none'); // Atualiza sem animação
            }
        }
    }, 100);

    socket.on('updateData', (votes) => {
        console.log('Dados recebidos:', votes);

        // Atualiza os gráficos com debounce
        updateCharts(votes);

        // Atualiza a visualização de dados em tabela
        updateDataView(votes);
        
        // Atualiza contador de participantes (soma total de votos)
        const totalVotes = Object.values(votes).reduce((sum, emotionVotes) => {
            return sum + emotionVotes.reduce((a, b) => a + b, 0);
        }, 0);
        updateParticipantCount(totalVotes);
    });

    // Smooth scroll otimizado para links de navegação
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Adiciona efeito de scroll no header com debounce
    const updateHeader = debounce(function() {
        const header = document.querySelector('.header');
        if (window.scrollY > 100) {
            header.style.background = 'rgba(255, 255, 255, 0.98)';
            header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.boxShadow = 'none';
        }
    }, 16); // ~60fps

    window.addEventListener('scroll', updateHeader, { passive: true });

    // Limpeza de timeouts quando a página é descarregada
    window.addEventListener('beforeunload', () => {
        if (updateTimeout) clearTimeout(updateTimeout);
        if (scrollTimeout) clearTimeout(scrollTimeout);
    });
});
