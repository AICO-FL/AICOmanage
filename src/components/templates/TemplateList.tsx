import { useState } from 'react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Edit, Trash2, FileText } from 'lucide-react';
import { Template } from '../../types/template';
import { EditTemplateModal } from './EditTemplateModal';
import { useTemplates } from '../../hooks/useTemplates';

interface TemplateListProps {
  templates: Template[];
}

export function TemplateList({ templates }: TemplateListProps) {
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const { deleteTemplate } = useTemplates();

  return (
    <div className="bg-white shadow rounded-lg">
      <ul className="divide-y divide-gray-200">
        {templates.map((template) => (
          <li key={template.id} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {template.name}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  最終更新: {format(new Date(template.updatedAt), 'yyyy/MM/dd HH:mm', { locale: ja })}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setEditingTemplate(template)}
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  <Edit className="h-5 w-5" />
                </button>
                <button
                  onClick={() => deleteTemplate(template.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="mt-4">
              <pre className="mt-2 whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 rounded-md p-4">
                {template.content}
              </pre>
            </div>
          </li>
        ))}
      </ul>

      {editingTemplate && (
        <EditTemplateModal
          template={editingTemplate}
          isOpen={true}
          onClose={() => setEditingTemplate(null)}
        />
      )}
    </div>
  );
}