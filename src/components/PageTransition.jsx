// components/PageTransition.jsx
import React from "react";
import { motion } from "framer-motion";

const panelTransition = {
  duration: 0.8,
  ease: [0.77, 0, 0.18, 1],
};

const PageTransition = ({ children }) => {
  return (
    <div style={{ position: "relative", width: "100%", minHeight: "100vh" }}>
      {/* Transition Overlay */}
      <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
        {/* Top Panel */}
        <motion.div
          className="absolute top-0 left-0 w-full h-1/2 bg-[#00cf45bc]"
          initial={{ y: 0 }}          // start closed (covering)
          animate={{ y: "-100%" }}    // move up (open)
          exit={{ y: 0 }}             // move back down (close)
          transition={panelTransition}
        />
        {/* Bottom Panel */}
        <motion.div
          className="absolute bottom-0 left-0 w-full h-1/2 bg-[#00cf45bc]"
          initial={{ y: 0 }}          // start closed
          animate={{ y: "100%" }}     // move down (open)
          exit={{ y: 0 }}             // move back up (close)
          transition={panelTransition}
        />
      </div>

      {/* Page Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.6, duration: 0.4 } }}
        exit={{ opacity: 0 }}
        style={{ position: "relative", zIndex: 0 }}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default PageTransition;
