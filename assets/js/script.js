// === script.js ===
// Single JS file handling users, auth, products CRUD, cart, UI rendering, snackbars, validation

// ---------- Utilities ----------
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

function showSnackbar(msg) {
  const el = document.getElementById('snackbar');
  if (!el) return alert(msg);
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 3200);
}

function generateId(prefix='id') {
  return prefix + '_' + Date.now() + '_' + Math.floor(Math.random()*900+100);
}

// ---------- LocalStorage helpers ----------
const LS = {
  usersKey: 'os_users_v1',
  productsKey: 'os_products_v1',
  cartKey: 'os_cart_v1',
  loggedKey: 'loggedInUser',
  getUsers() { return JSON.parse(localStorage.getItem(this.usersKey) || '[]'); },
  setUsers(u){ localStorage.setItem(this.usersKey, JSON.stringify(u)); },
  getProducts() { return JSON.parse(localStorage.getItem(this.productsKey) || '[]'); },
  setProducts(p){ localStorage.setItem(this.productsKey, JSON.stringify(p)); },
  getCart() { return JSON.parse(localStorage.getItem(this.cartKey) || '[]'); },
  setCart(c){ localStorage.setItem(this.cartKey, JSON.stringify(c)); },
  getLogged() { return localStorage.getItem(this.loggedKey); },
  setLogged(email) { localStorage.setItem(this.loggedKey, email); },
  removeLogged() { localStorage.removeItem(this.loggedKey); }
};

// ---------- Initial seed (admin + sample products) ----------
(function seed() {
  // seed admin if not present
  const users = LS.getUsers();
  if (!users.some(u => u.email === 'admin@gmail.com')) {
    users.push({ id: generateId('user'), firstName: 'Admin', lastName: 'User', email: 'admin@gmail.com', password: 'admin123', isAdmin: true });
    LS.setUsers(users);
  }
  // seed sample products if empty
  const products = LS.getProducts();
  if (!products.length) {
    const sample = [
      { id: generateId('prod'), name: 'Wireless Headphones', price: 1999, description: 'Bluetooth over-ear headphones', image: 'https://picsum.photos/seed/headphones/600/400' },
      { id: generateId('prod'), name: 'Mechanical Keyboard', price: 3499, description: 'RGB mechanical keyboard', image: 'https://picsum.photos/seed/keyboard/600/400' },
      { id: generateId('prod'), name: 'Gaming Mouse', price: 1299, description: 'High DPI gaming mouse', image: 'https://picsum.photos/seed/mouse/600/400' },
      { id: generateId('prod'), name: 'Smart Watch', price: 4999, description: 'Fitness tracking smart watch', image: 'https://picsum.photos/seed/watch/600/400' }
    ];
    LS.setProducts(sample);
  }
})();

// ---------- Auth functions ----------
function registerUser(data) {
  const users = LS.getUsers();
  if (users.some(u => u.email.toLowerCase() === data.email.toLowerCase())) {
    return { ok: false, message: 'Email already registered' };
  }
  const newUser = {
    id: generateId('user'),
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    password: data.password,
    isAdmin: false
  };
  users.push(newUser);
  LS.setUsers(users);
  return { ok: true, user: newUser };
}

function loginUser(email, password) {
  const users = LS.getUsers();
  const user = users.find(u => u.email.toLowerCase() === (email||'').toLowerCase() && u.password === password);
  if (user) {
    LS.setLogged(user.email);
    return { ok: true, user };
  }
  return { ok: false, message: 'Invalid credentials' };
}

function logout() {
  LS.removeLogged();
  showSnackbar('Logged out');
  setTimeout(() => location.href = 'login.html', 500);
}

function getCurrentUser() {
  const email = LS.getLogged();
  if (!email) return null;
  const users = LS.getUsers();
  return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
}

// ---------- Product CRUD ----------
function addProduct(p) {
  const products = LS.getProducts();
  const prod = {
    id: generateId('prod'),
    name: p.name,
    description: p.description,
    price: Number(p.price),
    image: p.image || `https://picsum.photos/seed/${Math.floor(Math.random()*9999)}/600/400`
  };
  products.unshift(prod);
  LS.setProducts(products);
  return prod;
}

