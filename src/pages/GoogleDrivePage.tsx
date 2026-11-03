import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Folder,
  FileText,
  FileCode,
  Image as ImageIcon,
  File as GenericFile,
  UploadCloud,
  FolderPlus,
  Trash2,
  ExternalLink,
  Download,
  RefreshCw,
  Search,
  CheckCircle,
  AlertTriangle,
  FileCheck,
  Shield,
  FileSpreadsheet,
  X,
  HardDrive,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  DriveFile,
  DriveAboutInfo,
  listDriveFiles,
  getDriveAbout,
  createDriveFolder,
  uploadFileToDrive,
  exportSafariDocumentToDrive,
  deleteDriveFile,
} from '../services/googleDrive';
import { GoogleAuthButton } from '../components/GoogleAuthButton';

export const GoogleDrivePage: React.FC = () => {
  const { user, accessToken, loading: authLoading } = useAuth();

  const [files, setFiles] = useState<DriveFile[]>([]);
  const [driveInfo, setDriveInfo] = useState<DriveAboutInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'folder' | 'pdf' | 'doc' | 'image'>('all');

  // Navigation stack for folders
  const [folderStack, setFolderStack] = useState<Array<{ id: string; name: string }>>([
    { id: 'root', name: 'My Drive' },
  ]);
  const currentFolder = folderStack[folderStack.length - 1];

  // Modals state
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Destructive Action: Confirmation Modal State (MANDATORY per Workspace Integration guidelines)
  const [fileToDelete, setFileToDelete] = useState<DriveFile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Drag & drop state
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch Drive Files
  const fetchFiles = useCallback(async () => {
    if (!accessToken) return;

    setLoading(true);
    setError(null);
    try {
      const folderId = currentFolder.id === 'root' ? undefined : currentFolder.id;
      const data = await listDriveFiles(accessToken, {
        folderId,
        searchQuery: searchQuery.trim() || undefined,
        mimeTypeFilter: filterType === 'all' ? undefined : filterType,
      });
      setFiles(data.files || []);

      // Fetch about info
      const about = await getDriveAbout(accessToken).catch(() => null);
      if (about) setDriveInfo(about);
    } catch (err: any) {
      console.error('Failed to load Drive files:', err);
      setError(err.message || 'Unable to load files from Google Drive.');
    } finally {
      setLoading(false);
    }
  }, [accessToken, currentFolder.id, searchQuery, filterType]);

  useEffect(() => {
    if (accessToken) {
      fetchFiles();
    }
  }, [fetchFiles, accessToken]);

  // Handle Folder Click
  const handleOpenFolder = (folder: DriveFile) => {
    setFolderStack((prev) => [...prev, { id: folder.id, name: folder.name }]);
  };

  const handleNavigateBreadcrumb = (index: number) => {
    setFolderStack((prev) => prev.slice(0, index + 1));
  };

  // Create Folder
  const handleCreateFolderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !newFolderName.trim()) return;

    try {
      const parentId = currentFolder.id === 'root' ? undefined : currentFolder.id;
      await createDriveFolder(accessToken, newFolderName.trim(), parentId);
      setSuccessMessage(`Folder "${newFolderName.trim()}" created in Google Drive`);
      setNewFolderName('');
      setIsNewFolderOpen(false);
      fetchFiles();
    } catch (err: any) {
      setError(err.message || 'Failed to create folder.');
    }
  };

  // Upload File
  const handleFileUpload = async (selectedFiles: FileList | null) => {
    if (!accessToken || !selectedFiles || selectedFiles.length === 0) return;

    setIsUploading(true);
    setError(null);
    try {
      const parentId = currentFolder.id === 'root' ? undefined : currentFolder.id;
      for (let i = 0; i < selectedFiles.length; i++) {
        await uploadFileToDrive(accessToken, selectedFiles[i], parentId);
      }
      setSuccessMessage(`Successfully uploaded ${selectedFiles.length} file(s) to Google Drive.`);
      fetchFiles();
    } catch (err: any) {
      setError(err.message || 'Failed to upload file(s).');
    } finally {
      setIsUploading(false);
    }
  };

  // Export Sample Safari Itinerary / Quote Document
  const handleExportSafariDoc = async (type: 'circuit' | 'gorilla') => {
    if (!accessToken) return;

    setLoading(true);
    try {
      const parentId = currentFolder.id === 'root' ? undefined : currentFolder.id;

      if (type === 'circuit') {
        const title = `Enganda_Safaris_7Day_Best_of_Uganda_Dossier_${new Date().toISOString().slice(0, 10)}`;
        const content = `ENGANDA SAFARIS — UGANDA GUIDE COLLECTIVE
Official Uganda Safari Dossier & Guide Confirmation
Date: ${new Date().toLocaleDateString()}
Head Office: Mugwanya Road, Bugonga, Entebbe, Uganda (next to Rosemary Courts)

SAFARI SUMMARY:
Experience: 7-Day Best of Uganda (Murchison Falls, Kibale, Queen Elizabeth & Bwindi)
Lead Ugandan Guide: Daniel Tumusiime / Samuel Kato (USAGA & UWA Certified)
Inclusions: Private 4x4 Land Cruiser with pop-up roof, driven by your professional guide, full-board lodges, all park entrance fees, and airport meet & greet in Entebbe.

TRANSPARENCY & ACCREDITATION:
- Uganda Tourism Board (UTB) Registered & AUTO Member
- Official UWA receipts shared before balance collection`;

        await exportSafariDocumentToDrive(accessToken, title, content, parentId);
        setSuccessMessage('Saved "7-Day Best of Uganda Dossier" to your Google Drive!');
      } else {
        const title = `Enganda_Safaris_Bwindi_UWA_Gorilla_Permit_Summary_${new Date().toISOString().slice(0, 10)}`;
        const content = `ENGANDA SAFARIS — UWA PRIMATE PERMIT BRIEF
Uganda Wildlife Authority (UWA) Mountain Gorilla Trekking
Head Office: Mugwanya Road, Bugonga, Entebbe, Uganda (5 mins from Entebbe International Airport)

UWA PERMIT FACTS (Verified November 2026):
Standard Tariff: US$800 per person (Bwindi Impenetrable NP & Mgahinga Gorilla NP)
Low-Season Tariff: US$600 per person (April, May, November — date-fixed & non-reschedulable)
Minimum Age: 15 years | Daily Quota: Max 8 guests per habituated gorilla family

ENGANDA GUARANTEE:
Official UWA receipts shared with you before we collect your balance.`;

        await exportSafariDocumentToDrive(accessToken, title, content, parentId);
        setSuccessMessage('Saved "Bwindi UWA Gorilla Permit Summary" to your Google Drive!');
      }

      fetchFiles();
    } catch (err: any) {
      setError(err.message || 'Failed to export document to Google Drive.');
    } finally {
      setLoading(false);
    }
  };

  // Perform Confirmed Deletion
  const handleConfirmDelete = async () => {
    if (!accessToken || !fileToDelete) return;

    setIsDeleting(true);
    try {
      await deleteDriveFile(accessToken, fileToDelete.id);
      setSuccessMessage(`Permanently deleted "${fileToDelete.name}" from Google Drive.`);
      setFileToDelete(null);
      fetchFiles();
    } catch (err: any) {
      setError(err.message || 'Failed to delete file.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Format File Size
  const formatSize = (bytesStr?: string) => {
    if (!bytesStr) return '-';
    const bytes = parseInt(bytesStr, 10);
    if (isNaN(bytes)) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Get File Icon
  const getFileIcon = (mimeType: string) => {
    if (mimeType === 'application/vnd.google-apps.folder') {
      return <Folder className="w-5 h-5 text-amber-400 flex-shrink-0" />;
    }
    if (mimeType === 'application/pdf') {
      return <FileText className="w-5 h-5 text-rose-400 flex-shrink-0" />;
    }
    if (mimeType.includes('image/')) {
      return <ImageIcon className="w-5 h-5 text-emerald-400 flex-shrink-0" />;
    }
    if (
      mimeType === 'application/vnd.google-apps.document' ||
      mimeType.includes('text/') ||
      mimeType.includes('word')
    ) {
      return <FileCheck className="w-5 h-5 text-sky-400 flex-shrink-0" />;
    }
    if (mimeType.includes('sheet') || mimeType.includes('csv')) {
      return <FileSpreadsheet className="w-5 h-5 text-emerald-500 flex-shrink-0" />;
    }
    return <GenericFile className="w-5 h-5 text-stone-400 flex-shrink-0" />;
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Banner & Headline */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-stone-800 pb-6">
          <div>
            <div className="inline-flex items-center space-x-2 text-amber-500 text-xs font-semibold uppercase tracking-wider mb-2">
              <HardDrive className="w-4 h-4" />
              <span>Workspace Integration</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold font-display text-white tracking-tight">
              Google Drive Safari Vault
            </h1>
            <p className="text-stone-400 text-sm sm:text-base mt-1 max-w-2xl">
              Securely access, archive, and manage your Uganda safari documents, official UWA gorilla permit
              receipts, traveler insurance PDFs, and custom itineraries directly in your Google Drive.
            </p>
          </div>

          {/* Google Auth Status / Action */}
          <div className="flex items-center space-x-3">
            <GoogleAuthButton />
          </div>
        </div>

        {/* Feedback Alert Banners */}
        {error && (
          <div className="bg-rose-950/70 border border-rose-800 text-rose-200 px-4 py-3 rounded-xl text-sm flex items-center justify-between animate-in fade-in">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-rose-400 hover:text-rose-200 p-1 rounded"
              aria-label="Close error"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {successMessage && (
          <div className="bg-emerald-950/70 border border-emerald-800 text-emerald-200 px-4 py-3 rounded-xl text-sm flex items-center justify-between animate-in fade-in">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
            <button
              onClick={() => setSuccessMessage(null)}
              className="text-emerald-400 hover:text-emerald-200 p-1 rounded"
              aria-label="Close message"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* State 1: User not signed in with Google */}
        {!accessToken ? (
          <div className="bg-stone-900/60 border border-stone-800 rounded-2xl p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-xl">
            <div className="w-16 h-16 rounded-2xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center mx-auto mb-6 text-amber-500">
              <HardDrive className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white font-display mb-3">
              Connect Your Google Drive
            </h2>
            <p className="text-stone-300 text-sm sm:text-base leading-relaxed mb-6">
              Grant permission to access your Google Drive to view safari vouchers, upload passport copies for UWA
              gorilla permits, and sync custom itineraries seamlessly with your Google Workspace.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <GoogleAuthButton className="scale-110" />
            </div>

            <div className="mt-8 pt-6 border-t border-stone-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left text-xs text-stone-400">
              <div className="flex items-start space-x-2">
                <Shield className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>Protected by Google OAuth & token in-memory isolation</span>
              </div>
              <div className="flex items-start space-x-2">
                <FileCheck className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>Instant export of safari itineraries to Google Docs</span>
              </div>
              <div className="flex items-start space-x-2">
                <UserCheck className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
                <span>Staff & traveler permit verification before departure</span>
              </div>
            </div>
          </div>
        ) : (
          /* State 2: Authenticated with Google Drive */
          <div className="space-y-6">
            {/* Drive Profile & Storage Summary */}
            {driveInfo && (
              <div className="bg-stone-900/80 border border-stone-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-amber-600/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold">
                    {driveInfo.user.displayName.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-stone-200">{driveInfo.user.displayName}</div>
                    <div className="text-stone-400 font-mono text-[11px]">{driveInfo.user.emailAddress}</div>
                  </div>
                </div>

                {driveInfo.storageQuota?.limit && (
                  <div className="flex items-center space-x-4">
                    <div>
                      <span className="text-stone-400">Drive Storage: </span>
                      <span className="text-stone-200 font-medium">
                        {formatSize(driveInfo.storageQuota.usageInDrive || driveInfo.storageQuota.usage)} /{' '}
                        {formatSize(driveInfo.storageQuota.limit)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quick Expedition Actions Bar */}
            <div className="bg-stone-900/90 border border-stone-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
              {/* Breadcrumb Navigation */}
              <div className="flex items-center space-x-2 text-xs overflow-x-auto py-1">
                {folderStack.map((folder, index) => (
                  <React.Fragment key={folder.id}>
                    {index > 0 && <span className="text-stone-600">/</span>}
                    <button
                      onClick={() => handleNavigateBreadcrumb(index)}
                      className={`px-2 py-1 rounded transition-colors whitespace-nowrap ${
                        index === folderStack.length - 1
                          ? 'bg-amber-600/20 text-amber-400 font-semibold'
                          : 'text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      {folder.name}
                    </button>
                  </React.Fragment>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => setIsNewFolderOpen(true)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium border border-stone-700 transition-colors"
                >
                  <FolderPlus className="w-3.5 h-3.5 text-amber-400" />
                  <span>New Folder</span>
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-bold transition-colors disabled:opacity-50"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>{isUploading ? 'Uploading...' : 'Upload File'}</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="hidden"
                  multiple
                />

                {/* Preset Expeditions Exporters */}
                <button
                  onClick={() => handleExportSafariDoc('circuit')}
                  disabled={loading}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-400 text-xs font-medium border border-stone-700 transition-colors"
                  title="Export 7-Day Best of Uganda dossier to Google Drive"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>+ Uganda Safari Dossier</span>
                </button>

                <button
                  onClick={() => handleExportSafariDoc('gorilla')}
                  disabled={loading}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-emerald-400 text-xs font-medium border border-stone-700 transition-colors"
                  title="Export Bwindi Gorilla Permit voucher to Google Drive"
                >
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>+ UWA Gorilla Permit Doc</span>
                </button>

                <button
                  onClick={() => fetchFiles()}
                  disabled={loading}
                  className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white border border-stone-700 transition-colors"
                  title="Refresh files"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-500' : ''}`} />
                </button>
              </div>
            </div>

            {/* Filter Chips & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto pb-1">
                {(
                  [
                    { id: 'all', label: 'All Files' },
                    { id: 'folder', label: 'Folders' },
                    { id: 'pdf', label: 'PDFs (Permits/Vouchers)' },
                    { id: 'doc', label: 'Docs & Text' },
                    { id: 'image', label: 'Photos' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setFilterType(tab.id)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                      filterType === tab.id
                        ? 'bg-amber-600 text-stone-950 font-bold'
                        : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search input */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-stone-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search Drive files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Drag & Drop Dropzone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOver(false);
                handleFileUpload(e.dataTransfer.files);
              }}
              className={`border-2 border-dashed rounded-2xl p-4 text-center transition-all ${
                isDragOver
                  ? 'border-amber-500 bg-amber-950/20 text-amber-300 scale-[1.005]'
                  : 'border-stone-800/80 hover:border-stone-700 bg-stone-900/30 text-stone-500'
              }`}
            >
              <div className="flex items-center justify-center space-x-2 text-xs">
                <UploadCloud className="w-4 h-4" />
                <span>
                  Drag & drop safari documents (permits, itineraries, insurance PDFs) here, or click{' '}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-amber-400 underline font-medium"
                  >
                    browse
                  </button>
                </span>
              </div>
            </div>

            {/* Files Grid / List */}
            {loading && files.length === 0 ? (
              <div className="bg-stone-900/40 border border-stone-800 rounded-2xl p-12 text-center">
                <RefreshCw className="w-8 h-8 animate-spin text-amber-500 mx-auto mb-3" />
                <p className="text-stone-400 text-sm">Querying Google Drive files...</p>
              </div>
            ) : files.length === 0 ? (
              <div className="bg-stone-900/40 border border-stone-800 rounded-2xl p-12 text-center">
                <Folder className="w-12 h-12 text-stone-600 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-stone-300">No files found in this folder</h3>
                <p className="text-stone-500 text-xs mt-1">
                  Upload guest passport scans, gorilla permit vouchers, or export custom safari quotes.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {files.map((file) => {
                  const isFolder = file.mimeType === 'application/vnd.google-apps.folder';

                  return (
                    <div
                      key={file.id}
                      className="bg-stone-900/70 hover:bg-stone-900 border border-stone-800 hover:border-stone-700 rounded-xl p-4 transition-all duration-150 flex flex-col justify-between group shadow-sm"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="p-2.5 rounded-lg bg-stone-800/80 border border-stone-700/50">
                          {getFileIcon(file.mimeType)}
                        </div>

                        <div className="flex-grow min-w-0">
                          {isFolder ? (
                            <button
                              onClick={() => handleOpenFolder(file)}
                              className="text-sm font-semibold text-stone-200 hover:text-amber-400 truncate block text-left w-full transition-colors"
                            >
                              {file.name}
                            </button>
                          ) : (
                            <div className="text-sm font-semibold text-stone-200 truncate" title={file.name}>
                              {file.name}
                            </div>
                          )}

                          <div className="flex items-center space-x-2 text-[11px] text-stone-400 mt-1">
                            <span>{isFolder ? 'Folder' : formatSize(file.size)}</span>
                            {file.modifiedTime && (
                              <>
                                <span>•</span>
                                <span>{new Date(file.modifiedTime).toLocaleDateString()}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Card Action Controls */}
                      <div className="flex items-center justify-between border-t border-stone-800/80 pt-3 mt-4 text-xs">
                        <div className="flex items-center space-x-2">
                          {file.webViewLink && (
                            <a
                              href={file.webViewLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center space-x-1 text-stone-400 hover:text-amber-400 transition-colors"
                              title="Open in Google Drive"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>Open</span>
                            </a>
                          )}

                          {file.webContentLink && (
                            <a
                              href={file.webContentLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center space-x-1 text-stone-400 hover:text-emerald-400 transition-colors"
                              title="Direct Download"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download</span>
                            </a>
                          )}
                        </div>

                        {/* Destructive Delete Button: Triggers MANDATORY Confirmation Dialog */}
                        <button
                          onClick={() => setFileToDelete(file)}
                          className="p-1 rounded text-stone-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                          title="Delete from Google Drive"
                          aria-label={`Delete ${file.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Modal: New Folder */}
        {isNewFolderOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white font-display flex items-center space-x-2">
                  <FolderPlus className="w-5 h-5 text-amber-500" />
                  <span>Create Safari Folder</span>
                </h3>
                <button
                  onClick={() => setIsNewFolderOpen(false)}
                  className="p-1 text-stone-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateFolderSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5 uppercase tracking-wide">
                    Folder Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Enganda Safaris - Guest UWA Gorilla Vouchers"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
                    autoFocus
                  />
                </div>

                <div className="flex items-center justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsNewFolderOpen(false)}
                    className="px-4 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-bold"
                  >
                    Create in Drive
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MANDATORY Confirmation Dialog for Destructive Operations (Workspace Integration Skill) */}
        {fileToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-stone-900 border border-rose-900/50 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <div className="w-12 h-12 rounded-xl bg-rose-950/60 border border-rose-800/60 flex items-center justify-center text-rose-400 mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-lg font-bold text-white">Delete file from Google Drive?</h3>
                <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
                  Are you sure you want to permanently delete{' '}
                  <span className="font-semibold text-rose-300 font-mono">"{fileToDelete.name}"</span> from your Google
                  Drive? This action cannot be undone.
                </p>
              </div>

              <div className="flex items-center justify-center space-x-3 pt-4 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setFileToDelete(null)}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-lg bg-rose-700 hover:bg-rose-600 text-white text-xs font-bold transition-colors flex items-center space-x-1.5"
                >
                  {isDeleting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isDeleting ? 'Deleting...' : 'Confirm Delete'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
