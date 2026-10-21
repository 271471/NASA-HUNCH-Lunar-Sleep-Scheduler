function timetomins(time){
    let mins = 0;
    let hours = 0;
    let temp = time.split(":");
    hours = temp[0];
    mins = temp[1];
    mins = Number(mins);
    hours = Number(hours);
    hours *= 60;
    mins = hours + mins;
    return mins;

}
function minstotime(mins){
    mins = ((mins % 1440) + 1440) % 1440;
    let hours = Math.floor(mins / 60);
    mins %= 60
    let time = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    return time;
}
function genSS(currentBedtime, targetBedtime, sleepHours, shiftDirection){
    let current = timetomins(currentBedtime);
    let target = timetomins(targetBedtime);
    let sleepDuration = sleepHours * 60;
    let schedule = [];
    let forward = (target - current + 1440) % 1440; // if we need to move the sleep time forward
    let backward = (current - target + 1440) % 1440;// if we need to move the sleep time backward

    let diff = 0;
    if (shiftDirection === "later"){
        diff = forward;
    }
    else if (shiftDirection === "earlier"){
        diff = backward;
    }
    else {
        return "The shift direction provided is invalid, please ensure that you have either inputed 'later' or 'earlier'."
    }

    let maxShift = 120; //
}
let x = timetomins("8:05");
console.log(x);
let y = minstotime(x);
console.log(y);