import { useContext, useEffect, useState } from "react";
import useAxiosPrivate from "./../hooks/useAxiosPrivate";
import axios from "axios";
import { useNavigate } from "react-router";
import loadContext from "../context/LoadingContext";
import ConfirmDialog from "../components/ConfirmDialog";
import { useToast, ToastContainer } from "../hooks/useToast";

function Images() {
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    totalImages: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const { loading, setLoading } = useContext(loadContext);
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const { toasts, showToast } = useToast();

  useEffect(() => {
    const abortController = new AbortController();
    let isMounted = true;

    async function getUserImages() {
      try {
        const res = await axiosPrivate.get(
          "http://localhost:4000/image/get-user-images",
          {
            params: {
              page: pagination.page,
              limit: pagination.limit,
            },
            signal: abortController.signal,
          },
        );
        console.log(res.data);
        isMounted && setImages(res.data.userImages);
        isMounted &&
          setPagination((prev) => ({ ...prev, ...res.data.pagination }));
      } catch (err) {
        if (axios.isCancel(err)) {
          return;
        }
        console.error(err);
      }
    }

    getUserImages();

    return () => {
      abortController.abort();
      isMounted = false;
    };
  }, [pagination.page, pagination.limit]);

  const goToPage = (nextPage) => {
    setPagination((prev) => ({
      ...prev,
      page: nextPage,
    }));
  };

  const handleDeleteClick = (image) => {
    setSelectedImage(image);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedImage) return;

    try {
      setLoading(true);
      await axiosPrivate.delete(`/image/${selectedImage.id}`);
      showToast("Image deleted successfully", "success");
      setImages(
        images.filter((img) => img.image_id !== selectedImage.image_id),
      );
      setShowDeleteConfirm(false);
      setSelectedImage(null);
      setPagination((prev) => ({ ...prev, page: 1 }));
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to delete image";
      showToast(errorMsg, "error");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full justify-between flex-col">
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {loading ? (
            <p className="text-sm text-gray-600">Loading images...</p>
          ) : images.length > 0 ? (
            images.map((image, index) => (
              <div
                key={image.id ?? index}
                className="relative overflow-hidden rounded border bg-white"
              >
                <img
                  src={image.url}
                  alt={`User upload ${index + 1}`}
                  loading="lazy"
                  decoding="async"
                  className="w-full aspect-square object-cover cursor-pointer hover:opacity-80 transition"
                  onClick={() => {
                    navigate(`/image/${image.id}/transform`);
                  }}
                />
                <button
                  onClick={() => handleDeleteClick(image)}
                  className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700 transition"
                >
                  Delete
                </button>
              </div>
            ))
          ) : (
            <p>No images found.</p>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between gap-4 border-t p-4">
        <p className="text-sm">
          Page {pagination.page} of {pagination.totalPages} ·{" "}
          {pagination.totalImages} images
        </p>
        <div className="flex gap-2">
          <button
            className="border px-3 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => goToPage(pagination.page - 1)}
            disabled={!pagination.hasPreviousPage || loading}
          >
            Previous
          </button>
          <button
            className="border px-3 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => goToPage(pagination.page + 1)}
            disabled={!pagination.hasNextPage || loading}
          >
            Next
          </button>
        </div>
      </div>
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Image"
        message={`Are you sure you want to delete this image? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setSelectedImage(null);
        }}
        isDangerous
      />
      <ToastContainer toasts={toasts} />
    </div>
  );
}

export default Images;
