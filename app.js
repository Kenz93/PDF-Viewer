// Atur workerSrc untuk pdf.js
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

const fileInput = document.getElementById("fileInput");
const canvas = document.getElementById("pdfCanvas");
const ctx = canvas.getContext("2d");
const prevPageButton = document.getElementById("prevPage");
const nextPageButton = document.getElementById("nextPage");
const currentPageSpan = document.getElementById("currentPage");
const totalPagesSpan = document.getElementById("totalPages");
const controlsDiv = document.getElementById("controls");
const loaderDiv = document.getElementById("loader");

let pdfDoc = null;
let currentPageNum = 1;
const SCALE = 1.5; // Skala rendering

/**
 * Merender halaman PDF tertentu ke canvas
 * @param {number} num Halaman yang akan dirender (dimulai dari 1)
 */
async function renderPage(num) {
  if (!pdfDoc) return;

  currentPageNum = num;
  currentPageSpan.textContent = num;
  loaderDiv.classList.remove("hidden"); // Tampilkan loader

  try {
    const page = await pdfDoc.getPage(num);
    const viewport = page.getViewport({ scale: SCALE });

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const renderContext = {
      canvasContext: ctx,
      viewport: viewport,
    };

    await page.render(renderContext).promise;
    updateControls();
  } catch (error) {
    console.error("Kesalahan saat merender halaman:", error);
  } finally {
    loaderDiv.classList.add("hidden"); // Sembunyikan loader
  }
}

/**
 * Memuat dan menginisialisasi dokumen PDF
 * @param {Uint8Array} typedArray Data byte PDF
 */
async function loadPdf(typedArray) {
  // Sembunyikan canvas dan kontrol, tampilkan loader saat memproses
  canvas.classList.add("hidden");
  controlsDiv.classList.add("hidden");
  loaderDiv.classList.remove("hidden");

  try {
    pdfDoc = await pdfjsLib.getDocument(typedArray).promise;
    const total = pdfDoc.numPages;
    totalPagesSpan.textContent = total;

    // Atur halaman saat ini ke 1
    currentPageNum = 1;

    await renderPage(currentPageNum);

    // Tampilkan canvas dan kontrol setelah rendering pertama berhasil
    canvas.classList.remove("hidden");
    controlsDiv.classList.remove("hidden");
  } catch (error) {
    console.error("Kesalahan saat memuat dokumen PDF:", error);
    alert("Gagal memuat PDF. Pastikan file valid.");
    loaderDiv.classList.add("hidden");
    pdfDoc = null;
  }
}

/**
 * Memperbarui status tombol navigasi
 */
function updateControls() {
  prevPageButton.disabled = currentPageNum <= 1;
  nextPageButton.disabled = currentPageNum >= pdfDoc.numPages;
}

// --- Event Listeners ---

fileInput.addEventListener("change", function () {
  const file = this.files[0];
  if (!file) {
    pdfDoc = null;
    canvas.classList.add("hidden");
    controlsDiv.classList.add("hidden");
    return;
  }

  const fileReader = new FileReader();
  fileReader.onload = function () {
    const typedArray = new Uint8Array(this.result);
    loadPdf(typedArray);
  };

  fileReader.readAsArrayBuffer(file);
});

prevPageButton.addEventListener("click", () => {
  if (currentPageNum > 1) {
    renderPage(currentPageNum - 1);
  }
});

nextPageButton.addEventListener("click", () => {
  if (pdfDoc && currentPageNum < pdfDoc.numPages) {
    renderPage(currentPageNum + 1);
  }
});
