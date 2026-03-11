import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="p-4">
      <div className="flex justify-between items-center">
        <div className="text-xl font-bold">ImgTransformer</div>
        <div className="flex gap-6">
          <Link to="/">Home</Link>
          <Link to="/images">Image</Link>
          <Link to="/upload-image">Upload Image</Link>
          <Link to="/">Log out</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
