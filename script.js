/* Optional vanilla JavaScript. The layout itself uses only HTML and CSS. */
const products = {
  camera: { name: 'Product 1', price: 4999, image: './assets/product-camera.png', description: 'A black camera with a red strap.' },
  perfume: { name: 'Product 2', price: 5999, image: './assets/product-perfume.png', description: 'A perfume bottle with evergreen branches and a white flower.' },
  makeup: { name: 'Product 3', price: 3999, image: './assets/product-makeup.png', description: 'Black cosmetic pencils presented on a dark background.' },
};
// Integer cents prevent floating point rounding errors.
const cart = new Map();
const dialog = document.getElementById('shop-dialog');
const title = document.getElementById('dialog-title');
const content = document.getElementById('dialog-content');
const money = (cents) => '$' + (cents / 100).toFixed(2);
let returnFocus = null;

function openDialog(heading, markup) {
  title.textContent = heading;
  content.innerHTML = markup;
  if (!dialog.open) {
    returnFocus = document.activeElement;
    dialog.showModal();
    document.body.classList.add('dialog-open');
  }
  // Keep keyboard focus inside the dialog after its content changes.
  if (!dialog.contains(document.activeElement)) document.getElementById('dialog-close').focus();
}

function showDetails(id) {
  const product = products[id];
  openDialog(product.name, `
    <img class="dialog-product-image" src="${product.image}" alt="${product.description}">
    <p>${product.description}</p>
    <p class="dialog-price">${money(product.price)}</p>
    <button class="button button-buy" type="button" data-add="${id}">Buy</button>
  `);
}

function addToCart(id) {
  cart.set(id, (cart.get(id) || 0) + 1);
  document.getElementById('cart-status').textContent = products[id].name + ' added to cart.';
  showCart();
}

function showCart() {
  if (!cart.size) {
    openDialog('Shopping cart', '<p>Your cart is empty.</p><button class="button button-buy" type="button" data-close>Continue shopping</button>');
    return;
  }
  let total = 0;
  const rows = [...cart].map(([id, quantity]) => {
    const product = products[id];
    total += product.price * quantity;
    return `
      <div class="cart-row">
        <img src="${product.image}" alt="${product.description}" width="56" height="56">
        <div><p><strong>${product.name}</strong></p><small>${money(product.price)} × ${quantity}</small></div>
        <button class="cart-remove" type="button" data-remove="${id}" aria-label="Remove ${product.name} from cart">Remove</button>
      </div>`;
  }).join('');
  openDialog('Shopping cart', `
    ${rows}
    <p class="cart-total"><span>Total</span><span>${money(total)}</span></p>
    <p class="demo-note">Demo cart. No order or payment is submitted.</p>
    <button class="button button-buy" type="button" data-close>Continue shopping</button>
  `);
}

document.querySelector('.product-grid').addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const id = button.closest('.product-card').dataset.product;
  if (button.dataset.action === 'details') showDetails(id);
  if (button.dataset.action === 'buy') addToCart(id);
});

content.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.dataset.add) addToCart(button.dataset.add);
  if (button.dataset.remove) {
    const id = button.dataset.remove;
    cart.delete(id);
    showCart();
    content.querySelector('[data-remove], [data-close]')?.focus();
    document.getElementById('cart-status').textContent = products[id].name + ' removed from cart.';
  }
  if (button.hasAttribute('data-close')) dialog.close();
});

document.getElementById('dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => {
  if (event.target !== dialog) return;
  const rect = dialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
});
dialog.addEventListener('close', () => {
  document.body.classList.remove('dialog-open');
  if (returnFocus?.isConnected) returnFocus.focus();
});
document.getElementById('contact-link').addEventListener('click', (event) => {
  event.preventDefault();
  openDialog('Contact', '<p><strong>PRAME DESIGN</strong></p><p>Contact details have not been added yet.</p>');
});
