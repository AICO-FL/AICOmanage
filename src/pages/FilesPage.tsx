import { useState } from 'react';
import { Tabs } from '../components/files/Tabs';
import { ClientFileList } from '../components/files/ClientFileList';
import { ServerFileList } from '../components/files/ServerFileList';
import { UploadFileModal } from '../components/files/UploadFileModal';

export function FilesPage() {
  const [activeTab, setActiveTab] = useState<'client' | 'server'>('client');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">ファイル管理</h1>
        <p className="mt-2 text-sm text-gray-700">
          クライアント端末とサーバーのファイルを管理します
        </p>
      </div>

      <div className="bg-white shadow rounded-lg">
        <Tabs activeTab={activeTab} onChange={setActiveTab} />
        
        <div className="p-6">
          {activeTab === 'client' ? (
            <ClientFileList />
          ) : (
            <ServerFileList onUpload={() => setIsUploadModalOpen(true)} />
          )}
        </div>
      </div>

      <UploadFileModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </div>
  );
}