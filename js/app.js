
const generateButton = document.getElementById('generateButton');
const scheduleOutput = document.getElementById('scheduleOutput');
const currentBedtimeInput = document.getElementById('currentBedtime');

// daily sleep report button
const showSleepReportButton = document.getElementById('showSleepReportButton');
const sleepReport = document.getElementById('sleepReport');

// schedule export
const exportScheduleButton = document.getElementById('exportScheduleButton');

let currentSchedule = [];
let currentShiftDirection = '';


// ==========================================
// SCHEDULE GENERATION
// ==========================================

generateButton.addEventListener('click', generateSchedule); // schedule generate


function generateSchedule() {

    const currentBedtime = currentBedtimeInput.value;
    const targetBedtime = document.getElementById('targetBedtime').value;
    const sleepHours = Number(document.getElementById('sleepHours').value);
    const shiftDirection = document.getElementById('shiftDirection').value;

    try {
        if (!currentBedtime || !targetBedtime ||
            !document.getElementById('sleepHours').value) {
            throw new Error('Please complete all fields.');
        }

        const schedule = genSS(
            currentBedtime,
            targetBedtime,
            sleepHours,
            shiftDirection
        );

        displaySchedule(schedule, shiftDirection);

        currentSchedule = schedule;
        currentShiftDirection = shiftDirection;

        // Show the daily report and export buttons after generating a schedule
        showSleepReportButton.hidden = false;
        exportScheduleButton.hidden = false;

    } catch (error) {
        scheduleOutput.textContent = error.message;
        exportScheduleButton.hidden = true;
    }
}


function displaySchedule(schedule, shiftDirection) {

    scheduleOutput.replaceChildren();

    const table = document.createElement('table');

    const headers = [
        'Sleep Period',
        'Bedtime',
        'Wake Time',
        'Bedtime Day',
        'Wake Day',
        'Shift'
    ];

    const headerRow = document.createElement('tr');

    headers.forEach(function(header) {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });

    table.appendChild(headerRow);

    schedule.forEach(function(period) {

        const row = document.createElement('tr');

        const values = [
            period.day,
            period.bedtime,
            period.wakeTime,
            `Day +${period.bedtimeDayOffset}`,
            `Day +${period.wakeDayOffset}`,
            period.day === 0
                ? 'Starting schedule'
                : `${period.shiftMinutes} min ${shiftDirection}`
        ];

        values.forEach(function(value) {
            const cell = document.createElement('td');
            cell.textContent = value;
            row.appendChild(cell);
        });

        table.appendChild(row);
    });

    scheduleOutput.appendChild(table);
}


// ==========================================
// DAILY SLEEP REPORT VISIBILITY
// ==========================================

// Open daily sleep report when button is clicked
showSleepReportButton.addEventListener('click', function() {
    sleepReport.hidden = false;
});


// ==========================================
// DAILY SLEEP REPORT
// ==========================================

const sleepDate = document.getElementById('sleepDate');
const actualBedtime = document.getElementById('actualBedtime');
const actualWakeTime = document.getElementById('actualWakeTime');
const sleepQuality = document.getElementById('sleepQuality');

const saveSleepReportButton =
    document.getElementById('saveSleepReportButton');

const sleepReportStatus =
    document.getElementById('sleepReportStatus');


