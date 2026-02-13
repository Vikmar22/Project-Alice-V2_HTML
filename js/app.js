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

// --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// INVENTORY MANAGEMENT
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

  let inventory = [];
  const tbodyInventory = document.getElementById("tbodyInventory");
  const emptyInventory = document.getElementById("emptyInventory");

  function renderInventory() {
    if (!inventory.length) {
      tbodyInventory.innerHTML = '';
      emptyInventory.hidden = false;
      return;
    }
    emptyInventory.hidden = true;

    tbodyInventory.innerHTML = inventory.map(item => `
  <tr data-id="${item.inventoryId}">
  <td>${item.inventoryId ?? ""}</td>
  <td>${item.quantity ?? ""}</td>
  <td>${item.available ? "Yes" : "No"}</td>
  </tr>
`).join("");

  }


  document.getElementById("btnReloadInventory").addEventListener("click", async () => {
    try {
      const data = await apiFetch("http://localhost:8081/api/inventory/getInventory", {method : "GET"});
      inventory = Array.isArray(data) ? data : [];
      renderInventory();
    } catch (error) {
      alert("Kunde inte hämta lager: " + error.message);
    }
  });

// --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// USER MANAGEMENT
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


  let users = [];
  const tbodyUsers = document.getElementById("tbodyUsers");
  const emptyUsers = document.getElementById("emptyUsers");

  function renderUsers() {
    if (!users.length) {
      tbodyUsers.innerHTML = '';
      emptyUsers.hidden = false;
      return;
    }
    emptyUsers.hidden = true;

    tbodyUsers.innerHTML = users.map(user => `
  <tr data-id="${user.userId}">
  <td>${users.userId ?? ""}</td>
  <td>${users.username ?? ""}</td>
  <td>${users.password ?? ""}</td>
  <td>${users.firstName ?? ""}</td>
  <td>${users.lastName ?? ""}</td>
</tr>
`).join("");

  }

  function fillFormUser(user) {
    document.getElementById("userId").value = user?.userId ?? "";
    document.getElementById("username").value = user?.username ?? "";
    document.getElementById("password").value = user?.password ?? "";
    document.getElementById("firstName").value = user?.firstName ?? "";
    document.getElementById("lastName").value = user?.lastName ?? "";
  }

  function getPayloadFromFormUser() {
    return {
      username: document.getElementById("username").value,
      password: document.getElementById("password").value,
      firstName: document.getElementById("firstName").value,
      lastName: document.getElementById("lastName").value
    };
  }

  function getIdFromFormUser() {
    const idStrUser = document.getElementById("userId").value.trim();
    return idStrUser ? Number(idStrUser) : null;
  }

  async function getUsers() {
    try {
      const data = await apiFetch("http://localhost:8080/api/users/getUsers", {method: "GET"});
      users = Array.isArray(data) ? data : [];
      renderUsers();
    } catch (error) {
      alert("Kunde inte hämta användare: " + error.message);
    }
  }

  async function createUser(payloadUser) {
    try {
      await apiFetch("http://localhost:8080/api/user/createUser", {method: "POST", body: JSON.stringify(payloadUser)
      });
      fillFormUser(null);
    } catch (error) {
      if (error.status === 401) alert("401 Unauthorized || Logga in först.");
      else if (error.status === 403) alert("403 Forbidden || Du saknar rätt roll.");
      else alert("Fel vid skapande av användare: " + error.message);
    }
  }

  document.getElementById("userForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const payloadUser = getPayloadFromFormUser();
    await createUser(payloadUser);

  })

  document.getElementById("btnReloadUsers").addEventListener("click", getUsers);






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