function updateProduct(updated) {
  const products = LS.getProducts();
  const idx = products.findIndex(p => p.id === updated.id);
  if (idx === -1) return false;
  products[idx] = { ...products[idx], ...updated, price: Number(updated.price) };
  LS.setProducts(products);
  return true;
}

function deleteProductById(id) {
  let products = LS.getProducts();
  products = products.filter(p => p.id !== id);
  LS.setProducts(products);
  // also remove from cart
  let cart = LS.getCart();
  cart = cart.filter(ci => ci.productId !== id);
  LS.setCart(cart);
  return true;
}

// ---------- Cart ----------
function addToCart(productId, qty=1) {
  const cart = LS.getCart();
  const item = cart.find(c => c.productId === productId);
  if (item) {
    item.qty += qty;
  } else {
    cart.push({ id: generateId('cart'), productId, qty: Number(qty) });
  }
  LS.setCart(cart);
  showSnackbar('Added to cart');
}

function updateCartItem(cartId, qty) {
  const cart = LS.getCart();
  const item = cart.find(c => c.id === cartId);
  if (!item) return false;
  item.qty = Number(qty);
  LS.setCart(cart);
  return true;
}

function removeCartItem(cartId) {
  let cart = LS.getCart();
  cart = cart.filter(c => c.id !== cartId);
  LS.setCart(cart);
}

// ---------- Rendering helpers ----------
function renderNav() {
  const navContainer = document.getElementById('mainNav');
  if (!navContainer) return;
  const user = getCurrentUser();
  const isAdmin = user && user.isAdmin;
  navContainer.innerHTML = `
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
          ${isAdmin ? `<li class="nav-item"><a class="nav-link" href="add-product.html">Add Product</a></li>` : ''}
          <li class="nav-item"><a class="nav-link" href="cart.html">Cart <span class="badge bg-primary" id="cartBadge">0</span></a></li>
          <li class="nav-item dropdown ms-2">
            <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
              ${user ? (user.firstName || user.email) : 'Account'}
            </a>
            <ul class="dropdown-menu dropdown-menu-end">
              ${user ? `<li><a class="dropdown-item" href="#" id="logoutLink">Logout</a></li>` : `<li><a class="dropdown-item" href="login.html">Login</a></li><li><a class="dropdown-item" href="register.html">Register</a></li>`}
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </nav>
  `;
  // attach logout
  const logoutLink = document.getElementById('logoutLink');
  if (logoutLink) logoutLink.addEventListener('click', (e) => { e.preventDefault(); logout();});
  updateCartBadge();
}

function updateCartBadge() {
  const badge = document.getElementById('cartBadge');
  if (!badge) return;
  const cart = LS.getCart();
  const total = cart.reduce((s, c) => s + c.qty, 0);
  badge.textContent = total;
}

// ---------- Page-specific logic ----------

// ---- Login page
function initLoginPage() {
  const form = document.getElementById('loginForm');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    if (!email || !password) { showSnackbar('Please enter email & password'); return; }
    const res = loginUser(email, password);
    if (res.ok) {
      showSnackbar('Login successful');
      setTimeout(() => location.href = 'home.html', 600);
    } else {
      showSnackbar(res.message || 'Invalid credentials');
    }
  });
}

// ---- Register page
function initRegisterPage() {
  const form = document.getElementById('registerForm');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirm = document.getElementById('regConfirm').value;
    if (!firstName || !lastName || !email || !password || !confirm) { showSnackbar('Please fill all fields'); return; }
    // email validation simple
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(email)) { showSnackbar('Invalid email'); return; }
    if (password.length < 6) { showSnackbar('Password must be at least 6 characters'); return; }
    if (password !== confirm) { showSnackbar('Passwords do not match'); return; }
    const res = registerUser({ firstName, lastName, email, password });
    if (!res.ok) {
      showSnackbar(res.message);
      return;
    }
    showSnackbar('Registration successful. Redirecting to login...');
    setTimeout(() => location.href = 'login.html', 900);
  });
}

