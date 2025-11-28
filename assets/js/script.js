// === script.js ===
// Single JS file handling users, auth, products CRUD, cart, UI rendering, snackbars, validation

// ---------- Utilities ----------
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

function showSnackbar(msg) {
  const el = document.getElementById("snackbar");
  if (!el) return alert(msg);
  el.textContent = msg;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 3200);
}

function generateId(prefix = "id") {
  return prefix + "_" + Date.now() + "_" + Math.floor(Math.random() * 900 + 100);
}

// ---------- LocalStorage helpers ----------
const LS = {
  usersKey: "os_users_v1",
  productsKey: "os_products_v1",
  cartKey: "os_cart_v1",
  loggedKey: "loggedInUser",

  getUsers() {
    return JSON.parse(localStorage.getItem(this.usersKey) || "[]");
  },
  setUsers(u) {
    localStorage.setItem(this.usersKey, JSON.stringify(u));
  },

  getProducts() {
    return JSON.parse(localStorage.getItem(this.productsKey) || "[]");
  },
  setProducts(p) {
    localStorage.setItem(this.productsKey, JSON.stringify(p));
  },

  getCart() {
    return JSON.parse(localStorage.getItem(this.cartKey) || "[]");
  },
  setCart(c) {
    localStorage.setItem(this.cartKey, JSON.stringify(c));
  },

  getLogged() {
    return localStorage.getItem(this.loggedKey);
  },
  setLogged(email) {
    localStorage.setItem(this.loggedKey, email);
  },
  removeLogged() {
    localStorage.removeItem(this.loggedKey);
  },
};

// ---------- Initial seed (admin + demo products) ----------
(function seed() {
  const users = LS.getUsers();
  if (!users.some((u) => u.email === "admin@gmail.com")) {
    users.push({
      id: generateId("user"),
      firstName: "Admin",
      lastName: "User",
      email: "admin@gmail.com",
      password: "admin123",
      isAdmin: true,
    });
    LS.setUsers(users);
  }

  const products = LS.getProducts();
  if (!products.length) {
    const sample = [
      {
        id: generateId("prod"),
        name: "Wireless Headphones",
        price: 1999,
        description: "Bluetooth over-ear headphones",
        image: "https://picsum.photos/seed/headphones/600/400",
      },
      {
        id: generateId("prod"),
        name: "Mechanical Keyboard",
        price: 3499,
        description: "RGB mechanical keyboard",
        image: "https://picsum.photos/seed/keyboard/600/400",
      },
      {
        id: generateId("prod"),
        name: "Gaming Mouse",
        price: 1299,
        description: "High DPI gaming mouse",
        image: "https://picsum.photos/seed/mouse/600/400",
      },
      {
        id: generateId("prod"),
        name: "Smart Watch",
        price: 4999,
        description: "Fitness tracking smart watch",
        image: "https://picsum.photos/seed/watch/600/400",
      },
    ];
    LS.setProducts(sample);
  }
})();

