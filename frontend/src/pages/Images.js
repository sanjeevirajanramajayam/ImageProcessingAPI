import { useContext, useEffect, useState } from "react";
import useAxiosPrivate from "./../hooks/useAxiosPrivate";
import axios from "axios";
import { useNavigate } from "react-router";
import loadContext from "../context/LoadingContext";

function Images() {
  const [images, setImages] = useState([]);
  const { loading, setLoading } = useContext(loadContext);
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
        console.log(res.data);
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
    <div className="flex h-full justify-between flex-col">
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {loading ? (
            <p>Loading...</p>
          ) : images.length > 0 ? (
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
      </div>
      <div>1 2 3 4 5</div>
    </div>
  );
}

export default Images;
