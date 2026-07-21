import React from 'react';

export default function Toast({ message, type, onClose }) {
  const isSuccess = type === 'success';
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-white ${isSuccess ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-amber-600'}`}>
      <span className="font-bold text-sm">{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-80">
        ✕
      </button>
    </div>
  );
}
