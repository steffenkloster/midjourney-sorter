let prompt =
  "Portrait of normal looking {white, brown, asian, black} {male, female} {Doctor, Teacher, Businessperson, Construction Worker, Engineer} smiling, crossed arms, smiling, isolated on white";
let regex = /{([^}]+)}/g;
let matches = [...prompt.matchAll(regex)]; // convert to array
let listCount = 1;
let listObject = {};

for (let match of matches) {
  let list = match[1].split(",").map((item) => item.trim()); // split by comma and trim whitespace
  listObject["list" + listCount] = list;
  prompt = prompt.replace(match[0], `{list${listCount}}`);
  listCount++;
}

function combinations2(keys) {
  return keys.reduce(
    (result, value, index, array) => [
      ...result,
      ...result.map((set) => [array[index], ...set]),
    ],
    [[]]
  );
}

function calculate(listObj) {
  let allKeys = Object.keys(listObj);
  let allComb = combinations2(allKeys);
  let closest = Infinity;
  let closestComb = null;

  allComb.forEach((combKeys) => {
    if (combKeys.length > 1) {
      let multiResult = combKeys.reduce((a, b) => a * listObj[b].length, 1);
      if (Math.abs(10 - multiResult) < Math.abs(10 - closest)) {
        closest = multiResult;
        closestComb = combKeys;
      }
    }
  });

  return { closest, closestComb };
}

let result = calculate(listObject);

console.log(prompt);
console.log(listObject);
console.log(result);

function cartesianProduct(arr) {
  return arr.reduce(
    function (a, b) {
      return a
        .map(function (x) {
          return b.map(function (y) {
            return x.concat([y]);
          });
        })
        .reduce(function (a, b) {
          return a.concat(b);
        }, []);
    },
    [[]]
  );
}

let otherKeys = Object.keys(listObject).filter(
  (key) => !result.closestComb.includes(key)
);

let otherLists = otherKeys.map((key) => listObject[key]);

let combinations = cartesianProduct(otherLists);

let allPrompts = combinations.map((comb) => {
  let newPrompt = prompt;
  comb.forEach((value, index) => {
    newPrompt = newPrompt.replace(`{${otherKeys[index]}}`, value);
  });
  return newPrompt;
});

console.log(allPrompts);

allPrompts.forEach((prompt) => {
  let newPrompt = prompt;
  result.closestComb.forEach((listKey) => {
    newPrompt = newPrompt.replace(
      `{${listKey}}`,
      `{${listObject[listKey].join(", ")}}`
    );
  });
  console.log(newPrompt);
});
