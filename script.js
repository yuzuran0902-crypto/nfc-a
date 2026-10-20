(() => {
  const config = window.SITE_CONFIG;
  const lockScreen = document.querySelector("#lock-screen");
  const testimony = document.querySelector("#testimony");
  const form = document.querySelector("#password-form");
  const input = document.querySelector("#password");
  const message = document.querySelector("#form-message");
  const lockAgain = document.querySelector("#lock-again");
  const storageKey = `witness-record-open:${window.location.pathname}`;

  const normalize = (value) =>
    value.normalize("NFKC").replace(/[\s　]+/g, "").toUpperCase();

  document.querySelector("#nfc-number").textContent = config.nfcNumber;
  document.querySelector("#witness-name").textContent = config.witnessName;
  document.querySelector("#statement-text").textContent = config.testimony;
  document.title = `${config.witnessName}｜証言記録`;

  const openRecord = () => {
    sessionStorage.setItem(storageKey, "true");
    lockScreen.hidden = true;
    testimony.hidden = false;
    requestAnimationFrame(() => testimony.classList.add("is-visible"));
    document.body.classList.add("record-open");
    testimony.focus({ preventScroll: true });
  };

  const closeRecord = () => {
    sessionStorage.removeItem(storageKey);
    testimony.classList.remove("is-visible");
    testimony.hidden = true;
    lockScreen.hidden = false;
    document.body.classList.remove("record-open");
    input.value = "";
    message.textContent = "";
    input.focus();
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const entered = normalize(input.value);
    const expected = normalize(config.password);

    if (!entered) {
      message.textContent = "合言葉を入力してください。";
      input.focus();
      return;
    }

    if (!/^[ァ-ヶー]+$/.test(entered)) {
      message.textContent = "カタカナだけで入力してください。";
      input.select();
      return;
    }

    if (entered === expected) {
      message.textContent = "照合しました。";
      window.setTimeout(openRecord, 220);
      return;
    }

    message.textContent = "合言葉が違います。";
    form.classList.remove("is-error");
    void form.offsetWidth;
    form.classList.add("is-error");
    input.select();
  });

  lockAgain.addEventListener("click", closeRecord);

  if (sessionStorage.getItem(storageKey) === "true") {
    openRecord();
  } else {
    window.setTimeout(() => input.focus(), 350);
  }
})();
