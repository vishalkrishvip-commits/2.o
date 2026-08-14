const API_URL = "http://localhost:3000/api/products";

document.addEventListener("DOMContentLoaded", fetchProducts);

async function fetchProducts() {
  try {
    const response = await fetch(API_URL);
    const products = await response.json();
    renderTable(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    alert("Could not connect to backend server. Make sure it is running.");
  }
}

function renderTable(products) {
  const tbody = document.getElementById("product-list");
  tbody.innerHTML = "";

  products.forEach((p) => {
    const tr = document.createElement("tr");

    const inStock = p.inStock !== false; // Default to true if undefined
    const statusBadge = inStock
      ? `<span class="status-badge in-stock">In Stock</span>`
      : `<span class="status-badge out-stock">Out of Stock</span>`;

    // Resolve image src to backend if needed
    const imgSrc =
      p.image && p.image.startsWith("/")
        ? "http://localhost:3000" + p.image
        : p.image || "images/placeholder.png";

    tr.innerHTML = `
        <td><img src="${imgSrc}" style="width:50px;height:50px;object-fit:cover;border-radius:6px;"></td>
            <td>${p.id}</td>
            <td>${p.name} <br><small>${p.unit}</small></td>
            <td>${p.category}</td>
            <td>
                <input type="number" id="price-${p.id}" value="${p.price}">
            </td>
            <td>${statusBadge}</td>
            <td>
                <button class="btn btn-update" onclick="updatePrice(${p.id})">Update Price</button>
                <button class="btn btn-stock" onclick="toggleStock(${p.id}, ${inStock})">Toggle Stock</button>
                <button class="btn btn-delete" onclick="deleteProduct(${p.id})">Delete</button>
            </td>
        `;
    tbody.appendChild(tr);
  });
}

async function updatePrice(id) {
  const newPrice = document.getElementById(`price-${id}`).value;

  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ price: parseInt(newPrice) }),
    });

    if (res.ok) {
      alert("Price updated successfully!");
      fetchProducts();
    }
  } catch (e) {
    alert("Error updating price");
  }
}

async function toggleStock(id, currentStatus) {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inStock: !currentStatus }),
    });

    if (res.ok) {
      fetchProducts();
    }
  } catch (e) {
    alert("Error toggling stock");
  }
}

async function deleteProduct(id) {
  if (!confirm("Are you sure you want to delete this product?")) return;

  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      fetchProducts();
    }
  } catch (e) {
    alert("Error deleting product");
  }
}

function toggleAddForm() {
  const form = document.getElementById("addForm");
  form.style.display = form.style.display === "block" ? "none" : "block";
}

async function addProduct() {
  const name = document.getElementById("p-name").value;
  const category = document.getElementById("p-category").value;
  const price = document.getElementById("p-price").value;
  const unit = document.getElementById("p-unit").value;

  if (!name || !price) {
    alert("Name and Price are required!");
    return;
  }

  // Build FormData to support image upload
  const formData = new FormData();
  formData.append("name", name);
  formData.append("category", category);
  formData.append("price", price);
  formData.append("unit", unit);
  formData.append("inStock", true);
  formData.append("rating", 5.0);
  formData.append("reviews", 0);

  const imageInput = document.getElementById("p-image");
  if (imageInput && imageInput.files && imageInput.files[0]) {
    formData.append("image", imageInput.files[0]);
  }

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      alert("Product Added!");
      document.getElementById("p-name").value = "";
      document.getElementById("p-category").value = "";
      document.getElementById("p-price").value = "";
      document.getElementById("p-unit").value = "";
      if (imageInput) imageInput.value = "";
      toggleAddForm();
      fetchProducts();
    }
  } catch (e) {
    alert("Error adding product");
  }
}
