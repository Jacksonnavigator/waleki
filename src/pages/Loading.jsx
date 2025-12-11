import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import loadingAnimation from "../assets/loading.json"; // your Lottie JSON

const Loading = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/login"); // go to login after animation
    }, 2000); // adjust duration to match Lottie

    return () => clearTimeout(timer);
  }, [navigate]);

  const styles = {
    container: {
      width: "100vw",
      height: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#fff",
    },
    lottie: {
      width: 250,
      height: 250,
    },
  };

  return (
    <div style={styles.container}>
      <Lottie animationData={loadingAnimation} loop={true} style={styles.lottie} />
    </div>
  );
};

export default Loading;
