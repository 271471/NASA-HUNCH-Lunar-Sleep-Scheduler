function timetomins(time) {
    if (typeof time !== 'string' || !/^([01]?\d|2[0-3]):[0-5]\d$/.test(time)) {
      throw new Error('Invalid time. Use HH:MM format.');
    }
    let temp = time.split(':');
    let hours = Number(temp[0]);
    let mins = Number(temp[1]);
    return hours * 60 + mins;
  }
  
  function minstotime(mins) {
    mins = ((mins % 1440) + 1440) % 1440;
    let hours = Math.floor(mins / 60);
    let remMins = mins % 60;
    return `${hours.toString().padStart(2, '0')}:${remMins.toString().padStart(2, '0')}`;
  }
  
  function genSS(currentBedtime, targetBedtime, sleepHours, shiftDirection, maxShift = 120) {
    let current = timetomins(currentBedtime);
    let target = timetomins(targetBedtime);
  
    if (typeof sleepHours !== 'number' || !Number.isFinite(sleepHours) || sleepHours <= 0 || sleepHours > 24) {
      throw new Error('Sleep duration must be between 0 and 24 hours.');
    }
    if (!Number.isInteger(maxShift) || maxShift < 1 || maxShift > 1440) {
      throw new Error('Maximum shift must be between 1 and 1440 minutes.');
    }
    if (shiftDirection !== 'later' && shiftDirection !== 'earlier') {
      throw new Error('Shift direction must be "later" or "earlier".');
    }
  
    let sleepDuration = sleepHours * 60;
    let schedule = [];
    let forward = (target - current + 1440) % 1440;
    let backward = (current - target + 1440) % 1440;
    let diff = shiftDirection === 'later' ? forward : backward;
    let days = Math.ceil(diff / maxShift);
    let remaining = diff;
  
    let baseDayOffset = Math.floor(current / 1440);
  
    schedule.push({
      day: 0,
      bedtime: minstotime(current),
      wakeTime: minstotime(current + sleepDuration),
      bedtimeDayOffset: Math.floor(current / 1440),
      wakeDayOffset: Math.floor((current + sleepDuration) / 1440),
      shiftMinutes: 0,
      bedtimeAbsolute: current,
      wakeAbsolute: current + sleepDuration
    });
  
    let accumMinutes = current;
  
    for (let day = 1; day <= days; day++) {
      let shiftAmount = Math.min(maxShift, remaining);
      if (shiftDirection === 'later') {
        accumMinutes += shiftAmount;
      } else {
        accumMinutes -= shiftAmount;
      }
      remaining -= shiftAmount;
  
      let bedtime = minstotime(accumMinutes);
      let wakeTime = minstotime(accumMinutes + sleepDuration);
      let bedtimeAbsolute = day * 1440 + accumMinutes;
      let wakeAbsolute = bedtimeAbsolute + sleepDuration;
  
      schedule.push({
        day: day,
        bedtime: bedtime,
        wakeTime: wakeTime,
        bedtimeAbsolute: bedtimeAbsolute,
        wakeAbsolute: wakeAbsolute,
        bedtimeDayOffset: Math.floor(bedtimeAbsolute / 1440),
        wakeDayOffset: Math.floor(wakeAbsolute / 1440),
        shiftMinutes: shiftAmount
      });
    }
  
    return schedule;
  }
  
  // TESTS
  function runTest(name, current, target, hours, direction, maxShift = 120) {
    console.log('\n' + name);
    try {
      console.table(genSS(current, target, hours, direction, maxShift));
    } catch (error) {
      console.log('ERROR:', error.message);
    }
  }
  
  runTest('TEST 1: Later Shift', '22:00', '04:00', 8, 'later');
  runTest('TEST 2: Earlier Shift', '04:00', '22:00', 8, 'earlier');
  runTest('TEST 3: Uneven Shift', '22:00', '03:00', 8, 'later');
  runTest('TEST 4: Identical Bedtimes', '22:00', '22:00', 8, 'later');
  runTest('TEST 5: Custom Maximum Shift', '22:00', '04:00', 8, 'later', 60);
  runTest('TEST 6: Invalid Time', '25:00', '04:00', 8, 'later');
  runTest('TEST 7: Invalid Sleep Duration', '22:00', '04:00', -2, 'later');