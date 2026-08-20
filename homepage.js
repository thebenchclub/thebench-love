(function () {
  const form = document.querySelector("#bench-chat");
  const promptField = document.querySelector("#bench-prompt");
  const output = document.querySelector("#chat-output");
  const chips = document.querySelectorAll("[data-prompt]");
  const newsletter = document.querySelector("#bench-newsletter");
  const newsletterNote = document.querySelector("#newsletter-note");

  if (newsletter && newsletterNote) {
    newsletter.addEventListener("submit", function (event) {
      event.preventDefault();
      const email = newsletter.querySelector('input[type="email"]');
      const value = email && typeof email.value === "string" ? email.value.trim() : "";
      if (!value) return;

      const subject = encodeURIComponent("Newsletter signup request");
      const body = encodeURIComponent("Please add this email to The Bench newsletter list:\n\n" + value + "\n");
      window.location.href = "mailto:christy@thebenchclub.ai?subject=" + subject + "&body=" + body;
      newsletterNote.textContent = "Opening your email app with the signup request pre-filled.";
    });
  }

  if (!form || !promptField || !output) return;

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, function (character) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character];
    });
  }

  function showOutput(message, isError) {
    output.classList.add("is-visible");
    output.innerHTML = "<p>" + escapeHtml(message) + "</p>" + (isError ? "" : '<a href="/contact/">Talk through your next move <span aria-hidden="true">↗</span></a>');
  }

  async function askBench(prompt) {
    const cleanPrompt = prompt.trim();
    if (!cleanPrompt) {
      showOutput("Start with the pressure point, even if it is messy. What are you trying to make easier?", true);
      return;
    }

    showOutput("Coach is thinking about the outcome underneath that...", true);
    try {
      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: cleanPrompt.slice(0, 500) })
      });
      const data = await response.json();
      if (!response.ok || !data.recommendation) throw new Error("Recommendation unavailable");
      showOutput(data.recommendation, false);
    } catch (error) {
      showOutput("The first move is to name the outcome: carry less, move faster, or build a better system. The Bench can help you turn that into a practical next step.", false);
    }
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    askBench(promptField.value);
  });

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      promptField.value = chip.dataset.prompt || "";
      promptField.focus();
      askBench(promptField.value);
    });
  });
}());
