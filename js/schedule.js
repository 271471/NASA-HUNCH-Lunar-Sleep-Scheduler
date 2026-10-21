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
    let hours = Math.floor(mins / 60);
    mins %= 60
    let time = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    return time;
}
let x = timetomins("8:05");
console.log(x);
let y = minstotime(x);
console.log(y);