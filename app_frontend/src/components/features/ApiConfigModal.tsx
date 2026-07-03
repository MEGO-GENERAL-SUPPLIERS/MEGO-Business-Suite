'use client';

import { useState, useEffect, useCallback } from 'react';
import { getApiConfig, updateApiConfig, type IApiConfig } from '../../utils/localStorageUtils';
import { 
  toastSuccess, 
  toastInfo,
  toastDanger,
  dismissToast, 
} from '../../lib/toast';
import { XCircleIcon } from 'lucide-react';
import { BsExclamationCircle } from 'react-icons/bs';
import ApiClient from '../../services/apiClient';

export interface IApiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiConfigModal = ({ isOpen, onClose }: IApiConfigModalProps) => {
  const currentLocalConfigs = getApiConfig();
  const [formData, setFormData] = useState<IApiConfig>({
    protocol: currentLocalConfigs.protocol || 'http',
    host: currentLocalConfigs.host || 'localhost',
    port: currentLocalConfigs.port || "3005",
    baseUrl: currentLocalConfigs.baseUrl || "/api/v1",
    timeout: currentLocalConfigs.timeout || 15000,
    withCredentials: currentLocalConfigs.withCredentials || false
  });

  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Init form with current configs
  useEffect(() => {
    if (isOpen) {
      const currentConfig = getApiConfig();
      setFormData({
        protocol: currentConfig.protocol,
        host: currentConfig.host,
        port: currentConfig.port,
        baseUrl: currentConfig.baseUrl,
        timeout: currentConfig.timeout,
        withCredentials: currentConfig.withCredentials
      });
      setFormError(null);
    }
  }, [isOpen]);

  // Close modal handle
  const handleClose = useCallback(() => {
    setFormError(null);
    onClose();
  }, [onClose]);