// ---------- Auth ----------
function registerUser(data) {
  const users = LS.getUsers();

  if (users.some((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
    return { ok: false, message: "Email already registered" };
  }

  const newUser = {
    id: generateId("user"),
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    password: data.password,
    isAdmin: false,
  };

  users.push(newUser);
  LS.setUsers(users);
  return { ok: true, user: newUser };
}

function loginUser(email, password) {
  const users = LS.getUsers();
  const user = users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );

  if (user) {
    LS.setLogged(user.email);
    return { ok: true, user };
  }

  return { ok: false, message: "Invalid credentials" };
}

function logout() {
  LS.removeLogged();
  showSnackbar("Logged out");
  setTimeout(() => (location.href = "login.html"), 500);
}

function getCurrentUser() {
  const email = LS.getLogged();
  if (!email) return null;

  const users = LS.getUsers();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
}

// ---------- Product CRUD ----------
function addProduct(p) {
  const products = LS.getProducts();

  const prod = {
    id: generateId("prod"),
    name: p.name,
    description: p.description,
    price: Number(p.price),
    image:
      p.image ||
      `https://picsum.photos/seed/${Math.floor(Math.random() * 9999)}/600/400`,
  };

  products.unshift(prod);
  LS.setProducts(products);

  return prod;
}

function updateProduct(updated) {
  const products = LS.getProducts();
  const index = products.findIndex((p) => p.id === updated.id);

  if (index === -1) return false;

  products[index] = {
    ...products[index],
    ...updated,
    price: Number(updated.price),
  };

  LS.setProducts(products);
  return true;
}

function deleteProductById(id) {
  let products = LS.getProducts();
  products = products.filter((p) => p.id !== id);
  LS.setProducts(products);

  let cart = LS.getCart();
  cart = cart.filter((c) => c.productId !== id);
  LS.setCart(cart);

  return true;
}

// ---------- Cart ----------
function addToCart(productId, qty = 1) {
  const cart = LS.getCart();

  const item = cart.find((c) => c.productId === productId);
  if (item) {
    item.qty += qty;
  } else {
    cart.push({
      id: generateId("cart"),
      productId,
      qty: Number(qty),
    });
  }

  LS.setCart(cart);
  showSnackbar("Added to cart");
}

function updateCartItem(cartId, qty) {
  const cart = LS.getCart();
  const item = cart.find((c) => c.id === cartId);

  if (!item) return false;

  item.qty = Number(qty);
  LS.setCart(cart);
  return true;
}

function removeCartItem(cartId) {
  let cart = LS.getCart();
  cart = cart.filter((c) => c.id !== cartId);
  LS.setCart(cart);
}

// ---------- Navbar Renderer ----------
function renderNav() {
  const nav = document.getElementById("mainNav");
  if (!nav) return;

  const user = getCurrentUser();
  const isAdmin = user && user.isAdmin;

  nav.innerHTML = `
  <nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
    <div class="container">
      <a class="navbar-brand fw-bold" href="home.html">Online Shop</a>

      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navCollapse">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navCollapse">
        <ul class="navbar-nav ms-auto align-items-lg-center">

          <li class="nav-item"><a class="nav-link" href="home.html">Home</a></li>
          <li class="nav-item"><a class="nav-link" href="shop.html">Shop</a></li>

          ${isAdmin ? `<li class="nav-item"><a class="nav-link" href="add-product.html">Add Product</a></li>` : ""}

          <li class="nav-item">
            <a class="nav-link" href="cart.html">Cart <span class="badge bg-primary" id="cartBadge">0</span></a>
          </li>

          <li class="nav-item dropdown ms-2">
            <a class="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">
              ${user ? user.firstName : "Account"}
            </a>
            <ul class="dropdown-menu dropdown-menu-end">
              ${
                user
                  ? `<li><a class="dropdown-item" href="#" id="logoutLink">Logout</a></li>`
                  : `
              <li><a class="dropdown-item" href="login.html">Login</a></li>
              <li><a class="dropdown-item" href="register.html">Register</a></li>`
              }
            </ul>
          </li>

        </ul>
      </div>
    </div>
  </nav>
  `;

  // Attach logout listener
  const logoutLink = document.getElementById("logoutLink");
  if (logoutLink)
    logoutLink.addEventListener("click", (e) => {
      e.preventDefault();
      logout();
    });

  updateCartBadge();
}

function updateCartBadge() {
  const badge = document.getElementById("cartBadge");
  if (!badge) return;

  const cart = LS.getCart();
  const total = cart.reduce((s, c) => s + c.qty, 0);

  badge.textContent = total;
}

// ---------- Page Logic ----------

// ---- Login Page ----
function initLoginPage() {
  const form = document.getElementById("loginForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    if (!email || !password) {
      showSnackbar("Enter email & password");
      return;
    }

    const res = loginUser(email, password);

    if (res.ok) {
      showSnackbar("Login successful");
      setTimeout(() => (location.href = "home.html"), 700);
    } else {
      showSnackbar("Invalid credentials");
    }
  });
}

// ---- Register Page ----
function initRegisterPage() {
  const form = document.getElementById("registerForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const first = document.getElementById("firstName").value.trim();
    const last = document.getElementById("lastName").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const pass = document.getElementById("regPassword").value;
    const confirm = document.getElementById("regConfirm").value;

    if (!first || !last || !email || !pass || !confirm) {
      showSnackbar("Please fill all fields");
      return;
    }

    if (pass.length < 6) {
      showSnackbar("Password must be ≥ 6 characters");
      return;
    }

    if (pass !== confirm) {
      showSnackbar("Passwords do not match");
      return;
    }

    const result = registerUser({
      firstName: first,
      lastName: last,
      email,
      password: pass,
    });

    if (!result.ok) {
      showSnackbar(result.message);
      return;
    }

    showSnackbar("Registered! Redirecting to login...");
    setTimeout(() => (location.href = "login.html"), 900);
  });
}

