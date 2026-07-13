import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "../styles/intro.css";
import logo from "../assets/jia-belle-logo.png";

function IntroLogo() {
  const [show, setShow] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const introShown = sessionStorage.getItem("introShown");

    // ✅ Show intro only on home page and only once per session
    if (location.pathname === "/home" && !introShown) {
      setShow(true);

      const timer = setTimeout(() => {
        setShow(false);
        sessionStorage.setItem("introShown", "true");
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [location.pathname]); // ✅ better dependency

  // ✅ Don't render anything if not needed
  if (!show) return null;

  return (
    <div className="intro-screen">
      <img src={logo} alt="Jia Belle Logo" />
    </div>
  );
}

export default IntroLogo;