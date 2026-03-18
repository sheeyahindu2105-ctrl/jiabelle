import { useEffect, useState } from "react";
import SellerSidebar from "../components/SellerSidebar";
import "../styles/SellerProducts.css";
import "../styles/AddProduct.css";

function SellerProducts(){

const [products,setProducts]=useState([]);

const [search,setSearch]=useState("");
const [categoryFilter,setCategoryFilter]=useState("all");
const [stockFilter,setStockFilter]=useState("all");

const [showForm,setShowForm]=useState(false);
const [editingId,setEditingId]=useState(null);

const [page,setPage]=useState(1);
const productsPerPage=5;

const token=localStorage.getItem("token");

const [name,setName]=useState("");
const [description,setDescription]=useState("");
const [originalPrice,setOriginalPrice]=useState("");
const [discount,setDiscount]=useState("");
const [price,setPrice]=useState("");
const [stock,setStock]=useState("");
const [category,setCategory]=useState("");
const [images,setImages]=useState([]);


/* ===== AUTO CALCULATE SELLING PRICE ===== */

useEffect(()=>{

if(originalPrice && discount >= 0){

const sell =
originalPrice - (originalPrice * discount) / 100;

setPrice(Math.round(sell));

}

},[originalPrice,discount]);


/* ===== FETCH PRODUCTS ===== */

useEffect(()=>{

fetch(
"http://localhost:5000/api/products/my-products",
{
headers:{Authorization:`Bearer ${token}`}
}
)
.then(res=>res.json())
.then(data=>setProducts(Array.isArray(data)?data:[]))
.catch(err=>console.log(err));

},[token]);


/* ===== EDIT PRODUCT ===== */

const handleEdit=(product)=>{

setShowForm(true);

setEditingId(product._id);

setName(product.name);
setDescription(product.description);
setOriginalPrice(product.originalPrice);
setDiscount(product.discount);
setPrice(product.price);
setStock(product.stock);
setCategory(product.category);

};


/* ===== FILTER PRODUCTS ===== */

const filteredProducts = products

.filter(p =>
p.name.toLowerCase().includes(search.toLowerCase())
)

.filter(p => {

if(categoryFilter !== "all" && p.category !== categoryFilter)
return false;

if(stockFilter === "low" && p.stock > 5)
return false;

if(stockFilter === "out" && p.stock > 0)
return false;

return true;

});


/* ===== PAGINATION ===== */

const totalPages=Math.ceil(filteredProducts.length/productsPerPage);

const start=(page-1)*productsPerPage;

const paginatedProducts=filteredProducts.slice(
start,
start+productsPerPage
);


/* ===== DELETE PRODUCT ===== */

const handleDelete = async (id) => {

if(!window.confirm("Delete this product?")) return;

await fetch(
`http://localhost:5000/api/products/${id}`,
{
method:"DELETE",
headers:{Authorization:`Bearer ${token}`}
}
);

setProducts(products.filter(p => p._id !== id));

};


/* ===== ADD / UPDATE PRODUCT ===== */

const handleSubmit = async (e) => {

e.preventDefault();

try{

const formData = new FormData();

formData.append("name",name);
formData.append("description",description);
formData.append("price",price);
formData.append("originalPrice",originalPrice);
formData.append("discount",discount);
formData.append("stock",stock);
formData.append("category",category);

images.forEach(img=>{
formData.append("images",img);
});

const url = editingId
? `http://localhost:5000/api/products/${editingId}`
: "http://localhost:5000/api/products";

const method = editingId ? "PUT" : "POST";

await fetch(url,{
method,
headers:{
Authorization:`Bearer ${token}`
},
body:formData
});

setShowForm(false);
setEditingId(null);

window.location.reload();

}catch(err){

console.log(err);

}

};


/* ===== PAGE UI ===== */

return(

<div className="admin-layout">

<SellerSidebar/>

<div className="admin">

<div className="seller-container">


{/* PAGE HEADER */}

<div className="products-header">

<h2>My Products</h2>

<button
className="add-product-btn"
onClick={()=>setShowForm(!showForm)}
>
{showForm ? "Close Form" : "+ Add Product"}
</button>

</div>


{/* SEARCH + FILTERS */}

<div className="products-topbar">

<input
type="text"
placeholder="Search products..."
value={search}
onChange={(e)=>setSearch(e.target.value)}
className="product-search"
/>

<select
className="product-filter"
value={categoryFilter}
onChange={(e)=>setCategoryFilter(e.target.value)}
>

<option value="all">All Categories</option>
<option value="Handbag">Handbag</option>
<option value="Sling">Sling</option>
<option value="Satchel">Satchel</option>
<option value="Tote">Tote</option>
<option value="Backpack">Backpack</option>
<option value="Clutch">Clutch</option>

</select>

<select
className="product-filter"
value={stockFilter}
onChange={(e)=>setStockFilter(e.target.value)}
>

<option value="all">All Stock</option>
<option value="low">Low Stock</option>
<option value="out">Out of Stock</option>

</select>

</div>


{/* ADD / EDIT FORM */}

{showForm && (

<div className="product-card">

<h3>{editingId ? "Edit Product" : "Add Product"}</h3>

<form className="product-form" onSubmit={handleSubmit}>

<input
value={name}
onChange={(e)=>setName(e.target.value)}
placeholder="Product Name"
required
/>

<textarea
value={description}
onChange={(e)=>setDescription(e.target.value)}
placeholder="Description"
required
/>

<input
type="number"
value={originalPrice}
onChange={(e)=>setOriginalPrice(e.target.value)}
placeholder="Original Price"
/>

<input
type="number"
value={discount}
onChange={(e)=>setDiscount(e.target.value)}
placeholder="Discount %"
/>

<input
type="number"
value={price}
readOnly
placeholder="Selling Price"
/>

<input
type="number"
value={stock}
onChange={(e)=>setStock(e.target.value)}
placeholder="Stock"
/>

<select
value={category}
onChange={(e)=>setCategory(e.target.value)}
>

<option value="">Select Category</option>
<option>Handbag</option>
<option>Sling</option>
<option>Satchel</option>
<option>Tote</option>
<option>Backpack</option>
<option>Clutch</option>

</select>

<input
type="file"
multiple
accept="image/*"
onChange={(e)=>setImages([...e.target.files])}
/>

{images.length > 0 && (

<div className="preview-box">

{Array.from(images).map((img,i)=>(
<img
key={i}
src={URL.createObjectURL(img)}
className="preview-img"
alt=""
/>
))}

</div>

)}

<button className="add-product-btn">
{editingId ? "Update Product" : "Add Product"}
</button>

</form>

</div>

)}


{/* PRODUCT TABLE */}

<table className="product-table">

<thead>

<tr>
<th>Image</th>
<th>Name</th>
<th>Original</th>
<th>Discount</th>
<th>Selling Price</th>
<th>Stock</th>
<th>Category</th>
<th>Actions</th>
</tr>

</thead>

<tbody>

{paginatedProducts.map(p=>{

const img=p.images?.[0];

return(

<tr key={p._id}>

<td>

{img &&(

<img
src={
img.startsWith("http")
?img
:`http://localhost:5000${img}`
}
className="table-img"
alt=""
/>

)}

</td>

<td>{p.name}</td>

<td>₹{p.originalPrice || p.price}</td>

<td>{p.discount || 0}%</td>

<td>₹{p.price}</td>

<td
style={{
color: p.stock === 0
? "red"
: p.stock <= 5
? "orange"
: "green"
}}
>
{p.stock}
</td>

<td>{p.category}</td>

<td>

<button
className="edit-btn"
onClick={()=>handleEdit(p)}
>
Edit
</button>

<button
className="delete-btn"
onClick={()=>handleDelete(p._id)}
>
Delete
</button>

</td>

</tr>

)

})}

</tbody>

</table>


{/* PAGINATION */}

<div className="pagination">

<button
disabled={page===1}
onClick={()=>setPage(page-1)}
>
◀
</button>

<span>
Page {page} of {totalPages || 1}
</span>

<button
disabled={page===totalPages}
onClick={()=>setPage(page+1)}
>
▶
</button>

</div>

</div>

</div>

</div>

);

}

export default SellerProducts;