// ---- Shop Page ----
function renderProductsGrid(filter = "") {
  const grid = document.getElementById("productsGrid");
  if (!grid) return;

  const products = LS.getProducts();
  const user = getCurrentUser();
  const isAdmin = user?.isAdmin;

  const filtered = products.filter((p) =>
    (p.name + " " + p.description)
      .toLowerCase()
      .includes(filter.toLowerCase())
  );

  grid.innerHTML = "";

  if (!filtered.length) {
    grid.innerHTML = `<div class="col-12"><div class="alert alert-light">No products found</div></div>`;
    return;
  }

  filtered.forEach((p) => {
    const card = document.createElement("div");
    card.className = "col-12 col-md-6 col-lg-4";

    card.innerHTML = `
      <div class="card material-card h-100">
        <img src="${p.image}" class="card-img-top product-img">

        <div class="card-body d-flex flex-column">
          <h5>${p.name}</h5>
          <p class="text-muted small flex-grow-1">${p.description}</p>

          <div class="d-flex justify-content-between align-items-center">
            <strong>₹${p.price}</strong>

            <div>
              <button class="btn btn-sm btn-outline-primary addCartBtn" data-id="${p.id}">Add</button>

              ${
                isAdmin
                  ? `<button class="btn btn-sm btn-outline-secondary editBtn" data-id="${p.id}">Edit</button>
                     <button class="btn btn-sm btn-outline-danger deleteBtn" data-id="${p.id}">Delete</button>`
                  : ""
              }
            </div>
          </div>
        </div>
      </div>
    `;

    grid.appendChild(card);
  });

  // Attach events
  $$(".addCartBtn").forEach((btn) =>
    btn.addEventListener("click", (e) => {
      addToCart(e.target.dataset.id);
      updateCartBadge();
    })
  );

  $$(".editBtn").forEach((btn) =>
    btn.addEventListener("click", (e) => {
      location.href = `edit-product.html?id=${e.target.dataset.id}`;
    })
  );

  $$(".deleteBtn").forEach((btn) =>
    btn.addEventListener("click", (e) => {
      if (confirm("Delete product?")) {
        deleteProductById(e.target.dataset.id);
        showSnackbar("Product deleted");
        renderProductsGrid(filter);
      }
    })
  );
}

function initShopPage() {
  if (!$("#productsGrid")) return;
  const user = getCurrentUser();
  if (!user) {
    showSnackbar("Please login");
    setTimeout(() => (location.href = "login.html"), 700);
    return;
  }

  renderProductsGrid();

  const search = document.getElementById("searchBox");
  if (search)
    search.addEventListener("input", (e) =>
      renderProductsGrid(e.target.value)
    );
}

// ---- Add Product Page ----
function initAddProductPage() {
  const form = document.getElementById("productForm");
  if (!form) return;

  const user = getCurrentUser();
  if (!user || !user.isAdmin) {
    showSnackbar("Admins only");
    setTimeout(() => (location.href = "shop.html"), 700);
    return;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("prodName").value.trim();
    const desc = document.getElementById("prodDesc").value.trim();
    const price = document.getElementById("prodPrice").value.trim();
    const img = document.getElementById("prodImg").value.trim();

    if (!name || !desc || !price) {
      showSnackbar("Fill all fields");
      return;
    }

    addProduct({
      name,
      description: desc,
      price,
      image: img,
    });

    showSnackbar("Product added");
    setTimeout(() => (location.href = "shop.html"), 700);
  });
}

// ---- Edit Product Page ----
function initEditProductPage() {
  const form = document.getElementById("editForm");
  if (!form) return;

  const user = getCurrentUser();
  if (!user || !user.isAdmin) {
    showSnackbar("Admins only");
    setTimeout(() => (location.href = "shop.html"), 700);
    return;
  }

  const params = new URLSearchParams(location.search);
  const id = params.get("id");

  const products = LS.getProducts();
  const prod = products.find((p) => p.id === id);

  if (!prod) {
    showSnackbar("Not found");
    setTimeout(() => (location.href = "shop.html"), 700);
    return;
  }

  document.getElementById("editId").value = prod.id;
  document.getElementById("editName").value = prod.name;
  document.getElementById("editDesc").value = prod.description;
  document.getElementById("editPrice").value = prod.price;
  document.getElementById("editImg").value = prod.image;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    updateProduct({
      id: prod.id,
      name: document.getElementById("editName").value.trim(),
      description: document.getElementById("editDesc").value.trim(),
      price: document.getElementById("editPrice").value.trim(),
      image: document.getElementById("editImg").value.trim(),
    });

    showSnackbar("Updated");
    setTimeout(() => (location.href = "shop.html"), 700);
  });
}

