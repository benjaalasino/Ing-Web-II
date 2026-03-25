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

window.ui.CATEGORIES.forEach((category) => {
    selectCategory.insertAdjacentHTML('beforeend', `<option value="${category}">${category}</option>`);
});

const setMode = (mode) => {
    const ticketMode = mode === 'ticket';
    ticketUploadArea.classList.toggle('hidden', !ticketMode);
    modeManual.className = `btn ${ticketMode ? 'btn-secondary' : 'btn-primary'}`;
    modeTicket.className = `btn ${ticketMode ? 'btn-primary' : 'btn-secondary'}`;
};

setMode('manual');
modeManual.addEventListener('click', () => setMode('manual'));
modeTicket.addEventListener('click', () => setMode('ticket'));

const resetWarningBorders = () => {
    [inputCommerce, inputDate, inputAmount].forEach((field) => {
        field.classList.remove('field-warning');
    });
};

const validateImage = (file) => {
    if (!file) {
        return 'Selecciona una imagen.';
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        return 'Formato invalido. Usa JPG, PNG o WEBP.';
    }

    if (file.size > 5 * 1024 * 1024) {
        return 'La imagen supera 5MB.';
    }

    return null;
};

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
    ticketPreview.src = URL.createObjectURL(file);
    ticketPreview.classList.remove('hidden');
    btnProcessTicket.classList.remove('hidden');
    ticketProcessingStatus.textContent = '';
});

btnProcessTicket.addEventListener('click', async () => {
    window.ui.hideMessage(errorMessage);
    resetWarningBorders();

    const imageError = validateImage(selectedFile);
    if (imageError) {
        window.ui.showMessage(errorMessage, imageError, 'error');
        return;
    }

    btnProcessTicket.disabled = true;
    btnProcessTicket.textContent = 'Procesando...';
    ticketProcessingStatus.textContent = 'Procesando ticket con IA...';

    try {
        const formData = new FormData();
        formData.append('image', selectedFile);

        const data = await window.apiFetch('/tickets/upload', {
            method: 'POST',
            body: formData
        });

        inputCommerce.value = data.commerce || '';
        inputDate.value = data.date || '';
        inputAmount.value = data.amount || '';

        if (!data.commerce) {
            inputCommerce.classList.add('field-warning');
        }
        if (!data.date) {
            inputDate.classList.add('field-warning');
        }
        if (!data.amount) {
            inputAmount.classList.add('field-warning');
        }

        ticketProcessingStatus.textContent = 'Ticket procesado. Revisa los datos antes de guardar.';
    } catch (error) {
        window.ui.showMessage(errorMessage, error.message, 'error');
        ticketProcessingStatus.textContent = '';
    } finally {
        btnProcessTicket.disabled = false;
        btnProcessTicket.textContent = 'Procesar con IA';
    }
});

[inputCommerce, inputDate, inputAmount].forEach((field) => {
    field.addEventListener('input', () => field.classList.remove('field-warning'));
});

const validateExpense = () => {
    const nowDate = new Date().toISOString().slice(0, 10);

    if (!inputCommerce.value.trim() || !inputDate.value || !inputAmount.value || !selectCategory.value) {
        return 'Completa todos los campos requeridos.';
    }

    if (inputDate.value > nowDate) {
        return 'La fecha no puede ser futura.';
    }

    const amount = Number(inputAmount.value);
    if (!Number.isFinite(amount) || amount <= 0) {
        return 'El monto debe ser mayor a cero.';
    }

    return null;
};

const clearForm = () => {
    inputCommerce.value = '';
    inputDate.value = '';
    inputAmount.value = '';
    inputDescription.value = '';
    selectCategory.value = '';
    inputTicketImage.value = '';
    selectedFile = null;
    ticketPreview.classList.add('hidden');
    btnProcessTicket.classList.add('hidden');
    ticketProcessingStatus.textContent = '';
    resetWarningBorders();
};

btnSaveExpense.addEventListener('click', async () => {
    window.ui.hideMessage(errorMessage);
    window.ui.hideMessage(successMessage);

    const validationError = validateExpense();
    if (validationError) {
        window.ui.showMessage(errorMessage, validationError, 'error');
        return;
    }

    btnSaveExpense.disabled = true;
    btnSaveExpense.textContent = 'Guardando...';

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

        window.ui.showMessage(successMessage, 'Gasto registrado exitosamente.', 'success');
        postSuccessActions.classList.remove('hidden');
    } catch (error) {
        window.ui.showMessage(errorMessage, error.message, 'error');
    } finally {
        btnSaveExpense.disabled = false;
        btnSaveExpense.textContent = 'Guardar gasto';
    }
});

btnRegisterAnother.addEventListener('click', () => {
    clearForm();
    postSuccessActions.classList.add('hidden');
    window.ui.hideMessage(successMessage);
});