function getLocalDate() { //this will change later, but I would need to make a separate mission clock and I could not for the life of me figure it out.

    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

sleepDate.value = getLocalDate();


// Use the most recent sleep report as the next starting bedtime
function loadLatestSleepReport() {

    const logs = getSleepLogs();

    if (logs.length === 0) {
        return;
    }

    logs.sort(function(a, b) {
        return b.date.localeCompare(a.date);
    });

    if (logs[0].bedtime) {
        currentBedtimeInput.value = logs[0].bedtime;
    }
}

loadLatestSleepReport();


function validateTime(time) { //validates 24 hour format

    return /^([01]?\d|2[0-3]):[0-5]\d$/.test(time); //do not remember this look up regex (regular expression).
}


// Save nightly sleep report
saveSleepReportButton.addEventListener('click', function() { // trys report

    try {

        const date = sleepDate.value;
        const bedtime = actualBedtime.value.trim();
        const wakeTime = actualWakeTime.value.trim();
        const quality = sleepQuality.value;

        if (!date || !bedtime || !wakeTime || !quality) {
            throw new Error('Please complete all required fields.');
        }

        if (!validateTime(bedtime) || !validateTime(wakeTime)) {
            throw new Error('Enter valid times using HH:MM format.');
        }

        if (bedtime === wakeTime) {
            throw new Error('Bedtime and wake time cannot be identical.');
        }

        if (!['poor', 'okay', 'great'].includes(quality)) {
            throw new Error('Please select a valid sleep quality.');
        }

        const duration = calculateSleepDuration(bedtime, wakeTime);

        if (duration <= 0 || duration >= 24) {
            throw new Error('Invalid sleep duration.');
        }

        const report = {
            date: date,
            bedtime: bedtime,
            wakeTime: wakeTime,
            duration: duration,
            quality: quality,
            loggedAt: new Date().toISOString()
        };

        saveSleepLog(report);

        // Update the starting bedtime using the actual report
        currentBedtimeInput.value = bedtime;

        // Regenerate the schedule using the updated bedtime
        generateSchedule();

        // Display confirmation
        sleepReportStatus.textContent =
            `Report saved. Actual sleep: ${duration.toFixed(2)} hours. Schedule updated using your reported bedtime.`;

        // Clear report fields for the next entry
        actualBedtime.value = '';
        actualWakeTime.value = '';
        sleepQuality.value = '';

    } catch (error) {

        sleepReportStatus.textContent = error.message;

    }

});


// ==========================================
// 12-HOUR TO 24-HOUR CONVERTER
// ==========================================

const convertTimeButton = document.getElementById('convertTimeButton');
const time24Output = document.getElementById('time24Output');

convertTimeButton.addEventListener('click', function() {

    const hour = Number(document.getElementById('timeHour').value);
    const minute = Number(document.getElementById('timeMinute').value);
    const period = document.getElementById('timePeriod').value;

    if (
        !Number.isInteger(hour) || hour < 1 || hour > 12 ||
        !Number.isInteger(minute) || minute < 0 || minute > 59
    ) {
        time24Output.textContent = 'Enter a valid hour and minute.';
        return;
    }

    let hour24 = hour;

    if (period === 'AM') {
        hour24 = hour % 12;
    } else {
        hour24 = (hour % 12) + 12;
    }

    const convertedTime =
        `${String(hour24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

    time24Output.textContent = `24-hour time: ${convertedTime}`;

});


// ==========================================
// SCHEDULE TXT EXPORT
// ==========================================

exportScheduleButton.addEventListener('click', function() {

    if (currentSchedule.length === 0) {
        return;
    }

    let text = 'GENESIS - LUNAR SLEEP SCHEDULE\n';
    text += '================================\n\n';

    text += `Generated: ${getLocalDate()}\n`;
    text += `Shift Direction: ${currentShiftDirection}\n\n`;

    currentSchedule.forEach(function(period) {

        text += `Sleep Period ${period.day}\n`;
        text += `Bedtime: ${period.bedtime}\n`;
        text += `Wake Time: ${period.wakeTime}\n`;
        text += `Bedtime Day: Day +${period.bedtimeDayOffset}\n`;
        text += `Wake Day: Day +${period.wakeDayOffset}\n`;

        if (period.day === 0) {
            text += 'Shift: Starting schedule\n';
        } else {
            text += `Shift: ${period.shiftMinutes} minutes ${currentShiftDirection}\n`;
        }

        text += '\n';
    });

    const file = new Blob([text], {
        type: 'text/plain;charset=utf-8'
    });

    const fileURL = URL.createObjectURL(file);

    const downloadLink = document.createElement('a');

    downloadLink.href = fileURL;
    downloadLink.download = `Genesis_Sleep_Schedule_${getLocalDate()}.txt`;

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    URL.revokeObjectURL(fileURL);

});
