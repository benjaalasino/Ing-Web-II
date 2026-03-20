const API_BASE_URL = 'http://localhost:3000/api';
const ALLOWED_IMAGE_TYPES = new Set(['image/png', 'image/jpeg']);

const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('receiptImages');
const previewGrid = document.getElementById('previewGrid');
const fileCounter = document.getElementById('fileCounter');
const sizeCounter = document.getElementById('sizeCounter');
const clearBtn = document.getElementById('clearBtn');
const saveBtn = document.getElementById('saveBtn');
const userGreeting = document.getElementById('userGreeting');
const extractBtn = document.getElementById('extractBtn');
const extractStatus = document.getElementById('extractStatus');
const resultVendor = document.getElementById('resultVendor');
const resultDate = document.getElementById('resultDate');
const resultTotal = document.getElementById('resultTotal');
const resultTax = document.getElementById('resultTax');
const resultCurrency = document.getElementById('resultCurrency');
const resultInvoiceNumber = document.getElementById('resultInvoiceNumber');
const resultRawText = document.getElementById('resultRawText');

let selectedFiles = [];

const currentUser = JSON.parse(localStorage.getItem('gc_current_user') || 'null');
if (userGreeting) {
    const safeName = currentUser && currentUser.name ? currentUser.name : 'invitado';
    userGreeting.textContent = `Hola, ${safeName}. Aqui extraemos datos desde facturas.`;
}

const formatBytes = (bytes) => {
    if (bytes < 1024) {
        return `${bytes} B`;
    }

    const kb = bytes / 1024;
    if (kb < 1024) {
        return `${kb.toFixed(1)} KB`;
    }

    return `${(kb / 1024).toFixed(2)} MB`;
};

const safeValue = (value) => {
    if (value === null || value === undefined || value === '') {
        return '-';
    }
    return String(value);
};

const resetExtractResult = () => {
    resultVendor.textContent = '-';
    resultDate.textContent = '-';
    resultTotal.textContent = '-';
    resultTax.textContent = '-';
    resultCurrency.textContent = '-';
    resultInvoiceNumber.textContent = '-';
    resultRawText.textContent = '-';
};

const updateStatus = () => {
    const totalSize = selectedFiles.reduce((sum, file) => sum + file.size, 0);
    const count = selectedFiles.length;

    fileCounter.textContent = `${count} ${count === 1 ? 'imagen seleccionada' : 'imagenes seleccionadas'}`;
    sizeCounter.textContent = formatBytes(totalSize);

    clearBtn.disabled = count === 0;
    saveBtn.disabled = count === 0;
    extractBtn.disabled = count === 0;

    if (count === 0) {
        extractStatus.textContent = 'Selecciona una factura en PNG o JPEG para comenzar.';
    }
};

const renderPreviews = () => {
    previewGrid.innerHTML = '';

    selectedFiles.forEach((file) => {
        const card = document.createElement('article');
        card.className = 'preview-card';

        const image = document.createElement('img');
        image.alt = file.name;
        image.src = URL.createObjectURL(file);

        const meta = document.createElement('div');
        meta.className = 'preview-meta';

        const name = document.createElement('span');
        name.className = 'preview-name';
        name.textContent = file.name;

        const size = document.createElement('span');
        size.className = 'preview-size';
        size.textContent = formatBytes(file.size);

        meta.appendChild(name);
        meta.appendChild(size);
        card.appendChild(image);
        card.appendChild(meta);
        previewGrid.appendChild(card);
    });
};

const getAllowedFiles = (incomingFiles) => {
    const allFiles = Array.from(incomingFiles);
    const validFiles = allFiles.filter((file) => ALLOWED_IMAGE_TYPES.has(file.type));
    const rejectedCount = allFiles.length - validFiles.length;

    if (rejectedCount > 0) {
        extractStatus.textContent = `Se omitieron ${rejectedCount} archivo(s). Solo se aceptan PNG y JPEG.`;
    }

    return validFiles;
};

const mergeFiles = (incomingFiles) => {
    const imageFiles = getAllowedFiles(incomingFiles);
    selectedFiles = [...selectedFiles, ...imageFiles];
    renderPreviews();
    updateStatus();
};

const extractInvoiceData = async (file) => {
    const formData = new FormData();
    formData.append('invoiceImage', file);

    const response = await fetch(`${API_BASE_URL}/receipts/extract`, {
        method: 'POST',
        body: formData
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'No se pudo extraer la factura.');
    }

    return data;
};

const renderExtractResult = (payload) => {
    const extracted = payload.extractedData || {};

    resultVendor.textContent = safeValue(extracted.vendorName);
    resultDate.textContent = safeValue(extracted.invoiceDate);
    resultTotal.textContent = safeValue(extracted.invoiceTotal);
    resultTax.textContent = safeValue(extracted.totalTax);
    resultCurrency.textContent = safeValue(extracted.currencyCode);
    resultInvoiceNumber.textContent = safeValue(extracted.invoiceId);
    resultRawText.textContent = safeValue(payload.rawText);
};

fileInput.addEventListener('change', () => {
    mergeFiles(fileInput.files);
    fileInput.value = '';
});

dropZone.addEventListener('dragover', (event) => {
    event.preventDefault();
    dropZone.classList.add('is-dragging');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('is-dragging');
});

dropZone.addEventListener('drop', (event) => {
    event.preventDefault();
    dropZone.classList.remove('is-dragging');
    mergeFiles(event.dataTransfer.files);
});

clearBtn.addEventListener('click', () => {
    selectedFiles = [];
    previewGrid.innerHTML = '';
    resetExtractResult();
    updateStatus();
});

saveBtn.addEventListener('click', () => {
    alert(`Listo. ${selectedFiles.length} imagen(es) preparadas para guardar en backend.`);
});

extractBtn.addEventListener('click', async () => {
    if (!selectedFiles.length) {
        return;
    }

    const firstFile = selectedFiles[0];
    extractBtn.disabled = true;
    extractStatus.textContent = `Extrayendo datos de: ${firstFile.name}...`;

    try {
        const result = await extractInvoiceData(firstFile);
        renderExtractResult(result);
        extractStatus.textContent = 'Extraccion completada correctamente.';
    } catch (error) {
        extractStatus.textContent = error.message || 'Fallo la extraccion de la factura.';
    } finally {
        extractBtn.disabled = selectedFiles.length === 0;
    }
});

resetExtractResult();
updateStatus();
