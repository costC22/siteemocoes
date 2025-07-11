const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors()); // Adiciona o middleware do CORS

const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*", // Permite todas as origens, para simplificar.
        methods: ["GET", "POST"]
    }
});

// Serve os arquivos estáticos da pasta atual
app.use(express.static(__dirname));

// Rota de health check para o Render
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Rota raiz
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Estrutura de dados em memória para armazenar os votos
const initialChartData = {
    ansiedade: [0, 0, 0, 0, 0],
    tranquila: [0, 0, 0, 0, 0],
    acolhida: [0, 0, 0, 0, 0],
    excluida: [0, 0, 0, 0, 0],
    irritada: [0, 0, 0, 0, 0],
    desistir: [0, 0, 0, 0, 0],
    ignorado: [0, 0, 0, 0, 0],
    conversar: [0, 0, 0, 0, 0],
    importante: [0, 0, 0, 0, 0],
    nao_entendido: [0, 0, 0, 0, 0],
    negativos: [0, 0, 0, 0, 0],
};

let votes = JSON.parse(JSON.stringify(initialChartData)); // Deep copy

io.on('connection', (socket) => {
    console.log('Um usuário se conectou');

    // Envia os dados atuais para o usuário que acabou de se conectar
    socket.emit('updateData', votes);

    // Escuta por novos votos do formulário completo
    socket.on('submitEmotion', (data) => {
        console.log('Dados recebidos:', data);
        
        // Processa cada emoção enviada
        for (const emotion in data) {
            if (votes[emotion] && data[emotion] >= 0 && data[emotion] < 5) {
                votes[emotion][data[emotion]]++;
                console.log(`Voto registrado: ${emotion} -> categoria ${data[emotion]}`);
            }
        }
        
        // Transmite os dados atualizados para todos os clientes
        io.emit('updateData', votes);
        console.log('Dados atualizados enviados para todos os clientes');
    });

    // Mantém compatibilidade com o evento antigo 'vote' se necessário
    socket.on('vote', (data) => {
        // data = { emotion: 'ansiedade', valueIndex: 2 }
        if (votes[data.emotion] && data.valueIndex >= 0 && data.valueIndex < 5) {
            votes[data.emotion][data.valueIndex]++;
            
            // Transmite os dados atualizados para todos os clientes
            io.emit('updateData', votes);
        }
    });

    socket.on('disconnect', () => {
        console.log('Um usuário se desconectou');
    });
});

// Tratamento de erros não capturados
process.on('uncaughtException', (err) => {
    console.error('Erro não capturado:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Promise rejeitada não tratada:', reason);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log(`URL: http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM recebido, fechando servidor...');
    server.close(() => {
        console.log('Servidor fechado');
        process.exit(0);
    });
});
