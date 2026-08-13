import net from 'net';
import userMessage from 'App.tsx';
const HOST = '127.0.0.1';
const PORT = 65432;

function connectAndSend() {
    const client = new net.Socket();

    client.connect(PORT, HOST, () => {
        console.log(`[JS] Python alıcısına bağlanıldı.`);

        // ÖRNEK: Botunuzun bulduğu veriyi sürekli göndermek için zamanlayıcı
        // Gerçek projenizde bu kısmı botunuzun tetiklediği fonksiyona bağlayabilirsiniz
        let count = 1;
        const intervalId = setInterval(() => {
            if (client.writable) {
                const message = userMessage;
                client.write(message);
                console.log(`[JS] Veri gönderildi: ${message}`);
            }
        }, 3000); // 3 saniyede bir veri gönderir

        // Bağlantı koparsa zamanlayıcıyı temizle
        client.on('close', () => {
            clearInterval(intervalId);
        });
    });

    // Bağlantı hatası durumunda (Örn: Python kapalıysa) çökmeyi engeller
    client.on('error', (err) => {
        console.log(`[JS] Alıcıya bağlanılamadı (Python kapalı olabilir). 3 saniye sonra tekrar denenecek...`);
    });

    // Bağlantı koptuğunda otomatik olarak yeniden bağlanmayı dener
    client.on('close', () => {
        setTimeout(connectAndSend, 3000); // 3 saniye sonra yeniden bağlan
    });
}

// Sistemi başlat
connectAndSend();
