import { useState } from 'react';
import { X, Send, MessageSquare } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useForcedMessage, useGreetingSettings } from '../../hooks/useTerminals';

interface TerminalControlsProps {
  terminalId: string;
  onClose: () => void;
}

interface MessageForm {
  message: string;
}

export function TerminalControls({ terminalId, onClose }: TerminalControlsProps) {
  const [activeTab, setActiveTab] = useState<'forced' | 'greeting'>('forced');
  const { register: registerForced, handleSubmit: handleForcedSubmit, reset: resetForced } = useForm<MessageForm>();
  const { register: registerGreeting, handleSubmit: handleGreetingSubmit, reset: resetGreeting } = useForm<MessageForm>();
  
  const forcedMessage = useForcedMessage();
  const greetingSettings = useGreetingSettings();

  const onForcedSubmit = async (data: MessageForm) => {
    try {
      await forcedMessage.mutateAsync({
        terminalId,
        message: data.message,
      });
      resetForced();
    } catch (error) {
      console.error('Failed to send forced message:', error);
    }
  };

  const onGreetingSubmit = async (data: MessageForm) => {
    try {
      await greetingSettings.mutateAsync({
        terminalId,
        greeting: data.message,
      });
      resetGreeting();
    } catch (error) {
      console.error('Failed to update greeting:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-medium">Terminal Controls</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('forced')}
              className={`
                w-1/2 py-4 px-1 text-center border-b-2 text-sm font-medium
                ${activeTab === 'forced'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              Forced Message
            </button>
            <button
              onClick={() => setActiveTab('greeting')}
              className={`
                w-1/2 py-4 px-1 text-center border-b-2 text-sm font-medium
                ${activeTab === 'greeting'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              Greeting Settings
            </button>
          </nav>
        </div>

        <div className="p-4">
          {activeTab === 'forced' ? (
            <form onSubmit={handleForcedSubmit(onForcedSubmit)}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Forced Message
                </label>
                <textarea
                  {...registerForced('message', {
                    required: 'Message is required',
                    maxLength: {
                      value: 100,
                      message: 'Message must be less than 100 characters',
                    },
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  rows={3}
                  placeholder="Enter message to force speak..."
                />
              </div>
              <button
                type="submit"
                disabled={forcedMessage.isPending}
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                <Send className="h-4 w-4 mr-2" />
                {forcedMessage.isPending ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleGreetingSubmit(onGreetingSubmit)}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Greeting Message
                </label>
                <textarea
                  {...registerGreeting('message', {
                    required: 'Greeting is required',
                    maxLength: {
                      value: 100,
                      message: 'Greeting must be less than 100 characters',
                    },
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  rows={3}
                  placeholder="Enter greeting message..."
                />
              </div>
              <button
                type="submit"
                disabled={greetingSettings.isPending}
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                {greetingSettings.isPending ? 'Saving...' : 'Save Greeting'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}