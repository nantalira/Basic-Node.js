//import modul
const http = require("http");
const url = require("url");
const mysql = require("mysql");

// Variable untuk host dan port
const host = "localhost";
const port = 10000;

// Kredensial database
var mydb = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "db_sekolah",
});

// Membuat koneksi ke database
mydb.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
});

// Menangani routing masing masing API
const requestListener = function (req, res) {
    // mengetahui API yang dipanggil
    const path_name = url.parse(req.url, true).pathname;
    // mengetahui method yang dipanggil
    switch (path_name) {
        case "/":
            console.log("Hit API index");
            res.writeHead(200);
            res.end("Backend CRUD Sekolah");
            break;

        case "/get_siswa":
            console.log("Hit API get_siswa");
            // query untuk mengambil data siswa
            var query_get = "SELECT * FROM siswa_node WHERE 1 = 1";
            // simpan parameter yang dikirimkan
            const parameter_get = url.parse(req.url, true).query;

            //cek apakah ada parameter nisn yang dikirimkan
            if ("nisn" in parameter_get) {
                query_get += " AND nisn = '" + mysql.escape(parameter_get["nisn"]);
            }

            //Ambil data dari database
            mydb.query(query_get, function (err, result, fields) {
                if (err) throw err;
                // kirim response
                var response_payload = {
                    description: "Berhasil mengambil data siswa",
                    data: result,
                };
                // kirim response
                res.setHeader("Content-Type", "application/json");
                res.writeHead(200);
                res.end(JSON.stringify(response_payload));
            });
            break;
        case "/insert_siswa":
            console.log("Hit API /insert_siswa");
            // menerima data dari request body
            var body_insert = [];
            req.on("data", (chunk) => {
                body_insert.push(chunk);
            }).on("end", () => {
                body_insert = JSON.parse(Buffer.concat(body_insert).toString());
                // memecah data
                var nisn = body_insert["nisn"];
                var nama_siswa = body_insert["nama_siswa"];
                var alamat = body_insert["alamat"];

                // query untuk insert data siswa
                var query_insert = "INSERT INTO siswa_node(nisn, nama_siswa, alamat) VALUES (?, ?, ?)";
                var values_insert = [nisn, nama_siswa, alamat];

                // insert data siswa
                mydb.query(query_insert, values_insert, function (err, result, fields) {
                    if (err) throw err;

                    // kirim response
                    var response_payload = {
                        description: "Berhasil menambahkan data siswa",
                        data: result,
                    };
                    // kirim response
                    res.setHeader("Content-Type", "application/json");
                    res.writeHead(200);
                    res.end(JSON.stringify(response_payload));
                });
            });
            break;

        case "/update_siswa":
            console.log("Hit API /update_siswa");
            // menerima data dari request body
            var body_update = [];
            req.on("data", (chunk) => {
                body_update.push(chunk);
            }).on("end", () => {
                body_update = JSON.parse(Buffer.concat(body_update).toString());
                // memecah data
                var id_siswa = body_update["id_siswa"];

                // query untuk update data siswa
                var query_update = "UPDATE siswa_node SET id_siswa = id_siswa";
                if ("nisn" in body_update) {
                    query_update += ", nisn = " + mysql.escape(body_update["nisn"]);
                }
                if ("nama_siswa" in body_update) {
                    query_update += ", nama_siswa = " + mysql.escape(body_update["nama_siswa"]);
                }
                if ("alamat" in body_update) {
                    query_update += ", alamat = " + mysql.escape(body_update["alamat"]);
                }
                // menentukan data yang akan diupdate berdasarkan id_siswa
                query_update += " WHERE id_siswa = " + mysql.escape(id_siswa);

                // update data siswa
                mydb.query(query_update, function (err, result, fields) {
                    if (err) throw err;
                    console.log(result);
                    // kirim response
                    var response_payload = {
                        description: "Berhasil mengupdate data siswa",
                        data: result,
                    };
                    // kirim response
                    res.setHeader("Content-Type", "application/json");
                    res.writeHead(200);
                    res.end(JSON.stringify(response_payload));
                });
            });
            break;

        case "/delete_siswa":
            console.log("Hit API /delete_siswa");

            //menyimpan parameter yang dikirimkan url
            const parameter_delete = url.parse(req.url, true).query;

            // query untuk delete data siswa berdasarkan id_siswa
            var query_delete = "DELETE FROM `siswa_node` WHERE id_siswa = " + mysql.escape(parameter_delete["id_siswa"]);

            // eksekusi delete data siswa
            mydb.query(query_delete, function (err, result, fields) {
                if (err) throw err;
                // kirim response
                var response_payload = {
                    description: "Berhasil menghapus data siswa",
                    data: result,
                };
                // kirim response
                res.setHeader("Content-Type", "application/json");
                res.writeHead(200);
                res.end(JSON.stringify(response_payload));
            });
            break;

        // jika API yang dipanggil tidak ada
        default:
            console.log(req.url);
            res.writeHead(404);
            res.end(JSON.stringify({ error: "Not found" }));
    }
};

// membuat server
const server = http.createServer(requestListener);
server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});
