import React, { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { fetchWalkingPath } from "../api";

type Props = {
  onRouteReceived: (route: { lat: number; lng: number; score?: number }[]) => void;
  onLoadingChange: (loading: boolean) => void;
};

type FormData = {
  source: string;
  destination: string;
};

const CoordinateForm: React.FC<Props> = ({ onRouteReceived, onLoadingChange }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    reset,
  } = useForm<FormData>();

  const sourceRef = useRef<HTMLInputElement | null>(null);
  const destRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!window.google || !sourceRef.current || !destRef.current) return;

    const sourceAuto = new google.maps.places.Autocomplete(sourceRef.current, {
      types: ["geocode"],
    });
    const destAuto = new google.maps.places.Autocomplete(destRef.current, {
      types: ["geocode"],
    });

    sourceAuto.addListener("place_changed", () => {
      const place = sourceAuto.getPlace();
      if (place.formatted_address) {
        setValue("source", place.formatted_address);
      }
    });

    destAuto.addListener("place_changed", () => {
      const place = destAuto.getPlace();
      if (place.formatted_address) {
        setValue("destination", place.formatted_address);
      }
    });
  }, []);

  const onSubmit = async (data: FormData) => {
    try {
      onLoadingChange(true);
      const routeData = await fetchWalkingPath(data.source, data.destination);
      onRouteReceived(routeData.map(coord => ({ lat: coord.lat, lng: coord.lng, score: coord.score })));

      // Toast success
      const toast = document.createElement("div");
      toast.className = "fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50";
      toast.textContent = "Route found successfully!";
      document.body.appendChild(toast);
      setTimeout(() => document.body.removeChild(toast), 3000);

    } catch (err) {
      console.error(err);
      const toast = document.createElement("div");
      toast.className = "fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50";
      toast.textContent = "Failed to fetch route. Try again.";
      document.body.appendChild(toast);
      setTimeout(() => document.body.removeChild(toast), 3000);
    } finally {
      onLoadingChange(false);
    }
  };

  const clearForm = () => {
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="source" className="label">🚶‍♂️ Starting Point</label>
        <input
          id="source"
          {...register("source", { required: "Starting point is required" })}
          ref={(e) => {
            register("source").ref(e);
            sourceRef.current = e;
          }}
          className="input-field"
          placeholder="e.g., Boston Common, MA"
        />
        {errors.source && <p className="error-text">{errors.source.message}</p>}
      </div>

      <div>
        <label htmlFor="destination" className="label">🎯 Destination</label>
        <input
          id="destination"
          {...register("destination", { required: "Destination is required" })}
          ref={(e) => {
            register("destination").ref(e);
            destRef.current = e;
          }}
          className="input-field"
          placeholder="e.g., Harvard University, Cambridge"
        />
        {errors.destination && <p className="error-text">{errors.destination.message}</p>}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
          {isSubmitting ? "Finding Safe Route..." : "🛡️ Find Safe Route"}
        </button>
        <button type="button" onClick={clearForm} className="btn-secondary">
          Clear
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2">💡 Tips for better results:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Include city/state for better accuracy</li>
          <li>• Use specific addresses or landmarks</li>
        </ul>
      </div>
    </form>
  );
};

export default CoordinateForm;
