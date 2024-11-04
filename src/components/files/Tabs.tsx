interface TabsProps {
  activeTab: 'client' | 'server';
  onChange: (tab: 'client' | 'server') => void;
}

export function Tabs({ activeTab, onChange }: TabsProps) {
  return (
    <div className="border-b border-gray-200">
      <nav className="flex -mb-px">
        <button
          onClick={() => onChange('client')}
          className={`
            w-1/2 py-4 px-1 text-center border-b-2 text-sm font-medium
            ${activeTab === 'client'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
          `}
        >
          クライアント端末から
        </button>
        <button
          onClick={() => onChange('server')}
          className={`
            w-1/2 py-4 px-1 text-center border-b-2 text-sm font-medium
            ${activeTab === 'server'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
          `}
        >
          サーバーから
        </button>
      </nav>
    </div>
  );
}