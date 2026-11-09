
const STORAGE_KEY = "genesis_sleep_logs";

function getSleepLogs() {
    const logs = localStorage.getItem(STORAGE_KEY);

    return logs ? JSON.parse(logs) : [];
}

function saveSleepLog(report) {
    const logs = getSleepLogs();

    const existingIndex = logs.findIndex(
        log => log.date === report.date
    );

    if (existingIndex !== -1) {
        logs[existingIndex] = report;
    } else {
        logs.push(report);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
}


function getSleepLog(date) { // gets report
    return getSleepLogs().find(log => log.date === date) || null;
}

function deleteSleepLog(date) { // delete report
    const logs = getSleepLogs().filter(
        log => log.date !== date
    );

    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
}

function calculateSleepDuration(bedtime, wakeTime) { // calc
    const [bedHour, bedMinute] = bedtime.split(":").map(Number);
    const [wakeHour, wakeMinute] = wakeTime.split(":").map(Number);

    let bedtimeMinutes = bedHour * 60 + bedMinute;
    let wakeMinutes = wakeHour * 60 + wakeMinute;

    if (wakeMinutes <= bedtimeMinutes) {
        wakeMinutes += 1440;
    }

    return (wakeMinutes - bedtimeMinutes) / 60;
}
