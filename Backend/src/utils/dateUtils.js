const toYearMonthKey = (value) => {
    const date = new Date(value);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
};

const getMonthYear = (value = new Date()) => {
    const date = new Date(value);
    return {
        month: date.getMonth() + 1,
        year: date.getFullYear()
    };
};

module.exports = {
    toYearMonthKey,
    getMonthYear
};
