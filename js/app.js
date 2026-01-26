document.addEventListener('DOMContentLoaded', () => {
async function apiFetch(utl, options = {}) {
  const result = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!result.ok) {
    const txt =
      result.status !== 204 ? await result.text().catch(() => "") : "";
    const error = new Error(
      `${result.status} ${result.statusText}${txt ? ` || ${txt}` : ""}`
    );
    error.status = result.status;
    throw error;
  }

  if (result.status === 204) return null;

  const contentType = result.headers.get("Content-Type") || "";
  if (contentType.includes("application/json")) return result.json();
  return null;
  }

let orders = [];
const tbodyOrders = document.getElementById("tbodyOrders");
const emptyOrders = document.getElementById("emptyOrders");

function renderOrders() {
  if (!orders.length) {
    tbodyOrders.innerHTML = '';
    emptyOrders.hidden = false;
    return;
  }
  emptyOrders.hidden = true;

  tbodyOrders.innerHTML = orders
    .map(
      (order) => `
        <tr data-id="${order.id}">
        <td>${order.id}</td>
        <td>${order.productName ?? ""}</td>
</td>
</tr>`
    )
    .join("");

}

async function getOrders() {
  try {
    const data = await apiFetch("https://localhost:8082/api/orders", {method : "GET"});
    orders = Array.isArray(data) ? data : [];
    renderOrders();
  } catch (error) {
    alert("kunde inte hämta ordrar: " + error.message);
  }
}

document.getElementById("btnReloadOrders").addEventListener("click", getOrders);




//--------------------------------------------------------------------------------------------------------------------------------

  const views = document.querySelectorAll(".view");
  const navLinks = document.querySelectorAll("nav a");

  function showView(name) {
    views.forEach(v => v.hidden = true);

    const view = document.getElementById(`view-${name}`);
    if (view) view.hidden = false;
  }

  navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const viewName = link.dataset.view;
      showView(viewName);


      history.pushState(null, "", `#${viewName}`);
    });
  });


  function initFromHash() {
    const hash = location.hash.replace("#", "");
    showView(hash || "login");
  }

  window.addEventListener("popstate", initFromHash);
  initFromHash();


});







