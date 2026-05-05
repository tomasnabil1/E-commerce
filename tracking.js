(function () {
  const API = "https://e-commerce-q15j.onrender.com";

  let sessionId = localStorage.getItem("_sid");
  if (!sessionId) {
    sessionId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now();
    localStorage.setItem("_sid", sessionId);
  }

  const page = document.title || location.pathname;

  fetch(API + "/api/visits", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, page })
  }).catch(() => {});
})();
