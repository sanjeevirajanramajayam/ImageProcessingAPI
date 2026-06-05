import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useNavigate } from "react-router-dom";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import axios from "axios";
import Cropper from "react-easy-crop";
import ConfirmDialog from "../components/ConfirmDialog";
import { useToast, ToastContainer } from "../hooks/useToast";

const TransformImage = () => {
  const { id } = useParams();
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const { toasts, showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [transforming, setTransforming] = useState(false);
  const [image, setImage] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 });
  const [aspectRatioLock, setAspectRatioLock] = useState(true);
  const [transform, setTransform] = useState({
    resize: { width: "", height: "" },
    crop: {},
    rotate: null,
    format: "",
    filters: { grayscale: false, sepia: false },
    remove_bg: false,
  });
  const [transformedImage, setTransformedImage] = useState("");
  const [backendURL, setBackendURL] = useState("");
  const [isCropping, setIsCropping] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [wh, setwh] = useState({ width: 120, height: 120 });

  const [zoom, setZoom] = useState(1);

  function onCropComplete(_, croppedAreaPixels) {
    setTransform((t) => ({
      ...t,
      crop: {
        ...t.crop,
        x: Math.round(croppedAreaPixels.x),
        y: Math.round(croppedAreaPixels.y),
        width: Math.round(croppedAreaPixels.width),
        height: Math.round(croppedAreaPixels.height),
      },
    }));
  }

  const handleScale = (factor) => {
    if (originalDimensions.width && originalDimensions.height) {
      setTransform(prev => ({
        ...prev,
        resize: {
          width: Math.round(originalDimensions.width * factor),
          height: Math.round(originalDimensions.height * factor)
        }
      }));
    }
  };

  const applyTransform = async () => {
    if (isCropping && (!wh.width || !wh.height)) {
      showToast("Set crop width and height before applying crop", "error");
      return;
    }

    const params = new URLSearchParams();

    if (transform.resize.width !== "" && transform.resize.width != null && Number(transform.resize.width) > 0) {
      params.append("w", transform.resize.width);
    }
    if (transform.resize.height !== "" && transform.resize.height != null && Number(transform.resize.height) > 0) {
      params.append("h", transform.resize.height);
    }

    if (isCropping || transform.crop.width != null) {
      const cropWidth = transform.crop.width ?? wh.width;
      const cropHeight = transform.crop.height ?? wh.height;
      const cropX = transform.crop.x ?? crop.x ?? 0;
      const cropY = transform.crop.y ?? crop.y ?? 0;

      params.append("crop_w", cropWidth);
      params.append("crop_h", cropHeight);
      params.append("crop_x", Number(cropX));
      params.append("crop_y", Number(cropY));
    }

    if (transform.rotate != null) params.append("rotate", transform.rotate);
    if (transform.format) params.append("format", transform.format);
    if (transform.filters.grayscale) params.append("gray", true);
    if (transform.filters.sepia) params.append("sepia", true);
    if (transform.remove_bg) params.append("remove_bg", true);

    const fullUrl = `http://localhost:4000/image/${id}/transform?${params.toString()}`;
    setBackendURL(fullUrl);
    setTransforming(true);
    showToast("Processing transformation...", "info");
    
    // The endpoint now redirects, so we set the img src directly to the URL
    // We add a timestamp to bypass any browser image cache
    setTransformedImage(`${fullUrl}&t=${Date.now()}`);
  };

  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    const getImage = async () => {
      try {
        const res = await axiosPrivate.get(`/image/${id}`, {
          signal: abortController.signal,
        });
        if (isMounted) {
          setImage(res?.data?.url);
          setTransformedImage(res?.data?.url);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted && !axios.isCancel(err)) {
          console.error("Failed to load image:", err);
          showToast("Failed to load image", "error");
          setLoading(false);
        }
      }
    };

    getImage();

    return () => {
      abortController.abort();
      isMounted = false;
    };
  }, [id, axiosPrivate]);

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      await axiosPrivate.delete(`/image/${id}`);
      showToast("Image deleted successfully", "success");
      setShowDeleteConfirm(false);
      setTimeout(() => navigate("/images"), 1500);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to delete image";
      showToast(errorMsg, "error");
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopy = async () => {
    console.log("copy");
    await navigator.clipboard.writeText(backendURL);
  };

  const handleTransformedLoad = () => {
    setLoading(false);
    setTransforming(false);
    showToast("✨ Transform completed!", "success");
  };

  const handleTransformedError = () => {
    setLoading(false);
    setTransforming(false);
    showToast("⚠️ Failed to load transformed image. Try again.", "error");
  };

  const handleRetryTransform = () => {
    if (backendURL) {
      setTransforming(true);
      showToast("Retrying transformation...", "info");
      setTransformedImage(`${backendURL}&t=${Date.now()}`);
    }
  };

  // Safety timeout: if image is still transforming after 10s, force reset state
  useEffect(() => {
    if (!transforming) return;

    const timeoutId = setTimeout(() => {
      console.warn("Transform timeout: Image took too long to load");
      setTransforming(false);
      showToast("⏱️ Transformation took too long. Please try simpler transforms.", "error");
    }, 10000);

    return () => clearTimeout(timeoutId);
  }, [transforming, showToast]);

  return (
    <div className="flex h-full gap-8 p-6">
      <div className="w-1/2 flex flex-col items-center ">
        <p className="font-bold mb-3 text-lg">Original Image</p>
        {isCropping ? (
          <div className="relative w-full h-75">
            <Cropper
              image={image}
              crop={crop}
              zoom={zoom}
              cropSize={{
                width: wh.width,
                height: wh.height,
              }}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
          </div>
        ) : (
          <img
            src={image === "" ? null : image}
            onLoad={(e) => {
                setOriginalDimensions({
                  width: e.target.naturalWidth,
                  height: e.target.naturalHeight
                });
            }}
            className="max-w-full border border-blue-300 rounded shadow-md"
          />
        )}

        {isCropping ? (
          <input
            type="range"
            min={60}
            max={400}
            step={10}
            value={wh.width}
            onChange={(e) =>
              setwh((current) => ({ ...current, width: Number(e.target.value) }))
            }
          />
        ) : (
          <></>
        )}

        <p className="font-bold mt-8 mb-3 text-lg">Transformed Result</p>
        <div className="relative w-full min-h-[300px] flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded bg-gray-50 overflow-hidden">
          {transforming && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white bg-opacity-80 gap-3">
              <div className="loader"></div>
              <p className="text-sm font-semibold text-blue-600 animate-pulse">Processing transformation...</p>
            </div>
          )}
          
          {transformedImage ? (
            <div className="flex flex-col items-center">
              <img
                src={transformedImage}
                onLoad={handleTransformedLoad}
                onError={handleTransformedError}
                alt="Transformed"
                className={`max-w-full max-h-[500px] object-contain shadow-md transition-opacity duration-300 ${transforming ? 'opacity-0' : 'opacity-100'}`}
              />
              {!transforming && transformedImage && backendURL && (
                <button
                  onClick={handleRetryTransform}
                  className="mt-3 text-sm border-2 border-yellow-500 text-yellow-600 px-3 py-1 rounded hover:bg-yellow-50 transition font-medium"
                >
                  ↻ Retry Transform
                </button>
              )}
            </div>
          ) : (
            <p className="text-gray-400">Apply transformations to see the result</p>
          )}
        </div>
      </div>

      <div className="w-1/2 flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-gray-800">✨ Apply Transformations</h2>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-sm font-medium text-gray-700">Width</label>
            <input
              type="number"
              placeholder={originalDimensions.width || "Width"}
              value={transform.resize.width ?? ""}
              className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              onChange={(e) => {
                const rawValue = e.target.value;
                const newWidth = rawValue === "" ? "" : Number(rawValue);
                setTransform((prev) => {
                  const newHeight = aspectRatioLock && rawValue !== "" && originalDimensions.width
                    ? Math.round((newWidth * originalDimensions.height) / originalDimensions.width)
                    : prev.resize.height;
                  return {
                    ...prev,
                    resize: { width: newWidth, height: newHeight },
                  };
                });
              }}
            />
          </div>

          <div className="flex-1">
            <label className="text-sm font-medium text-gray-700">Height</label>
            <input
              type="number"
              placeholder={originalDimensions.height || "Height"}
              value={transform.resize.height ?? ""}
              className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              onChange={(e) => {
                const rawValue = e.target.value;
                const newHeight = rawValue === "" ? "" : Number(rawValue);
                setTransform((prev) => {
                  const newWidth = aspectRatioLock && rawValue !== "" && originalDimensions.height
                    ? Math.round((newHeight * originalDimensions.width) / originalDimensions.height)
                    : prev.resize.width;
                  return {
                    ...prev,
                    resize: { width: newWidth, height: newHeight },
                  };
                });
              }}
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setAspectRatioLock(!aspectRatioLock)}
              className={`px-3 py-2 rounded border-2 transition font-medium ${
                aspectRatioLock
                  ? "border-blue-500 bg-blue-50 text-blue-600"
                  : "border-gray-300 bg-gray-50 text-gray-600 hover:border-gray-400"
              }`}
              title="Lock aspect ratio"
            >
              {aspectRatioLock ? "🔒" : "🔓"}
            </button>
          </div>
        </div>

        <div className="flex gap-2 mb-2">
            <button 
                onClick={() => handleScale(0.5)}
                className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded text-sm font-medium"
            >0.5x</button>
            <button 
                onClick={() => handleScale(1)}
                className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded text-sm font-medium"
            >1x</button>
            <button 
                onClick={() => handleScale(2)}
                className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded text-sm font-medium"
            >2x</button>
            <button 
                onClick={() => handleScale(3)}
                className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded text-sm font-medium"
            >3x</button>
        </div>

        <div className="flex gap-2 flex-wrap">
          <input
            type="number"
            placeholder="Crop Height"
            value={wh.height}
            className="border p-1"
            onChange={(e) => {
              const nextHeight = Number(e.target.value);
              setwh({ ...wh, height: nextHeight });
              setTransform((prev) => ({
                ...prev,
                crop: { ...prev.crop, height: nextHeight },
              }));
            }}
          />

          <input
            type="number"
            placeholder="Crop Width"
            className="border p-1"
            value={wh.width}
            onChange={(e) => {
              const nextWidth = Number(e.target.value);
              setwh({ ...wh, width: nextWidth });
              setTransform((prev) => ({
                ...prev,
                crop: { ...prev.crop, width: nextWidth },
              }));
            }}
          />

          <input
            type="number"
            placeholder="Crop X"
            className="border p-1"
            value={crop.x}
            onChange={(e) =>
              setCrop((current) => ({
                ...current,
                x: Number(e.target.value),
              }))
            }
          />

          <input
            type="number"
            placeholder="Crop Y"
            className="border p-1"
            value={crop.y}
            onChange={(e) =>
              setCrop((current) => ({
                ...current,
                y: Number(e.target.value),
              }))
            }
          />

          <button
            onClick={() => {
              setIsCropping(!isCropping);
              setwh({ width: 120, height: 120 });
              setTransform((prev) => ({
                ...prev,
                crop: { ...prev.crop, width: 120, height: 120 },
              }));
            }}
          >
            {isCropping ? "Stop Crop" : "Start Crop"}
          </button>
          <button
            onClick={() => {
              setIsCropping(false);
              setwh({ width: 120, height: 120 });
              setCrop({ x: 0, y: 0 });
              setTransform((prev) => ({
                ...prev,
                crop: {},
              }));
            }}
          >
            {"Clear Crop"}
          </button>
        </div>

        <input
          type="number"
          placeholder="Rotate degrees"
          className="border p-1"
          onChange={(e) =>
            setTransform((prev) => ({
              ...prev,
              rotate: Number(e.target.value),
            }))
          }
        />

        <select
          className="border p-1"
          onChange={(e) =>
            setTransform((prev) => ({
              ...prev,
              format: e.target.value,
            }))
          }
        >
          <option value="">Format</option>
          <option value="png">PNG</option>
          <option value="jpeg">JPEG</option>
          <option value="webp">WEBP</option>
        </select>

        <label>
          <input
            type="checkbox"
            onChange={(e) =>
              setTransform((prev) => ({
                ...prev,
                filters: { ...prev.filters, grayscale: e.target.checked },
              }))
            }
          />
          Grayscale
        </label>

        <label>
          <input
            type="checkbox"
            onChange={(e) =>
              setTransform((prev) => ({
                ...prev,
                filters: { ...prev.filters, sepia: e.target.checked },
              }))
            }
          />
          Sepia
        </label>

        <label>
          <input
            type="checkbox"
            onChange={(e) =>
              setTransform((prev) => ({
                ...prev,
                remove_bg: e.target.checked,
              }))
            }
          />
          Remove Background
        </label>

        <button
          onClick={applyTransform}
          disabled={transforming}
          className="bg-blue-600 text-white p-2 mt-4 rounded font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition shadow-md"
        >
          {transforming ? "⏳ Applying..." : "✨ Apply Transform"}
        </button>

        <div className="flex gap-2">
          <input
            className="flex-1 outline-none border border-gray-300 p-2 rounded disabled:bg-gray-100 disabled:text-gray-500 text-sm font-mono bg-gray-50 transition"
            value={backendURL}
            readOnly
            disabled={backendURL === ""}
            placeholder="Transform URL will appear here"
          />
          <button
            onClick={handleCopy}
            disabled={!backendURL}
            className="border border-gray-300 bg-white hover:bg-gray-50 p-2 rounded disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
          >
            📋 Copy
          </button>
        </div>
        <button
          onClick={handleDeleteClick}
          disabled={isDeleting}
          className="border-2 border-red-500 text-red-600 p-2 mt-4 rounded hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
        >
          {isDeleting ? "🗑️ Deleting..." : "🗑️ Delete Image"}
        </button>
      </div>
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Image"
        message="Are you sure you want to delete this image? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        isDangerous
      />
      <ToastContainer toasts={toasts} />
    </div>
  );
};

export default TransformImage;