// ---- Add product page
function initAddProductPage() {
  const form = document.getElementById('productForm');
  if (!form) return;
  // guard: only admin
  const user = getCurrentUser();
  if (!user || !user.isAdmin) {
    showSnackbar('Only admin can add products');
    setTimeout(() => location.href = 'shop.html', 700);
    return;
  }
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('prodName').value.trim();
    const desc = document.getElementById('prodDesc').value.trim();
    const price = document.getElementById('prodPrice').value;
    const image = document.getElementById('prodImg').value.trim();
    if (!name || !desc || !price) { showSnackbar('Please fill required fields'); return; }
    addProduct({ name, description: desc, price, image });
    showSnackbar('Product added');
    setTimeout(() => location.href = 'shop.html', 700);
  });
}

// ---- Edit product page
function initEditProductPage() {
  const form = document.getElementById('editForm');
  if (!form) return;
  const user = getCurrentUser();
  if (!user || !user.isAdmin) {
    showSnackbar('Only admin can edit products');
    setTimeout(() => location.href = 'shop.html', 700);
    return;
  }

  // read id from query string ?id=...
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  const products = LS.getProducts();
  const prod = products.find(p => p.id === id);
  if (!prod) {
    showSnackbar('Product not found');
    setTimeout(() => location.href = 'shop.html', 700);
    return;
  }

  document.getElementById('editId').value = prod.id;
  document.getElementById('editName').value = prod.name;
  document.getElementById('editDesc').value = prod.description;
  document.getElementById('editPrice').value = prod.price;
  document.getElementById('editImg').value = prod.image || '';

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const updated = {
      id: document.getElementById('editId').value,
      name: document.getElementById('editName').value.trim(),
      description: document.getElementById('editDesc').value.trim(),
      price: document.getElementById('editPrice').value,
      image: document.getElementById('editImg').value.trim()
    };
    if (!updated.name || !updated.description || !updated.price) { showSnackbar('Complete fields'); return; }
    updateProduct(updated);
    showSnackbar('Product updated');
    setTimeout(() => location.href = 'shop.html', 700);
  });
}

// ---- Shop page (product listing)
function renderProductsGrid(filterText='') {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;
  const products = LS.getProducts();
  const user = getCurrentUser();
  const isAdmin = user && user.isAdmin;
  const filtered = products.filter(p => (p.name + ' ' + p.description).toLowerCase().includes(filterText.toLowerCase()));
  grid.innerHTML = '';
  if (!filtered.length) {
    grid.innerHTML = `<div class="col-12"><div class="alert alert-light">No products found.</div></div>`;
    return;
  }
  filtered.forEach(p => {
    const col = document.createElement('div');
    col.className = 'col-12 col-md-6 col-lg-4';
    col.innerHTML = `
      <div class="card material-card h-100">
        <img src="${p.image}" class="card-img-top product-img" alt="${p.name}">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${p.name}</h5>
          <p class="card-text text-muted small flex-grow-1">${p.description}</p>
          <div class="d-flex justify-content-between align-items-center mt-3">
            <div><strong>₹${p.price}</strong></div>
            <div>
              <button class="btn btn-sm btn-outline-primary addCartBtn" data-id="${p.id}">Add to cart</button>
              ${isAdmin ? ` <button class="btn btn-sm btn-outline-secondary editBtn" data-id="${p.id}">Edit</button> 
              <button class="btn btn-sm btn-outline-danger deleteBtn" data-id="${p.id}">Delete</button>` : ''}
            </div>
          </div>
        </div>
      </div>
    `;
    grid.appendChild(col);
  });

  // attach handlers
  $$('.addCartBtn').forEach(b => b.addEventListener('click', (e) => {
    const id = e.currentTarget.dataset.id;
    addToCart(id, 1);
    updateCartBadge();
  }));

  $$('.editBtn').forEach(b => b.addEventListener('click', (e) => {
    const id = e.currentTarget.dataset.id;
    location.href = `edit-product.html?id=${id}`;
  }));

  $$('.deleteBtn').forEach(b => b.addEventListener('click', (e) => {
    const id = e.currentTarget.dataset.id;
    if (confirm('Delete this product?')) {
      deleteProductById(id);
      showSnackbar('Product deleted');
      renderProductsGrid(document.getElementById('searchBox') ? document.getElementById('searchBox').value : '');
      updateCartBadge();
    }
  }));
}