  // Test API health WITHOUT showing toasts internally
  const testApiHealth = async (): Promise<{ success: boolean; message?: string }> => {
    try {
      const apiClient = ApiClient();
      const response = await apiClient.get<any>('/health-check');
      
      if (response.success) {
        return { success: true };
      } else {
        return { 
          success: false, 
          message: (Array.isArray(response.message) ? response.message.join(', ') : response.message) || 'API is unreachable' 
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error';
      return { 
        success: false, 
        message: errorMessage 
      };
    }
  };

  // Handle submit with precise closing logic
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    setFormError(null);
    setIsLoading(true);

    // Validation (unchanged)
    if (!formData.host.trim()) {
      setFormError('Host is required');
      setIsLoading(false);
      return;
    }

    if (!/^\d{1,5}$/.test(formData.port) || parseInt(formData.port) > 65535) {
      setFormError('Port must be a valid number between 1-65535');
      setIsLoading(false);
      return;
    }

    // Track loading toast ID so it can be dismissed once the health check resolves
    let testToastId: string | null = null;

    try {
      // Update config in localStorage
      const success = updateApiConfig({
        protocol: formData.protocol,
        host: formData.host.trim(),
        port: formData.port.trim(),
        baseUrl: formData.baseUrl || undefined,
        timeout: formData.timeout,
        withCredentials: formData.withCredentials
      });

      if (!success) {
        toastDanger('Failed to cache configurations', { title: 'Save failed' });
        throw new Error('Failed to cache configuration');
      }

      // Show a loading/info toast while the health check runs
      testToastId = toastInfo('Testing API connection…', { title: 'Please wait' });

      // Test health check
      const healthResult = await testApiHealth();

      // Dismiss the loading toast now that we have a result
      if (testToastId) {
        dismissToast(testToastId);
        testToastId = null;
      }

      // Only close modal on health check success
      if (healthResult.success) {
        toastSuccess('API connection verified and working', { title: 'Configuration updated' });
        // Auto-close modal after success toast appears
        setTimeout(handleClose, 1200);
      } else {
        // Keep modal open on failure + show info
        toastInfo(
          `Health check failed: ${healthResult.message}`,
          { title: 'Configuration cached but API unreachable' }
        );
        // Modal stays open - user can fix settings and retry
      }
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Unknown error updating API configuration';
      
      // Dismiss loading toast if still showing
      if (testToastId) {
        dismissToast(testToastId);
        testToastId = null;
      }
      
      toastDanger(errorMessage, { title: 'Failed to update API configuration' });
      
      setFormError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear errors when user types
    if (formError) setFormError(null);
  };

  // Dismiss error alert
  const dismissError = () => setFormError(null);

  // Prevent modal from rendering if not open (avoids unnecessary renders)
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="api-config-modal-title"
    >
      <div 
        className="relative w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-600 to-cyan-500 p-5 text-white">
          <div className="flex justify-between items-center">
            <h2 id="api-config-modal-title" className="text-xl font-bold flex items-center">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-6 w-6 mr-2" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" 
                />
              </svg>
              API Configuration
            </h2>
            <button
              onClick={handleClose}
              className="text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-black/20 bg-blue-800/10"
              aria-label="Close modal"
            >
              <XCircleIcon className="h-6 w-6" />
            </button>
          </div>
          <p className="mt-1 text-sm text-cyan-100">
            Configure and test your API endpoint
          </p>
        </div>

        {/* Error Alert */}
        {formError && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mx-4 mt-4 rounded-r-lg flex items-start">
            <BsExclamationCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">{formError}</p>
            </div>
            <button
              onClick={dismissError}
              className="ml-3 text-red-500 hover:text-red-700 transition-colors"
              aria-label="Dismiss error"
            >
              <XCircleIcon className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Form */}
        <form 
          onSubmit={handleSubmit} 
          className="p-5 overflow-y-auto flex-1"
          noValidate
        >
          <div className="space-y-4">
            {/* Protocol */}
            <div>
              <label htmlFor="protocol" className="block text-sm font-medium text-gray-700 mb-1">
                Protocol
              </label>
              <select
                id="protocol"
                name="protocol"
                value={formData.protocol}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 text-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                disabled={isLoading}
              >
                <option value="http">HTTP</option>
                <option value="https">HTTPS</option>
              </select>
            </div>

            {/* Host */}
            <div>
              <label htmlFor="host" className="block text-sm font-medium text-gray-700 mb-1">
                Host
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                id="host"
                name="host"
                value={formData.host}
                onChange={handleChange}
                placeholder="localhost or api.example.com"
                className="w-full px-4 py-2.5 border border-gray-300 text-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                disabled={isLoading}
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Server hostname or IP address
              </p>
            </div>

            {/* Port */}
            <div>
              <label htmlFor="port" className="block text-sm font-medium text-gray-700 mb-1">
                Port
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                id="port"
                name="port"
                value={formData.port}
                onChange={handleChange}
                placeholder="3010"
                className="w-full px-4 py-2.5 border border-gray-300 text-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                disabled={isLoading}
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Default: 3005 (HTTP) or 443 (HTTPS)
              </p>
            </div>

            {/* Advanced Options (Collapsible) */}
            <details className="border-t pt-4 my-2 border-gray-200">
              <summary className="text-sm font-medium text-gray-700 cursor-pointer list-none flex items-center">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-4 w-4 mr-1" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6" 
                  />
                </svg>
                Advanced Options
              </summary>

              {/* Base URL */}
              <div className="mt-3">
                <label htmlFor="baseUrl" className="block text-sm font-medium text-gray-700 mb-1">
                  Base URL
                </label>
                <input
                  type="text"
                  id="baseUrl"
                  name="baseUrl"
                  value={formData.baseUrl}
                  onChange={handleChange}
                  placeholder="/api/v1"
                  className="w-full px-4 py-2.5 border border-gray-300 text-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                  disabled={isLoading}
                />
                <p className="mt-1 text-xs text-gray-500">
                  API path prefix (e.g., /api/v1)
                </p>
              </div>
              
              {/* Timeout */}
              <div className="mt-3">
                <label htmlFor="timeout" className="block text-sm font-medium text-gray-700 mb-1">
                  Timeout (ms)
                </label>
                <input
                  type="number"
                  id="timeout"
                  name="timeout"
                  value={formData.timeout}
                  onChange={handleChange}
                  min="1000"
                  max="60000"
                  className="w-full px-4 py-2.5 border border-gray-300 text-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                  disabled={isLoading}
                />
              </div>
              
              {/* With Credentials */}
              <div className="mt-3 flex items-center">
                <input
                  type="checkbox"
                  id="withCredentials"
                  name="withCredentials"
                  checked={formData.withCredentials}
                  onChange={handleChange}
                  className="h-4 w-4 text-cyan-600 rounded focus:ring-cyan-500"
                  disabled={isLoading}
                />
                <label htmlFor="withCredentials" className="ml-2 block text-sm text-gray-700">
                  Send credentials (cookies)
                </label>
              </div>
            </details>
          </div>

          {/* Submit Button */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center items-center px-4 py-3 rounded-lg font-medium text-white transition-colors ${
                isLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-cyan-700 to-cyan-600 hover:from-cyan-800 hover:to-cyan-700 shadow-md hover:shadow-lg'
              }`}
            >
              {isLoading ? (
                <>
                  <svg 
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24"
                  >
                    <circle 
                      className="opacity-25" 
                      cx="12" 
                      cy="12" 
                      r="10" 
                      stroke="currentColor" 
                      strokeWidth="4"
                    />
                    <path 
                      className="opacity-75" 
                      fill="currentColor" 
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Updating & Testing...
                </>
              ) : (
                'Update & Test Configuration'
              )}
            </button>
            <p className="mt-3 text-center text-xs text-gray-500">
              Settings are saved and API connection is tested
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};