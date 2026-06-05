# PDA Simulator 

Simulasi mesin **Pushdown Automata (PDA)** berbasis web. Program ini memungkinkan pengguna menginputkan string dan menentukan apakah string tersebut diterima (**ACCEPTED**) atau ditolak (**REJECTED**) oleh mesin PDA yang dipilih.

Dibuat sebagai Tugas Praktikum #3 Mata Kuliah Otomata A  
Departemen Teknik Informatika, Institut Teknologi Sepuluh Nopember (ITS)

**Anggota Kelompok 5:**  
  - Kartika Nana Naulita (5025241021)  
  - Safa Mashita (5025241022)  
  - Acquirell Kriswanto (5025241035)  

**Deployed website:** 

---

## Struktur File

```
📁 pda-simulator/
├── index.html   ← Struktur tampilan (HTML)
├── style.css    ← Desain & layout (CSS)
└── script.js    ← Logika & algoritma PDA (JavaScript)
```

## Fitur Program

### 1. Tiga Mesin PDA Bawaan

| PDA | Bahasa | Contoh ACCEPTED | Contoh REJECTED |
|-----|--------|-----------------|-----------------|
| **aⁿbⁿ** | String dengan jumlah 'a' = jumlah 'b' secara berurutan | `ab`, `aabb`, `aaabbb` | `aab`, `ba`, `aaabbbb` |
| **Palindrome sXs̃** | String berbentuk s + X + reverse(s) | `X`, `aXa`, `abbXbba` | `aXb`, `abXab` |
| **#a = #b** | Jumlah karakter 'a' sama dengan 'b' (urutan bebas) | `ab`, `ba`, `abba`, `baba` | `a`, `aab`, `bbb` |

### 2. Simulasi Langkah-per-Langkah (Step Mode)
- Tekan tombol **STEP** untuk menjalankan simulasi satu langkah per klik
- Navigasi maju/mundur dengan tombol **Next ▶** dan **◀ Prev**
- Setiap langkah menampilkan perubahan state, tape head, dan isi stack secara real-time

### 3. Batch Test
- Input beberapa string sekaligus (satu baris = satu string)
- Semua string diuji otomatis dan hasilnya ditampilkan sekaligus
- Berguna untuk menguji banyak kasus sekaligus

### 4. Visualisasi Input Tape & Stack
- **Input Tape:** menampilkan posisi tape head (▲) saat membaca karakter
- **Pushdown Stack:** setiap karakter ditampilkan sebagai chip berwarna berbeda (a = biru, b = oranye, X = kuning)

### 5. Trace Log
- Mencatat seluruh riwayat transisi: state, karakter yang dibaca, isi stack, dan aksi (PUSH/POP)

### 6. Statistik Sesi
- Menghitung total string yang di-test, berapa ACCEPTED, dan berapa REJECTED

### 7. Custom PDA Builder
- Pengguna dapat mendefinisikan mesin PDA sendiri dari nol
- Input: transisi `(state, read, stack_top) → (next_state, push)`
- Tentukan start state dan accept state secara bebas

---

## Algoritma PDA

### Komponen Mesin PDA
Sesuai materi (Pertemuan VII — Otomata ITS), setiap PDA terdiri dari:

| Komponen | Keterangan |
|----------|------------|
| **Σ (Alphabet)** | Himpunan karakter yang valid sebagai input |
| **Start State** | State awal saat simulasi dimulai |
| **Accept State** | State yang menandakan string diterima |
| **Input Tape** | Rangkaian sel berisi karakter input |
| **Pushdown Stack** | Memori tambahan berbasis LIFO |
| **Operator READ** | Membaca satu karakter dari tape |
| **Operator PUSH** | Memasukkan karakter ke stack |
| **Operator POP** | Mengambil/menghapus karakter dari stack |

### Notasi Transisi
```
(q, a, A) → (p, BC)
```
- Dari state `q`, baca karakter `a` dari tape
- Pop `A` dari top of stack
- Pindah ke state `p`
- Push `BC` ke stack (`B` menjadi top baru)

Gunakan `λ` (lambda) untuk epsilon — artinya tidak membaca karakter atau stack kosong.

### Kondisi ACCEPTED
String diterima jika simulasi **berhenti di accept state** pada saat **seluruh karakter input sudah terbaca**.

### Kondisi REJECTED
String ditolak jika:
- Tidak ada transisi yang cocok (crash)
- Input habis tapi tidak berada di accept state
- Berada di accept state tapi input belum habis

### Alur Eksekusi (Pseudocode)
```
state    ← startState
stack    ← [Z]           // Z = bottom-of-stack marker
idx      ← 0             // posisi tape head

while belum selesai:
    top      = stack.top()
    readChar = input[idx] atau λ (jika input habis)

    cari transisi yang cocok untuk (state, readChar, top)
    jika tidak ada → cari transisi epsilon (state, λ, top)
    jika tetap tidak ada → STOP

    eksekusi transisi:
        pop top dari stack
        jika bukan transisi epsilon → idx++
        push simbol baru ke stack
        state ← nextState

    jika state ∈ acceptStates dan idx = panjang input:
        return ACCEPTED

return REJECTED
```

---

## Contoh Penelusuran: aⁿbⁿ untuk "aaabbb"

| Langkah | State | Baca | Stack | Aksi |
|---------|-------|------|-------|------|
| 0 | q0 | — | Z | START |
| 1 | q1 | a | aZ | PUSH a |
| 2 | q1 | a | aaZ | PUSH a |
| 3 | q1 | a | aaaZ | PUSH a |
| 4 | q2 | b | aaZ | POP a |
| 5 | q2 | b | aZ | POP a |
| 6 | q2 | b | Z | POP a |
| 7 | **q3** | λ | Z | → **ACCEPTED** |

---

## Teknologi

- **HTML5** — struktur antarmuka
- **CSS3** — desain, animasi, layout grid
- **Vanilla JavaScript** — algoritma PDA, manipulasi DOM
- **Google Fonts** — Space Mono + DM Sans
- Tidak menggunakan framework atau library eksternal

---
