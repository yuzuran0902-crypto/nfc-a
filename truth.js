(() => {
  const button = document.querySelector("#save-photo");
  const help = document.querySelector("#save-help");
  const imageUrl = new URL("truth.png", document.baseURI.replace(/v\/$/, ""));

  const openImageForSaving = () => {
    window.open(imageUrl.href, "_blank", "noopener,noreferrer");
    help.textContent = "開いた画像を長押しして「写真に保存」または「画像を保存」を選んでください。";
  };

  button.addEventListener("click", async () => {
    button.disabled = true;

    try {
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error("image-fetch-failed");

      const blob = await response.blob();
      const file = new File([blob], "真相クリア画像.png", { type: "image/png" });
      const shareData = { files: [file], title: "真相クリア画像" };

      if (navigator.share && navigator.canShare?.(shareData)) {
        help.textContent = "共有メニューから「画像を保存」を選んでください。";
        await navigator.share(shareData);
      } else {
        openImageForSaving();
      }
    } catch (error) {
      if (error?.name !== "AbortError") openImageForSaving();
    } finally {
      button.disabled = false;
    }
  });
})();
