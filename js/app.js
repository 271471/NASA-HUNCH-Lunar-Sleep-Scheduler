const generateButton = document.getElementById('generateButton');
const scheduleOutput = document.getElementById('scheduleOutput');

generateButton.addEventListener('click', function() {

    const currentBedtime = document.getElementById('currentBedtime').value;
    const targetBedtime = document.getElementById('targetBedtime').value;
    const sleepHours = Number(document.getElementById('sleepHours').value);
    const shiftDirection = document.getElementById('shiftDirection').value;

    try {
        if (!currentBedtime || !targetBedtime || !document.getElementById('sleepHours').value) {
            throw new Error('Please complete all fields.');
        }

        const schedule = genSS(
            currentBedtime,
            targetBedtime,
            sleepHours,
            shiftDirection
        );

        displaySchedule(schedule, shiftDirection);

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
}