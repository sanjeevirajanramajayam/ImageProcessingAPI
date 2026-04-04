import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import axios from "axios";
import Cropper from "react-easy-crop";
import loadContext from "../context/LoadingContext";

const TransformImage = () => {
  const { id } = useParams();
  const axiosPrivate = useAxiosPrivate();
  const [loading, setLoading] = useState(true);
  const [image, setImage] = useState("");
  const [transform, setTransform] = useState({
    resize: { width: null, height: null },
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
  const [wh, setwh] = useState({ width: null, height: null, x: "", y: "" });

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
    if (transform.crop.x != null)
      params.append("crop_x", Number(transform.crop.x));
    if (transform.crop.y != null)
      params.append("crop_y", Number(transform.crop.y));

    if (transform.rotate != null) params.append("rotate", transform.rotate);
    if (transform.format) params.append("format", transform.format);

    if (transform.filters.grayscale) params.append("gray", true);
    if (transform.filters.sepia) params.append("sepia", true);

    if (transform.removeBackground) params.append("remove_bg", true);

    const url = `http://localhost:4000/image/${id}/transform?${params.toString()}`;

    console.log(url);
    setTransformedImage(url);
    setBackendURL(url);
    setLoading(true);
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

  const handleCopy = async () => {
    console.log("copy");
    await navigator.clipboard.writeText(backendURL);
  };

  return (
    <div className="flex h-full gap-8 p-6">
      <div className="w-1/2 flex flex-col items-center ">
        <p className="font-bold mb-3">Original Image</p>
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
              // onCropSizeChange={(size) => {
              //   setTransform((t) => ({
              //     ...t,
              //     crop: {
              //       ...t.crop,
              //       width: Math.round(size.width),
              //       height: Math.round(size.height),
              //     },
              //   }));
              // }}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
          </div>
        ) : (
          <img
            src={image === "" ? null : image}
            className="max-w-full border"
          />
        )}

        {isCropping ? (
          <input
            type="range"
            min={1}
            max={90}
            step={10}
            value={wh.width == null ? "" : wh.width}
            onChange={(e) =>
              setwh((wh) => ({ ...wh, width: Number(e.target.value) }))
            }
          />
        ) : (
          <></>
        )}

        {/* <img src={image === "" ? null : image} className="max-w-full border" /> */}
        <p className="font-bold mt-6 mb-3">Transformed Image</p>

        {loading ? <div className="loader"></div> : null}
        {transformedImage && (
          <>
            <img
              src={transformedImage === "" ? null : transformedImage}
              onLoad={() => {
                setLoading(false);
              }}
              className={`max-w-full border`}
            />
          </>
        )}
      </div>

      <div className="w-1/2 flex flex-col gap-4">
        <h2 className="text-xl font-bold">Apply Transformations</h2>

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

        <div className="flex gap-2 flex-wrap">
          <input
            type="number"
            placeholder="Crop Height"
            value={wh.height == null ? "" : wh.height}
            className="border p-1"
            onChange={(e) => {
              // setTransform((t) => ({
              //   ...t,
              //   crop: { ...t.crop, height: Number(e.target.value) },
              // }));
              setwh({ ...wh, height: Number(e.target.value) });
            }}
          />

          <input
            type="number"
            placeholder="Crop Width"
            className="border p-1"
            value={wh.width == null ? "" : wh.width}
            onChange={(e) => {
              // setTransform((t) => ({
              //   ...t,
              //   crop: { ...t.crop, width: Number(e.target.value) },
              // }));
              setwh({ ...wh, width: Number(e.target.value) });
            }}
          />

          <input
            type="number"
            placeholder="Crop X"
            className="border p-1"
            value={parseInt(crop.x)}
            onChange={(e) =>
              setCrop((crop) => ({ ...crop, x: Number(e.target.value) }))
            }
          />

          <input
            type="number"
            placeholder="Crop Y"
            className="border p-1"
            value={parseInt(crop.y)}
            onChange={(e) =>
              setCrop((crop) => ({ ...crop, y: Number(e.target.value) }))
            }
          />

          <button
            onClick={() => {
              setIsCropping(!isCropping);
              setwh({ width: 100, height: 100, x: 0, y: 0 });
            }}
          >
            {isCropping ? "Stop Crop" : "Start Crop"}
          </button>
          <button
            onClick={() => {
              setIsCropping(false);
              setwh({ width: null, height: null, x: null, y: null });
              setCrop({ x: 0, y: 0 });
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
                removeBackground: e.target.checked,
              }))
            }
          />
          Remove Background
        </label>

        <button className="border p-2 mt-4" onClick={applyTransform}>
          Apply Transform
        </button>

        <div className="max-w flex gap-4">
          <input
            className="flex-1 outline-none border p-2 disabled:bg-gray-200 disabled:border-gray-500  "
            value={backendURL}
            readOnly
            disabled={backendURL === ""}
          />
          <button onClick={handleCopy} className="border p-2">
            Copy
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransformImage;
