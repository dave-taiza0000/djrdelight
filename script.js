/* ============================================================
   DJR Delights — shared cart & favorites logic
   Uses localStorage so state is shared across every page.
   ============================================================ */

const DJR_PRODUCTS = {
  'cupcake-choco':    { name: 'Chocolate Cupcake',    emoji: '🧁', price: 89,  cat: 'cupcakes' },
  'cake-strawberry':  { name: 'Strawberry Cake',      emoji: '🍰', price: 350, cat: 'cakes'    },
  'cookie-box':       { name: 'Cookie Box',           emoji: '🍪', price: 150, cat: 'cookies'  },
  'cookie-chocochip': { name: 'Chocolate Chip Cookie',emoji: '🍪', price: 75,  cat: 'cookies'  },
  'cookie-oatmeal':   { name: 'Oatmeal Cookie',       emoji: '🍪', price: 70,  cat: 'cookies'  },
  'drink-milktea':    { name: 'Milk Tea',             emoji: '🥤', price: 120, cat: 'drinks'   },
  'drink-icedcoffee': { name: 'Iced Coffee',          emoji: '☕', price: 130, cat: 'drinks'   },
  'cake-ube':         { name: 'Ube Cake',             emoji: '🎂', price: 320, cat: 'cakes'    },
  'cake-chocolate':   { name: 'Chocolate Cake',       emoji: '🍫', price: 340, cat: 'cakes'    },
};

const DELIVERY_FEE = 50;

/* ---------------- user session helpers ---------------- */
function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem('djr_user')) || null; }
  catch (e) { return null; }
}
function setCurrentUser(user) {
  localStorage.setItem('djr_user', JSON.stringify(user));
}
function clearCurrentUser() {
  localStorage.removeItem('djr_user');
}

/* "registered" accounts — simulated, since there's no real backend */
function getRegisteredUsers() {
  try { return JSON.parse(localStorage.getItem('djr_users')) || []; }
  catch (e) { return []; }
}
function registerUser(user) {
  const users = getRegisteredUsers();
  const idx = users.findIndex(u => u.email.toLowerCase() === user.email.toLowerCase());
  if (idx >= 0) users[idx] = user; else users.push(user);
  localStorage.setItem('djr_users', JSON.stringify(users));
}
function findUserByEmail(email) {
  return getRegisteredUsers().find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
}
/* Turns "alex.reyes@gmail.com" into "Alex.reyes" as a friendly fallback display name */
function nameFromEmail(email) {
  const local = email.split('@')[0] || 'Guest';
  return local.charAt(0).toUpperCase() + local.slice(1);
}

/* ---------------- delivery address ---------------- */
function getAddress() {
  try { return JSON.parse(localStorage.getItem('djr_address')) || null; }
  catch (e) { return null; }
}
function saveAddress(address) {
  localStorage.setItem('djr_address', JSON.stringify(address));
}

/* ---------------- payment methods ---------------- */
function getPaymentMethods() {
  try { return JSON.parse(localStorage.getItem('djr_payment_methods')) || []; }
  catch (e) { return []; }
}
function savePaymentMethods(list) {
  localStorage.setItem('djr_payment_methods', JSON.stringify(list));
}
function addPaymentMethod(method) {
  const list = getPaymentMethods();
  method.id = 'pm-' + Date.now();
  if (list.length === 0) method.isDefault = true;
  list.push(method);
  savePaymentMethods(list);
  return method;
}
function removePaymentMethod(id) {
  let list = getPaymentMethods().filter(m => m.id !== id);
  if (list.length && !list.some(m => m.isDefault)) list[0].isDefault = true;
  savePaymentMethods(list);
}
function setDefaultPaymentMethod(id) {
  const list = getPaymentMethods().map(m => ({ ...m, isDefault: m.id === id }));
  savePaymentMethods(list);
}

/* ---------------- order history ---------------- */
function getOrderHistory() {
  try { return JSON.parse(localStorage.getItem('djr_orders')) || []; }
  catch (e) { return []; }
}
function addOrderToHistory(order) {
  const history = getOrderHistory();
  history.unshift(order); // newest first
  localStorage.setItem('djr_orders', JSON.stringify(history));
}
/* There's no real backend tracking delivery — this simulates status
   progressing over time purely from when the order was placed, so the
   history page has something more useful than a single frozen status. */