function initShopPage() {
  // guard: login required
  const user = getCurrentUser();
  if (!user) { showSnackbar('Please login'); setTimeout(()=> location.href='login.html',600); return; }
  renderProductsGrid();
  const search = document.getElementById('searchBox');
  if (search) {
    search.addEventListener('input', (e) => renderProductsGrid(e.target.value));
  }
}

// ---- Cart page
function renderCart() {
  const container = document.getElementById('cartList');
  if (!container) return;
  const cart = LS.getCart();
  const products = LS.getProducts();
  container.innerHTML = '';
  if (!cart.length) {
    container.innerHTML = `<div class="alert alert-light">Your cart is empty. <a href="shop.html">Start shopping</a></div>`;
    updateCartBadge();
    return;
  }
  let total = 0;
  cart.forEach(item => {
    const prod = products.find(p => p.id === item.productId);
    if (!prod) return;
    const row = document.createElement('div');
    row.className = 'card material-card mb-3';
    row.innerHTML = `
      <div class="card-body d-flex align-items-center">
        <img src="${prod.image}" style="width:100px; height:70px; object-fit:cover; border-radius:8px;" />
        <div class="ms-3 flex-grow-1">
          <div class="fw-bold">${prod.name}</div>
          <div class="text-muted small">₹${prod.price} each</div>
        </div>
        <div class="text-end">
          <div class="mb-2">
            <input type="number" min="1" value="${item.qty}" data-cartid="${item.id}" class="form-control form-control-sm cartQty" style="width:80px; display:inline-block;">
          </div>
          <div>
            <button class="btn btn-sm btn-outline-danger removeCart" data-cartid="${item.id}">Remove</button>
          </div>
        </div>
      </div>
    `;
    container.appendChild(row);
    total += prod.price * item.qty;
  });

  const summary = document.createElement('div');
  summary.className = 'card material-card p-3';
  summary.innerHTML = `
    <div class="d-flex justify-content-between align-items-center">
      <div><strong>Total</strong></div>
      <div><strong>₹${total}</strong></div>
    </div>
  `;
  container.appendChild(summary);

  $$('.cartQty').forEach(input => {
    input.addEventListener('change', (e) => {
      const id = e.target.dataset.cartid;
      let val = Number(e.target.value);
      if (val < 1) val = 1;
      updateCartItem(id, val);
      renderCart();
      updateCartBadge();
    });
  });
  $$('.removeCart').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.cartid;
      removeCartItem(id);
      renderCart();
      updateCartBadge();
      showSnackbar('Removed from cart');
    });
  });
}

function initCartPage() {
  const user = getCurrentUser();
  if (!user) { showSnackbar('Please login'); setTimeout(()=> location.href='login.html',600); return; }
  renderCart();
  const checkoutBtn = document.getElementById('checkoutBtn');
  if (checkoutBtn) checkoutBtn.addEventListener('click', () => {
    const cart = LS.getCart();
    if (!cart.length) { showSnackbar('Cart is empty'); return; }
    // simple checkout: clear cart
    LS.setCart([]);
    showSnackbar('Checkout successful — order placed');
    setTimeout(() => location.href = 'home.html', 900);
  });
}

// ---------- Page init runner ----------
document.addEventListener('DOMContentLoaded', () => {
  renderNav();

  // init pages according to presence of elements
  initLoginPage();
  initRegisterPage();
  initAddProductPage();
  initEditProductPage();
  initShopPage();
  initCartPage();

  // Protect pages that require login (home, shop, add/edit/cart require login)
  const path = location.pathname.split('/').pop();
  const publicPages = ['login.html', 'register.html'];
  const user = LS.getLogged();

  // If on login/register and already logged in, redirect to home
  if ((path === 'login.html' || path === 'register.html') && user) {
    location.href = 'home.html';
  }

  // If on any page other than login/register and not logged in, redirect to login
  const pagesRequireAuth = ['home.html','shop.html','add-product.html','edit-product.html','cart.html'];
  if (pagesRequireAuth.includes(path) && !user) {
    showSnackbar('Please login');
    setTimeout(()=> location.href = 'login.html', 700);
  }
});
