// ----------------------------
// Common Utility Functions
// ----------------------------
function addToCart(productId){
    fetch(`http://127.0.0.1:8000/api/cart/add/${productId}/`, {
        method: "POST",
        headers: {"Content-Type": "application/json"}
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message || "Product added to cart!");
        updateCartCount();
    })
    .catch(err => console.error(err));
}

function updateCartCount(){
    // Optionally, show cart count in navbar
    fetch("http://127.0.0.1:8000/api/cart/my_cart/")
    .then(res => res.json())
    .then(items => {
        const cartLinks = document.querySelectorAll(".bi-cart");
        let count = items.reduce((acc, item) => acc + item.quantity, 0);
        cartLinks.forEach(icon => icon.innerText = ` ${count}`);
    });
}

// ----------------------------
// Load Products for index.html
// ----------------------------
function loadProducts() {
    const productsContainer = document.getElementById("products");
    if (!productsContainer) return;

    fetch("http://127.0.0.1:8000/api/products/")
        .then(res => res.json())
        .then(products => {
            productsContainer.innerHTML = "";  // Clear previous items (optional)

            products.forEach(product => {
                const col = document.createElement("div");
                col.className = "col-sm-6 col-md-4 col-lg-3 mb-4";

                const imageUrl = product.image_url ? product.image_url : "https://via.placeholder.com/150";

                col.innerHTML = `
                    <div class="card h-100">
                        <img src="${imageUrl}" class="card-img-top" alt="${product.name}">
                        <div class="card-body text-center">
                            <h5 class="card-title">${product.name}</h5>
                            <p class="card-text">₹${product.price}</p>
                            <a href="product.html?id=${product.id}" class="btn btn-outline-primary mb-2">View</a>
                            <button class="btn btn-primary" onclick="addToCart(${product.id})">Add to Cart</button>
                        </div>
                    </div>
                `;
                productsContainer.appendChild(col);
            });
        })
        .catch(err => {
            console.error("Failed to load products:", err);
        });
}


// ----------------------------
// Load Product Detail (product.html)
// ----------------------------
function loadProductDetail() {
    const productDetailContainer = document.getElementById("product-detail");
    if (!productDetailContainer) return;

    const productId = new URLSearchParams(window.location.search).get('id');
    if (!productId) return;

    fetch(`http://127.0.0.1:8000/api/products/${productId}/`)
        .then(res => res.json())
        .then(product => {
            const imageUrl = product.image_url ? product.image_url : "https://via.placeholder.com/300x200";

            productDetailContainer.innerHTML = `
                <img src="${imageUrl}" class="card-img-top mb-3" alt="${product.name}">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <h5>₹${product.price}</h5>
                <button class="btn btn-primary" onclick="addToCart(${product.id})">Add to Cart</button>
            `;
        })
        .catch(err => {
            productDetailContainer.innerHTML = `<p class="text-danger">Failed to load product details.</p>`;
            console.error("Error loading product:", err);
        });
}


// ----------------------------
// Load Category Products (category.html)
// ----------------------------
function loadCategoryProducts() {
    
    const container = document.getElementById("category-products");
    const categoryNameEl = document.getElementById("category-name");
    if (!container || !categoryNameEl) return;

    const categoryId = new URLSearchParams(window.location.search).get('id');
    if (!categoryId) {
        categoryNameEl.innerText = "Category not specified.";
        container.innerHTML = "<p class='text-warning'>Please select a category.</p>";
        return;
    }

    fetch(`http://127.0.0.1:8000/api/products/?category=${categoryId}`)
         credentials: 'include'
        .then(res => {
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return res.json();
        })
        .then(products => {
            if (!Array.isArray(products)) throw new Error("Invalid products data");

            container.innerHTML = "";

            products.forEach(product => {
                const imageUrl = product.image_url || "https://via.placeholder.com/150";

                const col = document.createElement("div");
                col.className = "col-sm-6 col-md-4 col-lg-3 mb-4";

                col.innerHTML = `
                    <div class="card h-100">
                        <img src="${imageUrl}" class="card-img-top" alt="${product.name}">
                        <div class="card-body text-center">
                            <h5 class="card-title">${product.name}</h5>
                            <p class="card-text">₹${product.price}</p>
                            <a href="product.html?id=${product.id}" class="btn btn-outline-primary mb-2">View</a>
                            <button class="btn btn-primary" onclick="addToCart(${product.id})">Add to Cart</button>
                        </div>
                    </div>
                `;
                container.appendChild(col);
            });

            if (products.length > 0 && products[0].category && products[0].category.name) {
                categoryNameEl.innerText = products[0].category.name;
            } else {
                categoryNameEl.innerText = "Category";
            }
        })
        .catch(err => {
            console.error("Failed to load category products:", err);
            container.innerHTML = "<p class='text-danger'>Failed to load products.</p>";
            categoryNameEl.innerText = "Category";
        });
}


// ----------------------------
// Load Cart Items (cart.html)
// ----------------------------
function loadCart(){
    const cartItemsContainer = document.getElementById("cart-items");
    const cartTotalContainer = document.getElementById("cart-total");
    if(!cartItemsContainer) return;

    fetch("http://127.0.0.1:8000/api/cart/", {
        credentials: 'include' // ✅ required for session-based authentication
    })
    .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
    })
    .then(items => {
        cartItemsContainer.innerHTML = "";
        let total = 0;

        items.forEach(item => {
            const div = document.createElement("div");
            div.className = "list-group-item d-flex justify-content-between align-items-center";
            div.innerHTML = `
                ${item.product.name} - ₹${item.product.price} x ${item.quantity}
                <button class="btn btn-sm btn-danger" onclick="removeFromCart(${item.id})">Remove</button>
            `;
            cartItemsContainer.appendChild(div);
            total += item.product.price * item.quantity;
        });

        cartTotalContainer.innerText = `Total: ₹${total}`;
    })
    .catch(err => {
        console.error("Failed to load cart:", err);
        cartItemsContainer.innerHTML = `<p class="text-danger">Could not load cart.</p>`;
    });
}
function removeFromCart(cartItemId){
    fetch(`http://127.0.0.1:8000/api/cart/remove/${cartItemId}/`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include"  // ✅ same here
    })
    .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
    })
    .then(data => {
        alert(data.message || "Item removed!");
        loadCart();
        updateCartCount?.(); // Optional chaining in case this function is not defined
    })
    .catch(err => {
        console.error("Remove failed:", err);
    });
}

// ----------------------------
// Checkout Form (checkout.html)
// ----------------------------
function handleCheckout(){
    const form = document.getElementById("checkout-form");
    if(!form) return;

    form.addEventListener("submit", function(e){
        e.preventDefault();
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        fetch("http://127.0.0.1:8000/api/orders/create/", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(data)
        })
        .then(res => res.json())
        .then(resp => {
            alert(resp.message || "Order placed successfully!");
            window.location.href = "index.html";
        });
    });
}

// ----------------------------
// Initialize Page
// ----------------------------
document.addEventListener("DOMContentLoaded", () => {
    loadProducts();
    loadProductDetail();
    loadCategoryProducts();
    loadCart();
    handleCheckout();
    updateCartCount();
});
