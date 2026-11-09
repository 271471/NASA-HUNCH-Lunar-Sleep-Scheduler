
const generateButton = document.getElementById('generateButton');
const scheduleOutput = document.getElementById('scheduleOutput');

// daily sleep report button
const showSleepReportButton = document.getElementById('showSleepReportButton');
const sleepReport = document.getElementById('sleepReport');

generateButton.addEventListener('click', function() { // schedule generate

    const currentBedtime = document.getElementById('currentBedtime').value;
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

        // Show the daily report button after generating a schedule
        showSleepReportButton.hidden = false;

    } catch (error) {
        scheduleOutput.textContent = error.message;
    }
});


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
});


// Open daily sleep report when button is clicked
showSleepReportButton.addEventListener('click', function() {
    sleepReport.hidden = false;
});


// daily sleep
const sleepDate = document.getElementById('sleepDate');
const actualBedtime = document.getElementById('actualBedtime');
const actualWakeTime = document.getElementById('actualWakeTime');
const sleepQuality = document.getElementById('sleepQuality');
const sleepNotes = document.getElementById('sleepNotes');

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


function validateTime(time) { //validates 24 hour format

    return /^([01]?\d|2[0-3]):[0-5]\d$/.test(time); //do not remember this look up regex (regular expression).
}


saveSleepReportButton.addEventListener('click', function() { // trys report

    try {

        const date = sleepDate.value;
        const bedtime = actualBedtime.value.trim();
        const wakeTime = actualWakeTime.value.trim();
        const quality = sleepQuality.value;
        const notes = sleepNotes.value.trim();

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
            notes: notes,
            loggedAt: new Date().toISOString()
        };

        saveSleepLog(report);

        // Display confirmation
        sleepReportStatus.textContent =
            `Sleep report saved successfully. Actual sleep: ${duration.toFixed(2)} hours.`;

        // Clear report fields for the next entry
        actualBedtime.value = '';
        actualWakeTime.value = '';
        sleepQuality.value = '';
        sleepNotes.value = '';

    } catch (error) {

        sleepReportStatus.textContent = error.message;

    }

});
