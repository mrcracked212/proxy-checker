import fs from 'fs';
import axios from 'axios';
import chalk from 'chalk';

/**
 * Fungsi untuk memeriksa apakah proxy aktif
 * @param {string} proxyUrl - URL proxy dalam format 'http://username:password@proxyserver:port'
 * @returns {Promise<{url: string, status: string}>} - Mengembalikan objek dengan URL dan status
 */
async function checkProxy(proxyUrl) {
    try {
        const response = await axios.get('http://httpbin.org/ip', {
            proxy: {
                host: proxyUrl.split(':')[2].split('@')[1], // Mengambil host dari URL proxy
                port: parseInt(proxyUrl.split(':')[2].split('@')[0]), // Mengambil port dari URL proxy
            },
            timeout: 5000 // Timeout 5 detik
        });

        return { url: proxyUrl, status: 'active' }; // Proxy aktif
    } catch (error) {
        return { url: proxyUrl, status: 'inactive' }; // Proxy tidak aktif
    }
}

/**
 * Fungsi untuk membaca file dan memeriksa semua proxy
 * @param {string} filePath - Path ke file yang berisi daftar proxy
 */
async function checkProxiesFromFile(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        const proxies = data.split('\n').filter(line => line.trim() !== ''); // Menghapus baris kosong

        // Buat atau bersihkan file output
        fs.writeFileSync('active_proxies.txt', '', 'utf8');
        fs.writeFileSync('inactive_proxies.txt', '', 'utf8');

        for (const proxy of proxies) {
            const result = await checkProxy(proxy.trim());
            const output = `${result.url} ${result.status}`;

            // Menyimpan hasil ke file secara real-time
            if (result.status === 'active') {
                console.log(chalk.green(output)); // Tampilkan aktif dengan warna hijau
                fs.appendFileSync('active_proxies.txt', result.url + '\n', 'utf8');
            } else {
                console.log(chalk.red(output)); // Tampilkan tidak aktif dengan warna merah
                fs.appendFileSync('inactive_proxies.txt', result.url + '\n', 'utf8');
            }
        }

        console.log('Hasil pemeriksaan telah disimpan ke dalam file active_proxies.txt dan inactive_proxies.txt');

    } catch (error) {
        console.error('Error membaca file:', error.message);
    }
}

// Contoh penggunaan
const filePath = 'proxies.txt'; // Ganti dengan path ke file proxy Anda
checkProxiesFromFile(filePath);
