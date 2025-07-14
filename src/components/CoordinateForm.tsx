import React from "react";
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
    reset,
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    try {
      onLoadingChange(true);
      const routeData = await fetchWalkingPath(data.source, data.destination);
      onRouteReceived(routeData.map(coord => ({ lat: coord.lat, lng: coord.lng, score: coord.score })));

      // Show success message
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      successMessage.textContent = 'Route found successfully!';
      document.body.appendChild(successMessage);
      
      setTimeout(() => {
        document.body.removeChild(successMessage);
      }, 3000);
      
    } catch (error) {
      console.error("Failed to fetch route:", error);
      
      // Show error message
      const errorMessage = document.createElement('div');
      errorMessage.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      errorMessage.textContent = 'Failed to fetch route. Please try again.';
      document.body.appendChild(errorMessage);
      
      setTimeout(() => {
        document.body.removeChild(errorMessage);
      }, 3000);
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
        <label htmlFor="source" className="label">
          🚶‍♂️ Starting Point
        </label>
        <input
          id="source"
          {...register("source", { required: "Starting point is required" })}
          className="input-field"
          placeholder="e.g., Boston Common, MA"
        />
        {errors.source && <p className="error-text">{errors.source.message}</p>}
      </div>

      <div>
        <label htmlFor="destination" className="label">
          🎯 Destination
        </label>
        <input
          id="destination"
          {...register("destination", { required: "Destination is required" })}
          className="input-field"
          placeholder="e.g., Harvard University, Cambridge"
        />
        {errors.destination && <p className="error-text">{errors.destination.message}</p>}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary flex-1 flex items-center justify-center space-x-2"
        >
          {isSubmitting ? (
            <>
              <div className="loading-spinner"></div>
              <span>Finding Safe Route...</span>
            </>
          ) : (
            <>
              <span>🛡️</span>
              <span>Find Safe Route</span>
            </>
          )}
        </button>
        
        <button
          type="button"
          onClick={clearForm}
          className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Clear
        </button>
      </div>

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2">💡 Tips for better results:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Include city/state for more accurate results</li>
          <li>• Use specific landmarks or addresses</li>
          <li>• Our algorithm finds the safest walking path</li>
        </ul>
      </div>
    </form>
  );
};

export default CoordinateForm;
