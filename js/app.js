document.addEventListener('DOMContentLoaded', () => {
  console.log("app.js running")

  function setBasicAuth(usernameLogin, passwordLogin) {
    const token = btoa(usernameLogin + ":" + passwordLogin);
    sessionStorage.setItem("AUTH", "Basic " + token);

  }

  function clearAuth() {
    sessionStorage.removeItem("AUTH");
  }

  function authHeader() {
    const authValue = sessionStorage.getItem("AUTH");
    return authValue ? {Authorization: authValue} : {};
  }


  async function apiFetch(url, options = {}) {
    const result = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...authHeader(),
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

  function fillFormLogin(user) {
    document.getElementById("usernameLogin").value = user?.usernameLogin ?? "";
    document.getElementById("passwordLogin").value = user?.passwordLogin ?? "";
  }

//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

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

    tbodyOrders.innerHTML = orders.map(order => `
  <tr data-id="${order.orderId}" data-inventory-id="${order.inventory?.inventoryId ??
    ''}">
  <td>${order.orderId ?? ""}</td>
  <td>${order.inventory?.inventoryId ?? ""}</td>
  <td>${order.inventory?.productName ?? ""}</td>
  <td>${order.inventory?.quantity ?? ""}</td>
  <td>${order.inventory?.available ? "Yes" : "No"}</td>
</tr>
`).join("");

  }

  const ORDER_API = "http://localhost:8082/api/order/getorders";
  const INVENTORY_API = "http://localhost:8081/api/inventory";

  document.getElementById("btnReloadOrders").addEventListener("click", async () => {
    try {
      const data = await apiFetch("http://localhost:8082/api/order/getorders", {method : "GET"});
      orders = (Array.isArray(data) ? data : []).map(o => ({
        orderId: o.orderId ?? o.id,
        inventory: {
          inventoryId: o.inventoryId ?? o.inventory?.inventoryId ?? null,
          productName: o.productName ?? o.inventory?.productName ?? null,
          quantity: (o.quantity ?? o.inventory?.quantity ?? 0),
          available: Boolean(o.available ?? o.inventory?.available),
        }
      }));
      renderOrders();
    } catch (error) {
      alert("Kunde inte hämta ordrar: " + error.message);
    }

  });


  document.getElementById("btnReserve").addEventListener("click", async () => {
    const inventoryId = document.getElementById("inventoryId").value;
    const quantity = document.getElementById("quantity").value;

    const urlCreateOrder = `http://localhost:8081/api/inventory/reserve?inventoryId=${inventoryId}&quantity=${quantity}`;

    try {
      await apiFetch(urlCreateOrder, {
        method: "POST"});
      alert("Order skapad och lager reserverat.");

    } catch (error) {
      alert("Kunde inte skapa order och reservera lager: " + error.message);
    }
  });

  document.getElementById("btnCreateInventory").addEventListener("click", async () => {
    const productName = document.getElementById("productName").value;
    const quantity = document.getElementById("inventoryQuantity").value;

    const urlCreatInventory = `http://localhost:8081/api/inventory/create?productName=${productName}&quantity=${quantity}`;
    try {
      await apiFetch(urlCreatInventory, {
        method: "POST"});
      alert("Lagerpost skapad.");
    } catch (error) {
      alert("Kunde inte skapa lagerpost: " + error.message);
    }
  });



//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

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

  document.getElementById("btnLogin").addEventListener("click", () => {
    const usernameLogin = document.getElementById("usernameLogin").value;
    const passwordLogin = document.getElementById("passwordLogin").value;
    setBasicAuth(usernameLogin, passwordLogin);
    alert("Inloggad i frontEnd");
  });

  document.getElementById("btnLogout").addEventListener("click", () => {
    clearAuth();
    fillFormLogin(null);
    document.getElementById("usernameLogin").focus();
    alert("Utloggad ur frontend");
  });

});
