import { useState, useEffect } from "react";
import Head from "next/head";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline";
import { footerAPI } from "@/lib/api";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { handleAPIError } from "@/lib/utils";

export default function FooterManagement() {
  const [loading, setLoading] = useState(true);
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [editingLink, setEditingLink] = useState(null);

  const [sectionFormData, setSectionFormData] = useState({
    title: "",
    slug: "",
    is_active: true,
    position: 0,
  });

  const [linkFormData, setLinkFormData] = useState({
    section_id: "",
    label: "",
    url: "",
    link_type: "internal",
    is_active: true,
    position: 0,
    open_in_new_tab: false,
    title_attribute: "",
  });

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      setLoading(true);
      const response = await footerAPI.getSections();
      setSections(response.data.data || []);
      if (response.data.data && response.data.data.length > 0 && !selectedSection) {
        setSelectedSection(response.data.data[0]);
      }
    } catch (error) {
      console.error("Error fetching footer sections:", error);
      alert(handleAPIError(error));
    } finally {
      setLoading(false);
    }
  };

  // Section handlers
  const handleOpenSectionModal = (section = null) => {
    if (section) {
      setEditingSection(section);
      setSectionFormData({
        title: section.title || "",
        slug: section.slug || "",
        is_active: section.is_active !== undefined ? section.is_active : true,
        position: section.position || 0,
      });
    } else {
      setEditingSection(null);
      setSectionFormData({
        title: "",
        slug: "",
        is_active: true,
        position: sections.length,
      });
    }
    setShowSectionModal(true);
  };

  const handleCloseSectionModal = () => {
    setShowSectionModal(false);
    setEditingSection(null);
  };

  const handleSaveSection = async () => {
    try {
      if (editingSection) {
        await footerAPI.updateSection(editingSection.id, sectionFormData);
      } else {
        await footerAPI.createSection(sectionFormData);
      }
      await fetchSections();
      handleCloseSectionModal();
    } catch (error) {
      console.error("Error saving section:", error);
      alert(handleAPIError(error));
    }
  };

  const handleDeleteSection = async (id) => {
    if (!confirm("Are you sure you want to delete this section? All links in this section will also be deleted.")) return;

    try {
      await footerAPI.deleteSection(id);
      await fetchSections();
      if (selectedSection && selectedSection.id === id) {
        setSelectedSection(sections[0] || null);
      }
    } catch (error) {
      console.error("Error deleting section:", error);
      alert(handleAPIError(error));
    }
  };

  // Link handlers
  const handleOpenLinkModal = (link = null) => {
    if (link) {
      setEditingLink(link);
      setLinkFormData({
        section_id: link.section_id || selectedSection?.id || "",
        label: link.label || "",
        url: link.url || "",
        link_type: link.link_type || "internal",
        is_active: link.is_active !== undefined ? link.is_active : true,
        position: link.position || 0,
        open_in_new_tab: link.open_in_new_tab || false,
        title_attribute: link.title_attribute || "",
      });
    } else {
      setEditingLink(null);
      setLinkFormData({
        section_id: selectedSection?.id || "",
        label: "",
        url: "",
        link_type: "internal",
        is_active: true,
        position: selectedSection?.links?.length || 0,
        open_in_new_tab: false,
        title_attribute: "",
      });
    }
    setShowLinkModal(true);
  };

  const handleCloseLinkModal = () => {
    setShowLinkModal(false);
    setEditingLink(null);
  };

  const handleSaveLink = async () => {
    try {
      if (editingLink) {
        await footerAPI.updateLink(editingLink.id, linkFormData);
      } else {
        await footerAPI.createLink(linkFormData);
      }
      await fetchSections();
      handleCloseLinkModal();
    } catch (error) {
      console.error("Error saving link:", error);
      alert(handleAPIError(error));
    }
  };

  const handleDeleteLink = async (id) => {
    if (!confirm("Are you sure you want to delete this link?")) return;

    try {
      await footerAPI.deleteLink(id);
      await fetchSections();
    } catch (error) {
      console.error("Error deleting link:", error);
      alert(handleAPIError(error));
    }
  };

  const handleSectionChange = (key, value) => {
    setSectionFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleLinkChange = (key, value) => {
    setLinkFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
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
        <title>Footer Management - E° ENOT Admin</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Footer Management</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage footer sections and links for your website
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sections List */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Sections</h3>
                  <button
                    onClick={() => handleOpenSectionModal()}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md text-xs font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    New
                  </button>
                </div>

                <div className="space-y-2">
                  {sections.length === 0 ? (
                    <p className="text-sm text-gray-500">No sections found</p>
                  ) : (
                    sections.map((section) => (
                      <div
                        key={section.id}
                        className={`p-3 rounded-lg border ${
                          selectedSection?.id === section.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        } cursor-pointer`}
                        onClick={() => setSelectedSection(section)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center">
                              <Bars3Icon className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-sm font-medium text-gray-900">
                                {section.title}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {section.links?.length || 0} links • Position: {section.position}
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenSectionModal(section);
                              }}
                              className="p-1 text-gray-400 hover:text-blue-600"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteSection(section.id);
                              }}
                              className="p-1 text-gray-400 hover:text-red-600"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        {!section.is_active && (
                          <span className="inline-block mt-2 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
                            Inactive
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Links List */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                {selectedSection ? (
                  <>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        Links in "{selectedSection.title}"
                      </h3>
                      <button
                        onClick={() => handleOpenLinkModal()}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md text-xs font-medium text-white bg-blue-600 hover:bg-blue-700"
                      >
                        <PlusIcon className="h-4 w-4 mr-1" />
                        Add Link
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Label
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              URL
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Type
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Position
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Status
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {!selectedSection.links || selectedSection.links.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="px-4 py-4 text-center text-gray-500">
                                No links in this section
                              </td>
                            </tr>
                          ) : (
                            selectedSection.links.map((link) => (
                              <tr key={link.id}>
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {link.label}
                                </td>
                                <td className="px-4 py-4 text-sm text-gray-500 max-w-xs truncate">
                                  {link.url}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                  <span
                                    className={`px-2 py-1 text-xs rounded-full ${
                                      link.link_type === "internal"
                                        ? "bg-blue-100 text-blue-800"
                                        : "bg-gray-100 text-gray-800"
                                    }`}
                                  >
                                    {link.link_type}
                                  </span>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {link.position}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                  <span
                                    className={`px-2 py-1 text-xs rounded-full ${
                                      link.is_active
                                        ? "bg-green-100 text-green-800"
                                        : "bg-gray-100 text-gray-800"
                                    }`}
                                  >
                                    {link.is_active ? "Active" : "Inactive"}
                                  </span>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  <button
                                    onClick={() => handleOpenLinkModal(link)}
                                    className="text-blue-600 hover:text-blue-900 mr-4"
                                  >
                                    <PencilIcon className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteLink(link.id)}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    <TrashIcon className="h-4 w-4" />
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">
                      Select a section to view and manage its links
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section Modal */}
        {showSectionModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={handleCloseSectionModal} />

              <div className="inline-block w-full max-w-lg p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    {editingSection ? "Edit Section" : "Create Section"}
                  </h3>
                  <button onClick={handleCloseSectionModal} className="text-gray-400 hover:text-gray-500">
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <input
                      type="text"
                      value={sectionFormData.title}
                      onChange={(e) => handleSectionChange("title", e.target.value)}
                      placeholder="Shop"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Slug (URL-friendly)
                    </label>
                    <input
                      type="text"
                      value={sectionFormData.slug}
                      onChange={(e) => handleSectionChange("slug", e.target.value)}
                      placeholder="shop"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Position</label>
                    <input
                      type="number"
                      min="0"
                      value={sectionFormData.position}
                      onChange={(e) => handleSectionChange("position", parseInt(e.target.value))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={sectionFormData.is_active}
                      onChange={(e) => handleSectionChange("is_active", e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">Active</label>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={handleCloseSectionModal}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveSection}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    {editingSection ? "Update" : "Create"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Link Modal */}
        {showLinkModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={handleCloseLinkModal} />

              <div className="inline-block w-full max-w-lg p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    {editingLink ? "Edit Link" : "Create Link"}
                  </h3>
                  <button onClick={handleCloseLinkModal} className="text-gray-400 hover:text-gray-500">
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Section</label>
                    <select
                      value={linkFormData.section_id}
                      onChange={(e) => handleLinkChange("section_id", e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      {sections.map((section) => (
                        <option key={section.id} value={section.id}>
                          {section.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Label</label>
                    <input
                      type="text"
                      value={linkFormData.label}
                      onChange={(e) => handleLinkChange("label", e.target.value)}
                      placeholder="About Us"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">URL</label>
                    <input
                      type="text"
                      value={linkFormData.url}
                      onChange={(e) => handleLinkChange("url", e.target.value)}
                      placeholder="/about"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Link Type</label>
                    <select
                      value={linkFormData.link_type}
                      onChange={(e) => handleLinkChange("link_type", e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="internal">Internal</option>
                      <option value="external">External</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Position</label>
                    <input
                      type="number"
                      min="0"
                      value={linkFormData.position}
                      onChange={(e) => handleLinkChange("position", parseInt(e.target.value))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Title Attribute (optional)
                    </label>
                    <input
                      type="text"
                      value={linkFormData.title_attribute}
                      onChange={(e) => handleLinkChange("title_attribute", e.target.value)}
                      placeholder="Learn more about us"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={linkFormData.is_active}
                        onChange={(e) => handleLinkChange("is_active", e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 text-sm text-gray-700">Active</label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={linkFormData.open_in_new_tab}
                        onChange={(e) => handleLinkChange("open_in_new_tab", e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 text-sm text-gray-700">Open in new tab</label>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={handleCloseLinkModal}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveLink}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    {editingLink ? "Update" : "Create"}
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
