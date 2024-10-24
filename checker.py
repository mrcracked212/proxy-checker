import requests
from concurrent.futures import ThreadPoolExecutor, as_completed
from colorama import init, Fore
import time

# Inisialisasi colorama
init(autoreset=True)

def check_proxy(proxy, retries=3):
    proxies = {
        "http": proxy,
        "https": proxy,
    }
    for attempt in range(retries):
        try:
            # Mengirim permintaan GET ke sebuah URL
            response = requests.get("http://httpbin.org/ip", proxies=proxies, timeout=2)  # Timeout 2 detik
            if response.status_code == 200:
                return proxy, True
        except requests.exceptions.RequestException:
            pass
    return proxy, False

def write_result_to_file(proxy, is_active):
    status = "active" if is_active else "inactive"
    with open("active_proxies.txt" if is_active else "inactive_proxies.txt", 'a') as file:
        file.write(proxy + "\n")

def check_proxies_from_file(file_path):
    with open(file_path, 'r') as file:
        proxies = [proxy.strip() for proxy in file.readlines() if proxy.strip()]  # Menghapus whitespace dan baris kosong

    # Meningkatkan jumlah thread
    with ThreadPoolExecutor(max_workers=20) as executor:  # Menggunakan 20 thread
        future_to_proxy = {executor.submit(check_proxy, proxy): proxy for proxy in proxies}

        for future in as_completed(future_to_proxy):
            proxy, is_active = future.result()
            status = "active" if is_active else "inactive"
            
            # Menampilkan hasil di konsol dengan warna
            if is_active:
                print(f"{proxy} {Fore.GREEN}{status}{Fore.RESET}")  # Warna hijau untuk active
            else:
                print(f"{proxy} {Fore.RED}{status}{Fore.RESET}")  # Warna merah untuk inactive
            
            # Menyimpan hasil ke file secara real-time
            write_result_to_file(proxy, is_active)

if __name__ == "__main__":
    # Ganti dengan path ke file yang berisi daftar proxy
    file_path = "proxy.txt"  # Contoh: "proxies.txt"
    
    start_time = time.time()  # Mulai pengukuran waktu
    check_proxies_from_file(file_path)
    end_time = time.time()  # Akhiri pengukuran waktu

    print(f"\nHasil proxy aktif disimpan di 'active_proxies.txt'")
    print(f"Hasil proxy tidak aktif disimpan di 'inactive_proxies.txt'")
    print(f"Waktu eksekusi: {end_time - start_time:.2f} detik")
