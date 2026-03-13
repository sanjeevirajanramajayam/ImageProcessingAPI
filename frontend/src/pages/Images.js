import { useEffect, useState } from "react";
import useAxiosPrivate from "./../hooks/useAxiosPrivate";
import axios from "axios";
import { useNavigate } from "react-router";

function Images() {
  const [images, setImages] = useState([]);
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  useEffect(() => {
    const abortController = new AbortController();
    let isMounted = true;

    async function getUserImages() {
      try {
        const res = await axiosPrivate.get(
          "http://localhost:4000/image/get-user-images",
          { signal: abortController.signal },
        );
        isMounted && setImages(res.data.userImages);
      } catch (err) {
        if (axios.isCancel(err)) {
          return;
        }
        console.error(err);
      }
    }

    getUserImages();

    return () => {
      // Clean up function which is called when the component unmounts,
      // cancels any network request that occurs when request changes
      abortController.abort();
      isMounted = false;
    };
  }, []);

  return (
    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {images.length > 0 ? (
        images.map((image, index) => (
          <img
            key={image.id ?? index}
            src={image.url}
            alt={`User upload ${index + 1}`}
            className="w-full h-48 object-cover rounded border"
            onClick={() => {
              navigate(`/image/${image.id}/transform`);
            }}
          />
        ))
      ) : (
        <p>No images found.</p>
      )}
    </div>
  );
}

export default Images;
