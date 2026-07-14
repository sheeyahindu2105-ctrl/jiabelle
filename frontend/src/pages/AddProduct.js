import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import SellerSidebar from "../components/SellerSidebar";
import "../styles/AddProduct.css";

function AddProduct() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(false);

  const [images, setImages] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    originalPrice: "",
    discount: "",
    price: "",
    stock: "",
    category: "",
  });

  /* ================= INPUT ================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    let updated = {
      ...formData,
      [name]: value,
    };

    if (
      name === "originalPrice" ||
      name === "discount"
    ) {
      const original =
        Number(
          name === "originalPrice"
            ? value
            : updated.originalPrice
        ) || 0;

      const discount =
        Number(
          name === "discount"
            ? value
            : updated.discount
        ) || 0;

      updated.price = Math.round(
        original - (original * discount) / 100
      );
    }

    setFormData(updated);
  };

  /* ================= IMAGE ================= */

  const handleImageChange = (e) => {
    setImages([...e.target.files]);
  };
    /* ================= SUBMIT ================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (images.length === 0) {
      alert("Please select at least one image.");
      return;
    }

    try {
      setLoading(true);

      const data = new FormData();

      data.append("name", formData.name);
      data.append("description", formData.description);
      data.append("originalPrice", formData.originalPrice);
      data.append("discount", formData.discount);
      data.append("price", formData.price);
      data.append("stock", formData.stock);
      data.append("category", formData.category);

      images.forEach((image) => {
        data.append("images", image);
      });

      await axios.post("/products", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Product added successfully!");

      navigate("/seller/products");

    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.message ||
          "Failed to add product."
      );
    } finally {
      setLoading(false);
    }
  };
    return (
    <div className="admin-layout">
      <SellerSidebar />

      <div className="admin">
        <div className="seller-container">

          <h2>Add Product</h2>

          <form
            className="add-product-form"
            onSubmit={handleSubmit}
          >

            <input
              type="text"
              name="name"
              placeholder="Product Name"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <textarea
              name="description"
              placeholder="Description"
              rows="5"
              value={formData.description}
              onChange={handleChange}
              required
            />

            <input
              type="number"
              name="originalPrice"
              placeholder="Original Price"
              value={formData.originalPrice}
              onChange={handleChange}
              required
            />

            <input
              type="number"
              name="discount"
              placeholder="Discount %"
              value={formData.discount}
              onChange={handleChange}
              required
            />

            <input
              type="number"
              name="price"
              placeholder="Selling Price"
              value={formData.price}
              readOnly
            />

            <input
              type="number"
              name="stock"
              placeholder="Stock"
              value={formData.stock}
              onChange={handleChange}
              required
            />

            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Select Category</option>
              <option value="Handbag">Handbag</option>
              <option value="Sling">Sling</option>
              <option value="Tote">Tote</option>
              <option value="Satchel">Satchel</option>
              <option value="Backpack">Backpack</option>
              <option value="Clutch">Clutch</option>
            </select>

            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              required
            />

            <button
              type="submit"
              disabled={loading}
            >
              {loading ? "Uploading..." : "Add Product"}
            </button>

          </form>

        </div>
      </div>
    </div>
  );
}

export default AddProduct;