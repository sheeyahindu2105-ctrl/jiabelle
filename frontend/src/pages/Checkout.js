import "../styles/checkout.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../utils/axios";

export default function Checkout() {

  const navigate = useNavigate();
  const [items, setItems] = useState([]);

  const [step, setStep] = useState(1);
  const [payment, setPayment] = useState("COD");

  const paymentNames = {
    COD: "Cash on Delivery",
    UPI: "UPI / Google Pay",
    CARD: "Debit / Credit Card"
  };

  const [address, setAddress] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
  });

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("checkoutItems")) || [];
    setItems(saved);
  }, []);

  const getImg = (item) => {
    let img =
      item?.image ||
      item?.images?.[0] ||
      item?.product?.image ||
      item?.product?.images?.[0];

    if (!img) return "/no-image.png";
    if (img.startsWith("http")) return img;
return `${process.env.REACT_APP_API_URL}${img}`;  };

  const subtotal = items.reduce(
    (a, i) => a + (Number(i.price) || 0) * (Number(i.quantity) || 1),
    0
  );

  const shipping = subtotal > 2000 ? 0 : subtotal === 0 ? 0 : 99;
  const total = subtotal + shipping;

  const next = () => {
    if (step === 1 && Object.values(address).some(v => !v.trim()))
      return alert("Please fill all fields");
    setStep(step + 1);
  };

  const back = () => setStep(step - 1);

  /* ================= ORDER ================= */

  const placeOrder = async () => {
    try {

      const token = localStorage.getItem("token");

      const payload = {
        products: items.map(i => ({
          product: i._id,
          qty: i.quantity || 1,
          price: i.price
        })),
        shippingAddress: address,
        paymentMethod: payment,
        totalAmount: total
      };

      // ✅ FIXED HERE
      await axios.post("/orders", payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      localStorage.removeItem("checkoutItems");

      alert("Order placed successfully 🎉");
      navigate("/order-success");

    } catch (err) {
      console.log(err);
      alert("Order failed");
    }
  };

  /* ================= RAZORPAY ================= */

  const razorpayPayment = async () => {

    try {

      // ✅ FIXED HERE
      const { data } = await axios.post("/payment/create-order", {
        amount: total
      });

      const options = {

        key: "rzp_test_SPZno8dC82D7gw",
        amount: data.amount,
        currency: "INR",
        name: "JIA BELLE",
        description: "Order Payment",
        order_id: data.id,

        handler: async function (response) {

          // ✅ FIXED HERE
          await axios.post("/payment/verify-payment", {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          });

          placeOrder();

        },

        theme: {
          color: "#000"
        }

      };

      if (!window.Razorpay) {
        alert("Razorpay SDK not loaded");
        return;
      }

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      console.log(err);
      alert("Payment failed");
    }

  };

  if (!items.length)
    return <div className="empty">No items selected for checkout 🛍</div>;

  return (
    <div className="checkout-page">

      <div className="steps">
        <div className={`step ${step>=1?"active":""}`}>1. Address</div>
        <div className={`step ${step>=2?"active":""}`}>2. Payment</div>
        <div className={`step ${step>=3?"active":""}`}>3. Review</div>
      </div>

      <div className="checkout-grid">

        <div className="card">

          {step===1 && (
            <>
              <h2>Delivery Address</h2>

              <div className="address-grid">
                {Object.keys(address).map(key => (
                  <input
                    key={key}
                    placeholder={key}
                    value={address[key]}
                    onChange={e =>
                      setAddress({...address,[key]:e.target.value})
                    }
                  />
                ))}
              </div>

              <button className="next-btn" onClick={next}>
                Continue →
              </button>
            </>
          )}

          {step===2 && (
            <>
              <h2>Select Payment</h2>

              {Object.entries(paymentNames).map(([id,name])=>(
                <label key={id}
                  className={`pay-card ${payment===id?"active":""}`}
                >
                  <input
                    type="radio"
                    checked={payment===id}
                    onChange={()=>setPayment(id)}
                  />
                  {name}
                </label>
              ))}

              <div className="btn-row">
                <button className="back-btn" onClick={back}>Back</button>
                <button className="next-btn" onClick={next}>Continue</button>
              </div>
            </>
          )}

          {step===3 && (
            <>
              <h2>Review Order</h2>

              <div className="review-box">
                <b>Address</b>
                <p>
                  {address.name}, {address.address},
                  {address.city} - {address.pincode}
                </p>
              </div>

              <div className="review-box">
                <b>Payment</b>
                <span className="payment-badge">
                  {paymentNames[payment]}
                </span>
              </div>

              <div className="review-box">
                <b>Products</b>

                {items.map(i=>(
                  <div key={i._id} className="review-item">
                    <img src={getImg(i)} alt="" />
                    <div>
                      <b>{i.name}</b>
                      <p>Qty: {i.quantity || 1}</p>
                      <p>₹{i.price * (i.quantity || 1)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="btn-row">
                <button className="back-btn" onClick={back}>Back</button>

                <button
                  className="next-btn"
                  onClick={() => {
                    if (payment === "COD") {
                      placeOrder();
                    } else {
                      razorpayPayment();
                    }
                  }}
                >
                  Pay ₹{total}
                </button>

              </div>
            </>
          )}

        </div>

        <div className="summary">
          <h3>Order Summary</h3>

          {items.map(item=>(
            <div key={item._id} className="summary-item">
              <img src={getImg(item)} alt="" />
              <div className="summary-info">
                <b>{item.name}</b>
                <p>Qty: {item.quantity || 1}</p>
              </div>
              <div className="summary-price">
                ₹{item.price * (item.quantity || 1)}
              </div>
            </div>
          ))}

          <hr/>

          <div className="line">
            <span>Subtotal</span>
            <span>₹{subtotal}</span>
          </div>

          <div className="line">
            <span>Shipping</span>
            <span>{shipping===0?"FREE":`₹${shipping}`}</span>
          </div>

          <div className="line total-line">
            <span>Total</span>
            <span>₹{total}</span>
          </div>

          <p className="secure">🔒 Secure Checkout</p>
        </div>

      </div>
    </div>
  );
}