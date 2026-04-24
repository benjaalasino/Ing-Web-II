if (!window.auth.checkAuth('user')) {
    throw new Error('No autorizado');
}

window.layout.renderHeader('upload-ticket.html');

const modeManual = document.getElementById('modeManual');
const modeTicket = document.getElementById('modeTicket');
const ticketUploadArea = document.getElementById('ticketUploadArea');
const inputTicketImage = document.getElementById('inputTicketImage');
const ticketPreview = document.getElementById('ticketPreview');
const btnProcessTicket = document.getElementById('btnProcessTicket');
const ticketProcessingStatus = document.getElementById('ticketProcessingStatus');

const inputCommerce = document.getElementById('inputCommerce');
const inputDate = document.getElementById('inputDate');
const inputAmount = document.getElementById('inputAmount');
const selectCategory = document.getElementById('selectCategory');
const inputDescription = document.getElementById('inputDescription');
const btnSaveExpense = document.getElementById('btnSaveExpense');
const errorMessage = document.getElementById('errorMessage');
const successMessage = document.getElementById('successMessage');
const postSuccessActions = document.getElementById('postSuccessActions');
const btnRegisterAnother = document.getElementById('btnRegisterAnother');

let selectedFile = null;
const requiredFields = [
    { el: inputCommerce, key: 'commerce' },
    { el: inputDate, key: 'date' },
    { el: inputAmount, key: 'amount' }
];

window.ui.CATEGORIES.forEach((category) => {
    selectCategory.insertAdjacentHTML('beforeend', `<option value="${category}">${category}</option>`);
});

const setMode = (mode) => {
    const ticketMode = mode === 'ticket';
    ticketUploadArea.classList.toggle('hidden', !ticketMode);
    modeManual.className = `btn ${ticketMode ? 'btn-outline-secondary' : 'btn-primary'}`;
    modeTicket.className = `btn ${ticketMode ? 'btn-primary' : 'btn-outline-secondary'}`;
};

const resetWarningBorders = () => {
    requiredFields.forEach(({ el }) => el.classList.remove('field-warning'));
};

const validateImage = (file) => {
    if (!file) return 'Selecciona una imagen.';
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) return 'Formato invalido. Usa JPG, PNG, WEBP o PDF.';
    if (file.size > 5 * 1024 * 1024) return 'La imagen supera 5MB.';
    return null;
};

const validateExpense = () => {
    const nowDate = new Date().toISOString().slice(0, 10);
    if (!inputCommerce.value.trim() || !inputDate.value || !inputAmount.value || !selectCategory.value) {
        return 'Completa todos los campos requeridos.';
    }
    if (inputDate.value > nowDate) return 'La fecha no puede ser futura.';
    const amount = Number(inputAmount.value);
    if (!Number.isFinite(amount) || amount <= 0) return 'El monto debe ser mayor a cero.';
    return null;
};

const clearForm = () => {
    [inputCommerce, inputDate, inputAmount, inputDescription, selectCategory, inputTicketImage]
        .forEach((el) => el.value = '');
    selectedFile = null;
    if (ticketPreview.src && ticketPreview.src.startsWith('blob:')) {
        URL.revokeObjectURL(ticketPreview.src);
    }
    ticketPreview.src = '';
    ticketPreview.classList.add('hidden');
    btnProcessTicket.classList.add('hidden');
    ticketProcessingStatus.textContent = '';
    resetWarningBorders();
};

// Mode toggle
setMode('manual');
modeManual.addEventListener('click', () => setMode('manual'));
modeTicket.addEventListener('click', () => setMode('ticket'));

// Drop zone
const dropZone = document.getElementById('dropZone');
if (dropZone) {
    dropZone.addEventListener('click', () => inputTicketImage.click());
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('drag-over'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        if (e.dataTransfer.files.length) {
            inputTicketImage.files = e.dataTransfer.files;
            inputTicketImage.dispatchEvent(new Event('change'));
        }
    });
}

// Warning border removal on input
requiredFields.forEach(({ el }) => {
    el.addEventListener('input', () => el.classList.remove('field-warning'));
});

// Image selection
inputTicketImage.addEventListener('change', () => {
    window.ui.hideMessage(errorMessage);
    const file = inputTicketImage.files[0];
    const imageError = validateImage(file);

    if (imageError) {
        selectedFile = null;
        ticketPreview.classList.add('hidden');
        btnProcessTicket.classList.add('hidden');
        window.ui.showMessage(errorMessage, imageError, 'error');
        return;
    }

    selectedFile = file;
    if (file.type === 'application/pdf') {
        ticketPreview.classList.add('hidden');
        ticketProcessingStatus.textContent = 'PDF seleccionado: ' + file.name;
    } else {
        ticketPreview.src = URL.createObjectURL(file);
        ticketPreview.classList.remove('hidden');
        ticketProcessingStatus.textContent = '';
    }
    btnProcessTicket.classList.remove('hidden');
});

// Process ticket with AI
btnProcessTicket.addEventListener('click', () => {
    window.ui.hideMessage(errorMessage);
    resetWarningBorders();

    const imageError = validateImage(selectedFile);
    if (imageError) {
        window.ui.showMessage(errorMessage, imageError, 'error');
        return;
    }

    ticketProcessingStatus.textContent = 'Procesando ticket con IA...';

    window.ui.withLoading(btnProcessTicket, 'Procesando...', 'Procesar con IA', async () => {
        try {
            const formData = new FormData();
            formData.append('image', selectedFile);

            const data = await window.apiFetch('/tickets/upload', {
                method: 'POST',
                body: formData
            });

            requiredFields.forEach(({ el, key }) => {
                el.value = data[key] || '';
                el.classList.toggle('field-warning', !data[key]);
            });

            ticketProcessingStatus.textContent = 'Ticket procesado. Revisa los datos antes de guardar.';
        } catch (error) {
            window.ui.showMessage(errorMessage, error.message, 'error');
            ticketProcessingStatus.textContent = '';
        }
    });
});

// Save expense
btnSaveExpense.addEventListener('click', () => {
    window.ui.hideMessage(errorMessage);
    window.ui.hideMessage(successMessage);

    const validationError = validateExpense();
    if (validationError) {
        window.ui.showMessage(errorMessage, validationError, 'error');
        return;
    }

    window.ui.withLoading(btnSaveExpense, 'Guardando...', 'Guardar gasto', async () => {
        try {
            await window.apiFetch('/expenses', {
                method: 'POST',
                body: JSON.stringify({
                    commerce: inputCommerce.value.trim(),
                    date: inputDate.value,
                    amount: Number(inputAmount.value),
                    category: selectCategory.value,
                    description: inputDescription.value.trim(),
                    imageUrl: null
                })
            });

            clearForm();
            setMode('manual');
            window.ui.showMessage(successMessage, 'Gasto registrado exitosamente.', 'success');
            postSuccessActions.classList.remove('hidden');
        } catch (error) {
            window.ui.showMessage(errorMessage, error.message, 'error');
        }
    });
});

// Register another
btnRegisterAnother.addEventListener('click', () => {
    clearForm();
    postSuccessActions.classList.add('hidden');
    window.ui.hideMessage(successMessage);
});
