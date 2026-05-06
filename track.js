(function () {
  const API = "https://e-commerce-qi5j.onrender.com";

  // Use sessionStorage so each browser session counts as a new visit
  // but reloading the same page in the same tab doesn't double-count
  let sessionId = sessionStorage.getItem("_sid");
  if (!sessionId) {
    sessionId = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem("_sid", sessionId);
  }

  const page = location.pathname.split("/").pop() || "index.html";

  fetch(API + "/api/visits", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, page })
  }).catch(() => {});
})();
