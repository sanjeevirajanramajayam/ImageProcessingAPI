import React, { useContext, useEffect, useState } from "react";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import axios from "axios";
import { useNavigate } from "react-router";
import loadContext from "../context/LoadingContext";
import { useToast, ToastContainer } from "../hooks/useToast";

const HomePage = () => {
  const [images, setImages] = useState([]);
  const [stats, setStats] = useState({ totalImages: 0 });
  const { loading, setLoading } = useContext(loadContext);
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const { toasts, showToast } = useToast();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await axiosPrivate.get(
          "http://localhost:4000/image/get-user-images",
          {
            params: {
              page: 1,
              limit: 6,
            },
          },
        );

        const { userImages, pagination } = res.data;
        setStats({ totalImages: pagination.totalImages });
        setImages(userImages);
        setLoading(false);
      } catch (err) {
        const errorMsg = err.response?.data?.message || "Failed to load dashboard";
        showToast(errorMsg, "error");
        console.error("Dashboard error:", err);
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  return (
    <div className="flex h-full justify-between flex-col">
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-1">Welcome Back</h1>
          <p className="text-gray-600 text-sm mb-6">
            {stats.totalImages} image{stats.totalImages !== 1 ? "s" : ""} in your library
          </p>

          <h2 className="text-lg font-semibold mb-4">Recent Images</h2>
          {loading ? (
            <p className="text-sm">Loading...</p>
          ) : images.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {images.map((image, index) => (
                <img
                  key={image.id ?? index}
                  src={image.url}
                  alt={`Recent upload ${index + 1}`}
                  className="w-full h-48 object-cover rounded border cursor-pointer hover:opacity-80 transition"
                  onClick={() => {
                    navigate(`/image/${image.id}/transform`);
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="border rounded p-8 text-center mb-6">
              <p className="text-sm text-gray-600">No images yet</p>
            </div>
          )}
        </div>
      </div>

      <div className="border-t p-4 flex gap-3">
        <button
          onClick={() => navigate("/upload-image")}
          className="flex-1 border px-4 py-2 rounded text-sm font-medium hover:bg-gray-100 transition"
        >
          Upload Image
        </button>
        <button
          onClick={() => navigate("/images")}
          className="flex-1 border px-4 py-2 rounded text-sm font-medium hover:bg-gray-100 transition"
        >
          Browse All
        </button>
      </div>
      <ToastContainer toasts={toasts} />
    </div>
  );
};

export default HomePage;
