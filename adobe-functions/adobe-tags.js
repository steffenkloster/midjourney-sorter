function until(conditionFunction) {
  const poll = (resolve) => {
    if (conditionFunction()) resolve();
    else setTimeout((_) => poll(resolve), 100);
  };

  return new Promise(poll);
}

function capitalizeFirstLetter(inputString) {
  // Check if the input string is not empty
  if (inputString.length === 0) {
    return inputString;
  }

  // Capitalize the first letter and concatenate it with the rest of the string
  return inputString.charAt(0).toUpperCase() + inputString.slice(1);
}

function getTextBetweenStrings(inputString, startString, endString) {
  const regex = new RegExp(`${startString}(.*?)${endString}`);
  const match = inputString.match(regex);

  if (!match) {
    return ""; // Strings not found
  }

  return match[1];
}

const pictures = Array.from([
  ...document.querySelectorAll(".upload-tile__wrapper"),
]).map((elm) => elm.parentElement);

for (const picture of pictures) {
  picture.click();

  await until(() => {
    return picture.getAttribute("aria-selected") == "true";
  });

  const addAll = document.querySelector(
    "button[data-t=content-keywords-add-all-suggestions] > span"
  );
  if (addAll !== null) {
    if (addAll.classList.contains("blue")) {
      addAll.click();

      await until(() => {
        return !addAll.classList.contains("blue");
      });
    }
  }

  //const fileName = document.querySelector('.content-side-panel-wrapper--uploads__content-tagger div[data-t=asset-sidebar-footer] .text-sregular span:last-child').innerText;
  //const stockName = capitalizeFirstLetter(getTextBetweenStrings(fileName, 'steffenak_', '_ba').replace(/_/g, ' ')) + " background";
}
