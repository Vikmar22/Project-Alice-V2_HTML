document.addEventListener('DOMContentLoaded', () => {
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

function fillFormOrder(order) {
  document.getElementById("orderId").value = order?.id ?? "";
  document.getElementId

}



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
