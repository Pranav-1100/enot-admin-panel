import { useState, useEffect } from "react";
import Head from "next/head";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { bannersAPI } from "@/lib/api";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { handleAPIError } from "@/lib/utils";

export default function Banners() {
  const [loading, setLoading] = useState(true);
  const [banners, setBanners] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    background_color: "#3B82F6",
    text_color: "#FFFFFF",
    banner_type: "announcement",
    position: "top",
    link_url: "",
    link_text: "",
    is_active: true,
    is_dismissible: true,
    start_date: "",
    end_date: "",
    priority: 0,
    show_on_pages: "all",
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await bannersAPI.getAll();
      setBanners(response.data.data || []);
    } catch (error) {
      console.error("Error fetching banners:", error);
      alert(handleAPIError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (banner = null) => {
    if (banner) {
      setEditingBanner(banner);
      setFormData({
        title: banner.title || "",
        message: banner.message || "",
        background_color: banner.background_color || "#3B82F6",
        text_color: banner.text_color || "#FFFFFF",
        banner_type: banner.banner_type || "announcement",
        position: banner.position || "top",
        link_url: banner.link_url || "",
        link_text: banner.link_text || "",
        is_active: banner.is_active !== undefined ? banner.is_active : true,
        is_dismissible: banner.is_dismissible !== undefined ? banner.is_dismissible : true,
        start_date: banner.start_date ? banner.start_date.split('T')[0] : "",
        end_date: banner.end_date ? banner.end_date.split('T')[0] : "",
        priority: banner.priority || 0,
        show_on_pages: banner.show_on_pages || "all",
      });
    } else {
      setEditingBanner(null);
      setFormData({
        title: "",
        message: "",
        background_color: "#3B82F6",
        text_color: "#FFFFFF",
        banner_type: "announcement",
        position: "top",
        link_url: "",
        link_text: "",
        is_active: true,
        is_dismissible: true,
        start_date: "",
        end_date: "",
        priority: 0,
        show_on_pages: "all",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingBanner(null);
  };

  const handleSave = async () => {
    try {
      // Clean up data
      const data = { ...formData };
      if (!data.start_date) delete data.start_date;
      if (!data.end_date) delete data.end_date;
      if (!data.link_url) {
        delete data.link_url;
        delete data.link_text;
      }

      if (editingBanner) {
        await bannersAPI.update(editingBanner.id, data);
      } else {
        await bannersAPI.create(data);
      }
      await fetchBanners();
      handleCloseModal();
    } catch (error) {
      console.error("Error saving banner:", error);
      alert(handleAPIError(error));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this banner?")) return;

    try {
      await bannersAPI.delete(id);
      await fetchBanners();
    } catch (error) {
      console.error("Error deleting banner:", error);
      alert(handleAPIError(error));
    }
  };

  const handleChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const getBadgeColor = (type) => {
    const colors = {
      announcement: "bg-blue-100 text-blue-800",
      sale: "bg-red-100 text-red-800",
      info: "bg-green-100 text-green-800",
      warning: "bg-yellow-100 text-yellow-800",
    };
    return colors[type] || colors.announcement;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Banners - E° ENOT Admin</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Banners</h1>
            <p className="mt-2 text-sm text-gray-700">
              Manage promotional banners and announcements
            </p>
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Banner
          </button>
        </div>

        {/* Banners List */}
        <div className="bg-white shadow sm:rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Banner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Schedule
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {banners.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      No banners found. Create your first banner!
                    </td>
                  </tr>
                ) : (
                  banners.map((banner) => (
                    <tr key={banner.id}>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div
                            className="w-8 h-8 rounded flex-shrink-0 mr-3"
                            style={{ backgroundColor: banner.background_color }}
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {banner.title}
                            </div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {banner.message}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getBadgeColor(
                            banner.banner_type
                          )}`}
                        >
                          {banner.banner_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {banner.position}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {banner.start_date || banner.end_date ? (
                          <div>
                            {banner.start_date && (
                              <div>From: {new Date(banner.start_date).toLocaleDateString()}</div>
                            )}
                            {banner.end_date && (
                              <div>To: {new Date(banner.end_date).toLocaleDateString()}</div>
                            )}
                          </div>
                        ) : (
                          "Always visible"
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {banner.priority}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            banner.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {banner.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleOpenModal(banner)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(banner.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={handleCloseModal} />

              <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    {editingBanner ? "Edit Banner" : "Create Banner"}
                  </h3>
                  <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-500">
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Title</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => handleChange("title", e.target.value)}
                        placeholder="Summer Sale!"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Message</label>
                      <textarea
                        rows={2}
                        value={formData.message}
                        onChange={(e) => handleChange("message", e.target.value)}
                        placeholder="Get 20% off all fragrances!"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Banner Type
                      </label>
                      <select
                        value={formData.banner_type}
                        onChange={(e) => handleChange("banner_type", e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                        <option value="announcement">Announcement</option>
                        <option value="sale">Sale</option>
                        <option value="info">Info</option>
                        <option value="warning">Warning</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Position</label>
                      <select
                        value={formData.position}
                        onChange={(e) => handleChange("position", e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                        <option value="top">Top</option>
                        <option value="bottom">Bottom</option>
                        <option value="floating">Floating</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Background Color
                      </label>
                      <div className="mt-1 flex items-center">
                        <input
                          type="color"
                          value={formData.background_color}
                          onChange={(e) => handleChange("background_color", e.target.value)}
                          className="h-10 w-20 rounded border-gray-300"
                        />
                        <input
                          type="text"
                          value={formData.background_color}
                          onChange={(e) => handleChange("background_color", e.target.value)}
                          className="ml-2 flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Text Color
                      </label>
                      <div className="mt-1 flex items-center">
                        <input
                          type="color"
                          value={formData.text_color}
                          onChange={(e) => handleChange("text_color", e.target.value)}
                          className="h-10 w-20 rounded border-gray-300"
                        />
                        <input
                          type="text"
                          value={formData.text_color}
                          onChange={(e) => handleChange("text_color", e.target.value)}
                          className="ml-2 flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Link URL</label>
                      <input
                        type="url"
                        value={formData.link_url}
                        onChange={(e) => handleChange("link_url", e.target.value)}
                        placeholder="https://..."
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Link Text</label>
                      <input
                        type="text"
                        value={formData.link_text}
                        onChange={(e) => handleChange("link_text", e.target.value)}
                        placeholder="Shop Now"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Start Date (optional)
                      </label>
                      <input
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => handleChange("start_date", e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        End Date (optional)
                      </label>
                      <input
                        type="date"
                        value={formData.end_date}
                        onChange={(e) => handleChange("end_date", e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Priority (0 = highest)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="1000"
                        value={formData.priority}
                        onChange={(e) => handleChange("priority", parseInt(e.target.value))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Show on Pages
                      </label>
                      <input
                        type="text"
                        value={formData.show_on_pages}
                        onChange={(e) => handleChange("show_on_pages", e.target.value)}
                        placeholder="all, home, products"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div className="md:col-span-2 flex items-center space-x-6">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.is_active}
                          onChange={(e) => handleChange("is_active", e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Active</span>
                      </label>

                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.is_dismissible}
                          onChange={(e) => handleChange("is_dismissible", e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Dismissible</span>
                      </label>
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="pt-4 border-t">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preview
                    </label>
                    <div
                      className="p-4 rounded-md"
                      style={{
                        backgroundColor: formData.background_color,
                        color: formData.text_color,
                      }}
                    >
                      <div className="font-semibold">{formData.title || "Banner Title"}</div>
                      <div className="text-sm mt-1">
                        {formData.message || "Banner message goes here"}
                      </div>
                      {formData.link_text && (
                        <div className="mt-2">
                          <span className="underline">{formData.link_text}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={handleCloseModal}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    {editingBanner ? "Update" : "Create"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
