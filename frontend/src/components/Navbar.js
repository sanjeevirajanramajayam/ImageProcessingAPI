import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <div>
      <Link to="/">Home</Link>
      <Link to="/images">Image</Link>
      <Link to="/">Upload Image</Link>

      <p>Log out</p>
    </div>
  );
};

export default Navbar;
