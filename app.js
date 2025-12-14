const fileInput = document.getElementById("fileInput");
const canvas = document.getElementById("pdfCanvas");
const ctx = canvas.getContext("2d");

fileInput.addEventListener("change", async function () {
  const file = this.files[0];
  if (!file) return;

  const fileReader = new FileReader();
  fileReader.onload = async function () {
    const typedArray = new Uint8Array(this.result);

    const pdf = await pdfjsLib.getDocument(typedArray).promise;
    const page = await pdf.getPage(1);

    const viewport = page.getViewport({ scale: 1.5 });
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({
      canvasContext: ctx,
      viewport: viewport,
    }).promise;
  };

  fileReader.readAsArrayBuffer(file);
});
