const API_URL = "http://localhost:3000/api/products";

document.addEventListener("DOMContentLoaded", () => {
  // Protect this route - only admins can access
  AUTH.protectRoute("admin");
  fetchProducts();
});

async function fetchProducts() {
  try {
    const response = await AUTH.fetch(API_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
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
    const res = await AUTH.fetch(`${API_URL}/${id}`, {
      method: "PUT",
      body: JSON.stringify({ price: parseInt(newPrice) }),
    });

    if (res.ok) {
      alert("Price updated successfully!");
      fetchProducts();
    } else {
      throw new Error("Failed to update price");
    }
  } catch (e) {
    console.error("Error:", e);
    alert("Error updating price: " + e.message);
  }
}

async function toggleStock(id, currentStatus) {
  try {
    const res = await AUTH.fetch(`${API_URL}/${id}`, {
      method: "PUT",
      body: JSON.stringify({ inStock: !currentStatus }),
    });

    if (res.ok) {
      fetchProducts();
    } else {
      throw new Error("Failed to toggle stock");
    }
  } catch (e) {
    console.error("Error:", e);
    alert("Error toggling stock: " + e.message);
  }
}

async function deleteProduct(id) {
  if (!confirm("Are you sure you want to delete this product?")) return;

  try {
    const res = await AUTH.fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      fetchProducts();
    } else {
      throw new Error("Failed to delete product");
    }
  } catch (e) {
    console.error("Error:", e);
    alert("Error deleting product: " + e.message);
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
    const token = AUTH.getToken();
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(API_URL, {
      method: "POST",
      headers: headers,
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
    } else if (res.status === 401 || res.status === 403) {
      throw new Error("Authorization failed. Please login again.");
    } else {
      throw new Error("Failed to add product");
    }
  } catch (e) {
    console.error("Error:", e);
    alert("Error adding product: " + e.message);
  }
}
