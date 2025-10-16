
function daysDiff(startDate, endDate) {
    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    const diffInMs = endDate - startDate;
    return Math.round(diffInMs / millisecondsPerDay);
}

module.exports = daysDiff;