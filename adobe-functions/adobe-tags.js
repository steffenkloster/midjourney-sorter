function until(conditionFunction) {
  const poll = (resolve) => {
    if (conditionFunction()) resolve();
    else setTimeout((_) => poll(resolve), 100);
  };

  return new Promise(poll);
}

const pictures = Array.from([
  ...document.querySelectorAll('.upload-tile__wrapper'),
]).map((elm) => elm.parentElement);

for (const picture of pictures) {
  picture.click();

  await until(() => {
    return picture.getAttribute('aria-selected') == 'true';
  });

  const addAll = document.querySelector(
    'button[data-t=content-keywords-add-all-suggestions] > span'
  );
  if (addAll !== null) {
    if (addAll.classList.contains('blue')) {
      addAll.click();

      await until(() => {
        return !addAll.classList.contains('blue');
      });
    }
  }
}
