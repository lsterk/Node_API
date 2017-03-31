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

function generateBonusBucks(){
  // between 0 and $60
  var cents = Math.random() * 6000;
  return (Math.floor(cents))/100
}

function generateMealPlan(){
  if (Math.round(Math.random())){
    var isWeekly = true;
    var maxMeals = [10, 15, 21][Math.round(Math.random() * 2)]
    var mealsLeft = Math.round(Math.random() * maxMeals);
    return {"count" : mealsLeft, "isWeekly" : isWeekly, "maxMeals" : maxMeals}
  }
  // else
  var isWeekly = false;
  var maxMeals = [10, 15, 21][Math.round(Math.random() * 2)]
  var mealsLeft = Math.round(Math.random() * maxMeals);
  return {"count" : mealsLeft, "maxMeals": maxMeals, "isWeekly" : isWeekly}
}

module.exports.randomDate = generateDate;
module.exports.randomBonusBucks = generateBonusBucks;
module.exports.randomMealPlan = generateMealPlan;
