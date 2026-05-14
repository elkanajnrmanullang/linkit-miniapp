# PT LINKIT - Mini App Assessment
# Elkana Juanro Manullang

Repositori ini berisi Mini App Fullstack yang dikembangkan untuk Technical Test. Aplikasi ini mengambil data eksternal dari SampleAPIs dan menyimpannya ke dalam PostgreSQL. 

## Tech Stack & Architecture

* **Backend:** Node.js (Express)
  *Alasan:* Sangat ringan dan efisien untuk membangun RESTful API serta pemrosesan I/O asinkron.
* **Frontend:** React.js + Tailwind CSS
  *Alasan:*Memberikan performa tinggi melalui Virtual DOM untuk merender data dari API, sementara Tailwind mempercepat proses styling UI.
* **Database:** PostgreSQL
  *Alasan:* Relational database yang sangat tangguh untuk mengelola master data dan data transaksional, sesuai dengan requirement sistem.
* **ORM:** Prisma
  *Alasan:* Memastikan type-safety dan mempercepat eksekusi query database dengan penulisan skema yang deklaratif.
* **Infrastructure:** Docker & Nginx
  *Alasan:* Memastikan aplikasi memiliki environment yang terisolasi dan mudah di-deploy (Containerization), serta Nginx bertindak sebagai web server/reverse proxy untuk skalabilitas.