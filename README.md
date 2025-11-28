# Dynamic Online Shopping Website (LocalStorage)

A multi-page front-end web application built with **Bootstrap 5** and lightweight **Material-style** components. Uses **JavaScript + LocalStorage** for data persistence and implements **CRUD**, **Login/Registration**, and a **Shopping Cart**.

## Pages
- `index.html` — Redirects to login or home.
- `login.html` — Login form (email + password). On success sets `localStorage.loggedInUser`.
- `register.html` — Registration form. Validates email, password >= 6, confirm password. Prevents duplicate emails.
- `home.html` — Landing page after login. Shows hero and categories.
- `shop.html` — Product listing (READ). Search box, Add to Cart. Admin sees Edit/Delete.
- `add-product.html` — Admin can create products (CREATE).
- `edit-product.html` — Admin can edit product details (UPDATE).
- `cart.html` — View cart, update qty, remove items, checkout (DELETE from cart).

## CRUD summary
- **Users**: stored in `localStorage` key `os_users_v1`. Registration creates a user object. Login matches email & password.
- **Products**: stored in `localStorage` key `os_products_v1`. Admin can Add / Edit / Delete.
- **Cart**: stored in `localStorage` key `os_cart_v1`. Add items, update quantity, delete items, checkout clears cart.

## Admin
Default admin credentials:
- Email: `admin@gmail.com`
- Password: `admin123`

Admin users have `isAdmin: true` and can add/edit/delete products.

## Bootstrap elements used
- Grid system (rows, cols)
- Navbar
- Cards
- Forms & inputs
- Buttons & badges
- Responsive utilities

## Material components (implemented via CSS + icons)
- Material-style cards with rounded corners & shadows
- Material-like buttons with gradient and shadow
- Form inputs styled like Material fields
- Snackbar for alerts
- Material icons from Google

## How to run
1. Clone or copy files to a folder.
2. Open `login.html` in a browser (no server required).
3. Register a new user or login with admin credentials.
4. Add/Edit products (admin) and use the Shop/Cart features.

## Notes for grading
- All data persists in the browser `localStorage`.
- Code is modularized into a single `assets/js/script.js` for simplicity.
- README includes explanations required by the assignment.

## GitHub
1. Create a repo and push the folder structure.
2. Add this README and ensure all files are included.
3. If required, enable GitHub Pages to host the `index.html` (optional).
