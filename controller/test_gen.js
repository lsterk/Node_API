/*
controller class for generating test values
*/

function generateDate(maxSecondsRandom){
  // get current time
  var now = new Date();
  // add in a random offset
  var secsOffset = Math.floor(Math.random() * maxSecondsRandom);
  // JS date objects use time in ms
  return Date(now.getTime() - secsOffset * 1000)
}

function bonusBucks(){
  // between 0 and $60
  var cents = Math.random() * 6000;
  return (Math.floor(cents))/100
}

function generateMealPlan(){
  if (Math.round(Math.random())){
    var isWeekly = true;
    var mealsLeft = Math.round(Math.random() * 21);
    return {"count" : mealsLeft, "isWeekly" : isWeekly}
  }
  // else
  var isWeekly = false;
  var mealsLeft = Math.round(Math.random() * 60);
  return {"count" : mealsLeft, "isWeekly" : isWeekly}
}

module.exports.randomDate = generateDate;
module.exports.randomBonusBucks = bonusBucks;
module.exports.randomMealPlan = generateMealPlan;
