import { useRef, useState } from 'react';
import { X, Upload } from 'lucide-react';
import { useServerFiles } from '../../hooks/useFiles';

interface UploadFileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UploadFileModal({ isOpen, onClose }: UploadFileModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile, isUploading } = useServerFiles();

  if (!isOpen) return null;

  const handleUpload = async () => {
    if (!file) return;

    try {
      await uploadFile(file);
      onClose();
      setFile(null);
    } catch (error) {
      console.error('Failed to upload file:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-medium">ファイルのアップロード</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4">
          <div className="space-y-4">
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              {file ? (
                <div className="text-sm text-gray-600">
                  選択されたファイル: {file.name}
                </div>
              ) : (
                <div className="text-gray-600">
                  <Upload className="h-12 w-12 mx-auto text-gray-400" />
                  <p className="mt-2">クリックしてファイルを選択</p>
                  <p className="text-sm text-gray-500">
                    または、ファイルをドラッグ＆ドロップ
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={handleUpload}
              disabled={!file || isUploading}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isUploading ? 'アップロード中...' : 'アップロード'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}