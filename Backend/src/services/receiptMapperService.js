const getFieldContent = (field) => {
    if (!field) {
        return null;
    }

    if (field.valueString) {
        return field.valueString;
    }

    if (field.valueDate) {
        return field.valueDate;
    }

    if (field.valueCurrency && typeof field.valueCurrency.amount === 'number') {
        const amount = field.valueCurrency.amount;
        const currency = field.valueCurrency.currencySymbol || field.valueCurrency.currencyCode || '';
        return `${amount}${currency ? ` ${currency}` : ''}`;
    }

    if (typeof field.valueNumber === 'number') {
        return String(field.valueNumber);
    }

    if (field.content) {
        return field.content;
    }

    return null;
};

const mapExtractedInvoice = (result) => {
    const analysis = result.analyzeResult || {};
    const document = analysis.documents && analysis.documents.length ? analysis.documents[0] : null;
    const fields = document && document.fields ? document.fields : {};

    return {
        vendorName: getFieldContent(fields.VendorName),
        invoiceDate: getFieldContent(fields.InvoiceDate),
        invoiceId: getFieldContent(fields.InvoiceId),
        invoiceTotal: getFieldContent(fields.InvoiceTotal),
        totalTax: getFieldContent(fields.TotalTax),
        currencyCode: getFieldContent(fields.InvoiceTotal && fields.InvoiceTotal.valueCurrency ? fields.InvoiceTotal : fields.AmountDue),
        customerName: getFieldContent(fields.CustomerName),
        dueDate: getFieldContent(fields.DueDate)
    };
};

module.exports = {
    mapExtractedInvoice
};
