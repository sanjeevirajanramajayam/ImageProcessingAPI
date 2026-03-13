import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import axios from "axios";

const TransformImage = () => {
  const { id } = useParams();
  const axiosPrivate = useAxiosPrivate();
  const [image, setImage] = useState(null);
  const [transform, setTransform] = useState({
    resize: { width: null, height: null },
    crop: { width: null, height: null, x: null, y: null },
    rotate: null,
    format: "",
    filters: { grayscale: false, sepia: false },
    remove_bg: false,
  });
  const [transformedImage, setTransformedImage] = useState(null);

  const applyTransform = () => {
    const params = new URLSearchParams();

    if (transform.resize.width != null)
      params.append("w", transform.resize.width);
    if (transform.resize.height != null)
      params.append("h", transform.resize.height);

    if (transform.crop.width != null)
      params.append("crop_w", transform.crop.width);
    if (transform.crop.height != null)
      params.append("crop_h", transform.crop.height);
    if (transform.crop.x != null) params.append("crop_x", transform.crop.x);
    if (transform.crop.y != null) params.append("crop_y", transform.crop.y);

    if (transform.rotate != null) params.append("rotate", transform.rotate);
    if (transform.format) params.append("format", transform.format);

    if (transform.filters.grayscale) params.append("gray", true);
    if (transform.filters.sepia) params.append("sepia", true);

    if (transform.removeBackground) params.append("remove_bg", true);

    const url = `http://localhost:4000/image/${id}/transform?${params.toString()}`;

    console.log(url);
    setTransformedImage(url);
  };
  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();
    try {
      const getImage = async () => {
        const res = await axiosPrivate.get(`/image/${id}`, {
          signal: abortController.signal,
        });
        console.log(res.data);
        isMounted && setImage(res?.data?.url);
        isMounted && setTransformedImage(res?.data?.url);
      };
      getImage();
    } catch (err) {
      if (axios.isCancel(err)) {
        return;
      }
      console.error(err);
    }
    return () => {
      abortController.abort();
      isMounted = false;
    };
  }, []);
  return (
    <div className="flex h-full gap-8 p-6">
      {/* Left: Image Preview */}
      <div className="w-1/2 flex flex-col items-center">
        <p className="font-bold mb-3">Original Image</p>

        <img src={image} className="max-w-full border" />

        {transformedImage && (
          <>
            <p className="font-bold mt-6 mb-3">Transformed Image</p>
            <img src={transformedImage} className="max-w-full border" />
          </>
        )}
      </div>

      {/* Right: Transform Options */}
      <div className="w-1/2 flex flex-col gap-4">
        <h2 className="text-xl font-bold">Transformations</h2>

        {/* Resize */}
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Width"
            className="border p-1"
            onChange={(e) =>
              setTransform((prev) => ({
                ...prev,
                resize: { ...prev.resize, width: Number(e.target.value) },
              }))
            }
          />

          <input
            type="number"
            placeholder="Height"
            className="border p-1"
            onChange={(e) =>
              setTransform((prev) => ({
                ...prev,
                resize: { ...prev.resize, height: Number(e.target.value) },
              }))
            }
          />
        </div>

        {/* Rotate */}
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

        {/* Format */}
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

        {/* Filters */}
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

        {/* Remove background */}
        <label>
          <input
            type="checkbox"
            onChange={(e) =>
              setTransform((prev) => ({
                ...prev,
                removeBackground: e.target.checked,
              }))
            }
          />
          Remove Background
        </label>

        <button className="border p-2 mt-4" onClick={applyTransform}>
          Apply Transform
        </button>
      </div>
    </div>
  );
};

export default TransformImage;
