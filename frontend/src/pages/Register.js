import React from "react";

function Register() {
  return (
    <div className="h-screen">
      <div className="flex justify-center items-center h-full">
        <div className="border p-5 w-1/4">
          <div className="text-lg my-1 text-center ">Register User</div>
          <p>Email</p>
          <input
            type="email"
            className="border border-black h-10 w-full p-2 my-2"
          />
          <p>Password</p>
          <input className="border border-black h-10 w-full p-2 my-2" />
          <p>Confirm Password</p>
          <input className="border border-black h-10 w-full p-2 my-2" />
          <button className="bg-black text-white p-2 w-full my-4">
            Register
          </button>
        </div>
      </div>
    </div>
  );
}

export default Register;
