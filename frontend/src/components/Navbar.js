import React from "react";
import { Link, useNavigate } from "react-router-dom";
import useLogout from "./../hooks/useLogout";
import TransformImage from './../pages/TransformImage';

const Navbar = () => {
  const logout = useLogout();
  const navigate = useNavigate();
  return (
    <nav className="p-4">
      <div className="flex justify-between items-center">
        <div className="text-xl font-bold">ImgTransformer</div>
        <div className="flex gap-6">
          <Link to="/home">Home</Link>
          <Link to="/images">Image</Link>
          {/* <Link to="/image/:id/transform">Transform Image</Link> */}
          <Link to="/upload-image">Upload Image</Link>
          <p
            className="cursor-pointer"
            onClick={async () => {
              await logout();
              navigate("/");
            }}
          >
            Log out
          </p>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
