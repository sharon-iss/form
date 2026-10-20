(function () {
  const form = document.getElementById("enquiry-form");
  const statusEl = document.getElementById("form-status");
  const submitBtn = document.getElementById("submit-btn");
  const submitLabel = submitBtn.querySelector(".submit-label");
  const captchaContainer = document.getElementById("recaptcha-container");

  const config = window.GRACE_CONFIG || {};
  const scriptURL = config.scriptURL || "";
  const siteKey = config.recaptchaSiteKey || "";
  const captchaEnabled = config.enableCaptcha === true;

  const isScriptConfigured =
    scriptURL && !scriptURL.includes("YOUR_GOOGLE_APPS_SCRIPT");
  const isCaptchaConfigured =
    captchaEnabled && siteKey && !siteKey.includes("YOUR_RECAPTCHA_SITE_KEY");

  let captchaWidgetId = null;

  window.onRecaptchaLoad = function () {
    if (!isCaptchaConfigured || !captchaContainer) return;
    captchaWidgetId = grecaptcha.render(captchaContainer, {
      sitekey: siteKey,
      theme: "light",
    });
  };

  if (isCaptchaConfigured) {
    const captchaField = document.getElementById("captcha-field");
    if (captchaField) captchaField.hidden = false;
    const api = document.createElement("script");
    api.src =
      "https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad&render=explicit";
    api.async = true;
    api.defer = true;
    document.body.appendChild(api);
  }

  function setStatus(message, type) {
    statusEl.textContent = message;
    statusEl.className = "status" + (type ? " " + type : "");
  }

  function resetButton() {
    submitBtn.disabled = false;
    submitLabel.textContent = "Send enquiry";
  }

  function getCaptchaToken() {
    if (!isCaptchaConfigured || typeof grecaptcha === "undefined") return "";
    if (captchaWidgetId === null) return "";
    return grecaptcha.getResponse(captchaWidgetId) || "";
  }

  function resetCaptcha() {
    if (
      isCaptchaConfigured &&
      typeof grecaptcha !== "undefined" &&
      captchaWidgetId !== null
    ) {
      grecaptcha.reset(captchaWidgetId);
    }
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    setStatus("");

    if (!isScriptConfigured) {
      setStatus(
        "Add your Google Apps Script Web App URL in config.js before sending.",
        "error"
      );
      return;
    }

    if (!form.checkValidity()) {
      setStatus("Please complete the required fields.", "error");
      form.reportValidity();
      return;
    }

    const payload = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone.value.trim(),
      message: form.message.value.trim(),
      honey: form.honey.value,
    };

    if (isCaptchaConfigured) {
      const captchaToken = getCaptchaToken();
      if (!captchaToken) {
        setStatus("Please complete the captcha.", "error");
        return;
      }
      payload.captchaToken = captchaToken;
    }

    submitBtn.disabled = true;
    submitLabel.textContent = "Sending…";

    try {
      const response = await fetch(scriptURL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
        redirect: "follow",
      });

      const result = await response.json().catch(function () {
        return { ok: false };
      });

      if (!result.ok) {
        throw new Error(result.error || "Send failed");
      }

      window.location.href = "thanks.html";
    } catch (err) {
      setStatus(
        "Could not send your enquiry. Please try again in a moment.",
        "error"
      );
      resetCaptcha();
      resetButton();
    }
  });
})();
