const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ================================
// 🔴 CAMBIA SOLO ESTO CUANDO QUIERAS
// ================================
const RADIO_IP = '82.145.41.8';
const RADIO_PORT = 10194;
const RADIO_PATH = '/stream';
// ================================

app.use(cors());
app.use(express.static('public'));

// PROXY DEL STREAM
app.get('/stream', (req, res) => {
    // 1. Evitar que Node.js tumbe la conexión por inactividad/timeout
    req.setTimeout(0);
    res.setTimeout(0);

    const streamUrl = `http://${RADIO_IP}:${RADIO_PORT}${RADIO_PATH}`;
    console.log('Proxy a:', streamUrl);

    // 2. Configurar petición con User-Agent de reproductor real
    const options = {
        hostname: RADIO_IP,
        port: RADIO_PORT,
        path: RADIO_PATH,
        method: 'GET',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) VLC/3.0.18',
            'Accept': '*/*'
        }
    };

    const clientReq = http.get(options, (streamRes) => {
        if (streamRes.statusCode !== 200) {
            console.error(`Respuesta con status code: ${streamRes.statusCode}`);
            if (!res.headersSent) {
                res.status(streamRes.statusCode).end('Error en la fuente de radio');
            }
            return;
        }

        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.setHeader('Connection', 'keep-alive');

        // Transmitir flujo de datos
        streamRes.pipe(res);

        // 3. Destruir la conexión con la radio si el usuario cierra el reproductor
        req.on('close', () => {
            streamRes.destroy();
        });
    });

    clientReq.on('error', (err) => {
        console.error('Error del stream:', err.message);
        if (!res.headersSent) {
            res.status(500).end('Error al cargar el stream');
        }
    });
});

// INDEX
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// INICIAR SERVIDOR
app.listen(PORT, () => {
    console.log('===============================');
    console.log('Proxy de radio ACTIVO');
    console.log(`Servidor escuchando en puerto ${PORT}`);
    console.log(`Radio real: http://${RADIO_IP}:${RADIO_PORT}${RADIO_PATH}`);
    console.log('===============================');
});