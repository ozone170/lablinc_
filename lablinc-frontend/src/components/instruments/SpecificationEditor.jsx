import { useState } from 'react';

const SpecificationEditor = ({ specifications = {}, onChange }) => {
  const [specs, setSpecs] = useState(specifications);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  const handleAdd = () => {
    if (!newKey.trim() || !newValue.trim()) return;
    
    const updated = {
      ...specs,
      [newKey.trim()]: newValue.trim(),
    };
    setSpecs(updated);
    onChange(updated);
    setNewKey('');
    setNewValue('');
  };

  const handleRemove = (key) => {
    const updated = { ...specs };
    delete updated[key];
    setSpecs(updated);
    onChange(updated);
  };

  const handleUpdate = (oldKey, newKey, newValue) => {
    const updated = { ...specs };
    if (oldKey !== newKey) {
      delete updated[oldKey];
    }
    updated[newKey] = newValue;
    setSpecs(updated);
    onChange(updated);
  };

  return (
    <div className="specification-editor">
      <div className="spec-list">
        {Object.entries(specs).map(([key, value]) => (
          <div key={key} className="spec-item">
            <input
              type="text"
              value={key}
              onChange={(e) => handleUpdate(key, e.target.value, value)}
              className="spec-key"
              placeholder="Property"
            />
            <input
              type="text"
              value={value}
              onChange={(e) => handleUpdate(key, key, e.target.value)}
              className="spec-value"
              placeholder="Value"
            />
            <button
              type="button"
              onClick={() => handleRemove(key)}
              className="btn btn-sm btn-danger"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="spec-add">
        <input
          type="text"
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          placeholder="Property name (e.g., Resolution)"
          className="spec-key"
        />
        <input
          type="text"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          placeholder="Value (e.g., 1920x1080)"
          className="spec-value"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="btn btn-sm btn-primary"
        >
          Add Specification
        </button>
      </div>

      {Object.keys(specs).length === 0 && (
        <p className="text-gray-500 text-sm">No specifications added yet</p>
      )}
    </div>
  );
};

export default SpecificationEditor;