function computeOrderStatus(order) {
  const elapsedMin = (Date.now() - (order.timestamp || Date.now())) / 60000;
  if (elapsedMin < 5) return 'Preparing';
  if (elapsedMin < 15) return 'Out for Delivery';
  return 'Delivered';
}

/* ---------------- app settings ---------------- */
function getSettings() {
  const defaults = { pushNotifications: true, emailUpdates: true, promoOffers: false };
  try { return Object.assign(defaults, JSON.parse(localStorage.getItem('djr_settings')) || {}); }
  catch (e) { return defaults; }
}
function saveSettings(settings) {
  localStorage.setItem('djr_settings', JSON.stringify(settings));
}

/* ---------------- reset everything (used by Settings > Clear App Data) ---------------- */
function clearAllAppData() {
  ['djr_cart', 'djr_favorites', 'djr_last_order', 'djr_orders', 'djr_user', 'djr_users',
   'djr_address', 'djr_payment_methods', 'djr_settings'].forEach(k => localStorage.removeItem(k));
}

/* ---------------- storage helpers ---------------- */
function getCart() {
  try { return JSON.parse(localStorage.getItem('djr_cart')) || {}; }
  catch (e) { return {}; }
}
function saveCart(cart) {
  localStorage.setItem('djr_cart', JSON.stringify(cart));
  updateCartBadge();
}
function getFavorites() {
  try { return JSON.parse(localStorage.getItem('djr_favorites')) || []; }
  catch (e) { return []; }
}
function saveFavorites(favs) {
  localStorage.setItem('djr_favorites', JSON.stringify(favs));
}

/* ---------------- cart actions ---------------- */
function addToCart(id, qty) {
  qty = qty || 1;
  const cart = getCart();
  cart[id] = (cart[id] || 0) + qty;
  saveCart(cart);
  toast((DJR_PRODUCTS[id] ? DJR_PRODUCTS[id].name : 'Item') + ' added to cart');
  if (typeof renderOrderPage === 'function') renderOrderPage();
}

function removeFromCart(id) {
  const cart = getCart();
  delete cart[id];
  saveCart(cart);
  if (typeof renderOrderPage === 'function') renderOrderPage();
}

function changeCartQty(id, delta) {
  const cart = getCart();
  if (!cart[id]) return;
  cart[id] += delta;
  if (cart[id] <= 0) delete cart[id];
  saveCart(cart);
  if (typeof renderOrderPage === 'function') renderOrderPage();
}

function cartCount() {
  const cart = getCart();
  return Object.values(cart).reduce((a, b) => a + b, 0);
}

function cartSubtotal() {
  const cart = getCart();
  return Object.keys(cart).reduce((sum, id) => {
    const p = DJR_PRODUCTS[id];
    return p ? sum + p.price * cart[id] : sum;
  }, 0);
}

/* ---------------- favorite actions ---------------- */
function toggleFavorite(id) {
  let favs = getFavorites();
  if (favs.includes(id)) {
    favs = favs.filter(f => f !== id);
    toast('Removed from favorites');
  } else {
    favs.push(id);
    toast('Added to favorites');
  }
  saveFavorites(favs);
  updateFavoriteIcons();
  if (typeof renderFavoritePage === 'function') renderFavoritePage();
}
function isFavorite(id) {
  return getFavorites().includes(id);
}

/* ---------------- UI sync ---------------- */
function updateCartBadge() {
  const n = cartCount();
  document.querySelectorAll('.cart-badge-count').forEach(el => {
    el.textContent = n;
    el.style.display = n > 0 ? 'flex' : 'none';
  });
}
function updateFavoriteIcons() {
  document.querySelectorAll('[data-fav-id]').forEach(el => {
    const id = el.getAttribute('data-fav-id');
    const active = isFavorite(id);
    el.classList.toggle('active', active);
    el.textContent = active ? '♥' : '♡';
  });
}

function toast(msg) {
  let t = document.getElementById('djr-toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'djr-toast';
    t.style.cssText = 'position:fixed;bottom:100px;left:50%;transform:translateX(-50%);' +
      'background:#444;color:#fff;padding:10px 20px;border-radius:20px;font-size:13px;' +
      'z-index:999;opacity:0;transition:opacity .25s;pointer-events:none;max-width:320px;text-align:center;';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.opacity = '1';
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.style.opacity = '0'; }, 1400);
}

document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  updateFavoriteIcons();
});