// ---- Cart Page ----
function renderCart() {
  const wrap = document.getElementById("cartList");
  if (!wrap) return;

  const cart = LS.getCart();
  const products = LS.getProducts();

  wrap.innerHTML = "";

  if (!cart.length) {
    wrap.innerHTML =
      '<div class="alert alert-light">Cart is empty. <a href="shop.html">Shop now</a></div>';
    updateCartBadge();
    return;
  }

  let total = 0;

  cart.forEach((item) => {
    const prod = products.find((p) => p.id === item.productId);
    if (!prod) return;

    const row = document.createElement("div");
    row.className = "card material-card mb-3";

    row.innerHTML = `
      <div class="card-body d-flex align-items-center">

        <img src="${prod.image}" style="width:100px; height:70px; object-fit:cover; border-radius:8px;">

        <div class="ms-3 flex-grow-1">
          <strong>${prod.name}</strong><br>
          <span class="text-muted small">₹${prod.price} each</span>
        </div>

        <div class="text-end">
          <input type="number" value="${item.qty}" min="1"
                 data-cartid="${item.id}"
                 class="form-control form-control-sm cartQty"
                 style="width:80px; display:inline-block">

          <button class="btn btn-sm btn-outline-danger removeCart mt-2"
                  data-cartid="${item.id}">Remove</button>
        </div>

      </div>
    `;

    wrap.appendChild(row);

    total += prod.price * item.qty;
  });

  const summary = document.createElement("div");
  summary.className = "card material-card p-3";
  summary.innerHTML = `
    <div class="d-flex justify-content-between">
      <strong>Total</strong>
      <strong>₹${total}</strong>
    </div>
  `;
  wrap.appendChild(summary);

  // Events
  $$(".cartQty").forEach((i) =>
    i.addEventListener("change", (e) => {
      const id = e.target.dataset.cartid;
      let val = Number(e.target.value);
      if (val < 1) val = 1;

      updateCartItem(id, val);
      renderCart();
      updateCartBadge();
    })
  );

  $$(".removeCart").forEach((btn) =>
    btn.addEventListener("click", (e) => {
      removeCartItem(e.target.dataset.cartid);
      renderCart();
      updateCartBadge();
      showSnackbar("Removed");
    })
  );
}

function initCartPage() {
  if (!$("#cartList")) return;

  const user = getCurrentUser();
  if (!user) {
    showSnackbar("Please login");
    setTimeout(() => (location.href = "login.html"), 700);
    return;
  }

  renderCart();

  const checkout = document.getElementById("checkoutBtn");
  if (checkout)
    checkout.addEventListener("click", () => {
      const cart = LS.getCart();
      if (!cart.length) {
        showSnackbar("Cart empty");
        return;
      }

      LS.setCart([]);
      showSnackbar("Order placed!");
      setTimeout(() => (location.href = "home.html"), 900);
    });
}

// ---------- Page Init & Fix for GitHub Pages ----------
document.addEventListener("DOMContentLoaded", () => {
  renderNav();

  initLoginPage();
  initRegisterPage();
  initShopPage();
  initAddProductPage();
  initEditProductPage();
  initCartPage();

  const user = LS.getLogged();

  const path = location.pathname.split("/").pop();
  const publicPages = ["login.html", "register.html"];
  const protectedPages = [
    "home.html",
    "shop.html",
    "add-product.html",
    "edit-product.html",
    "cart.html",
  ];

  // ⭐ IMPORTANT GITHUB FIX:
  // GitHub Pages serves blank path "" sometimes.
  // To prevent infinite "Please login" loops:
  if (path === "" || path === "index.html") {
    return; // DO NOTHING
  }

  // Prevent redirect loop on login/register
  if (publicPages.includes(path) && user) {
    location.href = "home.html";
    return;
  }

  // Protect real pages
  if (protectedPages.includes(path) && !user) {
    showSnackbar("Please login");
    setTimeout(() => (location.href = "login.html"), 700);
    return;
  }
});
