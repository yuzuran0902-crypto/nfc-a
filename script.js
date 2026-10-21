(() => {
  const pageKey = document.body.dataset.page;
  const config = window.SITE_CONFIG.pages[pageKey];

  if (!config) {
    document.body.innerHTML = '<main class="page-shell"><p>記録が見つかりません。</p></main>';
    return;
  }

  document.body.innerHTML = `
    <main class="page-shell">
      <p class="nfc-label" aria-label="NFC番号"><span>NFC</span><strong id="nfc-number"></strong></p>
      <section class="lock-screen" id="lock-screen" aria-labelledby="lock-title">
        <div class="lock-mark" aria-hidden="true"><span></span></div>
        <p class="eyebrow">CONFIDENTIAL RECORD</p>
        <h1 id="lock-title">証言記録へのアクセス</h1>
        <p class="lock-copy">あいことばを入力してください。</p>
        <form id="password-form" novalidate>
          <label for="password">合言葉</label>
          <div class="input-row">
            <input id="password" name="password" type="text" inputmode="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="あいことばを入力" maxlength="32" required />
            <button type="submit">照合</button>
          </div>
          <p class="form-message" id="form-message" aria-live="polite"></p>
        </form>
      </section>
      <article class="testimony" id="testimony" tabindex="-1" hidden>
        <header class="profile">
          <div class="portrait">
            <img id="witness-image" src="" alt="" width="640" height="800" hidden />
            <div class="portrait-fallback" id="portrait-fallback" aria-hidden="true"><span></span></div>
          </div>
          <div class="identity">
            <p class="eyebrow">WITNESS STATEMENT</p>
            <h1 id="witness-name"></h1>
            <p class="record-state"><span></span> 証言記録・再生中</p>
          </div>
        </header>
        <section class="statement" aria-labelledby="statement-title">
          <div class="statement-heading"><p id="statement-title">証言</p><span aria-hidden="true">REC</span></div>
          <blockquote id="statement-text"></blockquote>
        </section>
        <footer><span>END OF RECORD</span><button id="lock-again" type="button">証言を閉じる</button></footer>
      </article>
    </main>`;

  const lockScreen = document.querySelector("#lock-screen");
  const testimony = document.querySelector("#testimony");
  const form = document.querySelector("#password-form");
  const input = document.querySelector("#password");
  const message = document.querySelector("#form-message");
  const lockAgain = document.querySelector("#lock-again");
  const witnessImage = document.querySelector("#witness-image");
  const portraitFallback = document.querySelector("#portrait-fallback");
  const statementTitle = document.querySelector("#statement-title");
  const statementText = document.querySelector("#statement-text");
  const storageKey = `witness-record-open:${pageKey}`;

  const normalize = (value) => value.normalize("NFKC").replace(/[\s　]+/g, "").toUpperCase();

  document.querySelector("#nfc-number").textContent = config.nfcNumber;
  document.querySelector("#witness-name").textContent = config.witnessName;
  document.title = `${config.witnessName}｜証言記録`;

  if (config.image) {
    witnessImage.src = config.image;
    witnessImage.alt = config.imageAlt;
    witnessImage.hidden = false;
    portraitFallback.hidden = true;
  }

  const openRecord = (recordType = "primary") => {
    const showFollowup = recordType === "followup" && config.followupTestimony;
    statementTitle.textContent = showFollowup ? "再調査の証言" : "証言";
    statementText.textContent = showFollowup ? config.followupTestimony : config.testimony;
    sessionStorage.setItem(storageKey, showFollowup ? "followup" : "primary");
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
    const followupExpected = config.followupPassword ? normalize(config.followupPassword) : "";

    if (!entered) {
      message.textContent = "合言葉を入力してください。";
      input.focus();
      return;
    }
    if (entered === expected) {
      message.textContent = "照合しました。";
      window.setTimeout(() => openRecord("primary"), 220);
      return;
    }
    if (followupExpected && entered === followupExpected) {
      message.textContent = "再調査記録を照合しました。";
      window.setTimeout(() => openRecord("followup"), 220);
      return;
    }

    message.textContent = "合言葉が違います。";
    form.classList.remove("is-error");
    void form.offsetWidth;
    form.classList.add("is-error");
    input.select();
  });

  lockAgain.addEventListener("click", closeRecord);

  const savedRecord = sessionStorage.getItem(storageKey);
  if (savedRecord === "primary" || savedRecord === "followup") {
    openRecord(savedRecord);
  } else {
    window.setTimeout(() => input.focus(), 350);
  }
})();
