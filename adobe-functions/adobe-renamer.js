function until(conditionFunction) {
  const poll = (resolve) => {
    if (conditionFunction()) resolve();
    else setTimeout((_) => poll(resolve), 400);
  };

  return new Promise(poll);
}

async function updateImageNames() {
  const pictures = document.querySelectorAll(".content-thumbnail > img");
  for (const picture of pictures) {
    picture.click();
    await until(
      (_) => document.querySelectorAll(".menu.menu--closable").length == 2
    );
    const menu = document.querySelectorAll(".menu.menu--closable")[1];
    const nameElement = menu.querySelector(
      ".container-table-cell.padding-left-xlarge.padding-bottom-medium > div > div > div > div"
    );

    const name = nameElement.innerText;
    if (name.includes(", by Generative AI")) {
      console.log(`Renaming ${name}`);
      nameElement.parentElement.querySelector(".icon-edit").click();
      await until((_) => document.querySelector("input.input--full") !== null);
      const nameInputField = document.querySelector("input.input--full");
      nameInputField.value = name.replace(", by Generative AI", "");
      nameInputField.dispatchEvent(new Event("focus"));
    }

    return;
  }
}

monitorEvents(window);
unmonitorEvents(window, "mouse");
unmonitorEvents(window, "pointer");
unmonitorEvents(window, "scroll");
