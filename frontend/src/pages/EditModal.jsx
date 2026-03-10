console.log("EDIT MODAL FILE LOADED");
import { useState } from "react";

const EditModal = ({ field, currentValue, onSave, onClose }) => {
  const [value, setValue] = useState(currentValue || "");
  console.log("FIELD VALUE:", field);

  const handleSubmit = () => {
    onSave(field, value);
  };

  const fieldName = field?.toLowerCase();

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white p-6 rounded-lg w-96 shadow-lg">

        <h2 className="text-lg font-semibold mb-4 capitalize">
          Edit {field}
        </h2>

        {fieldName === "gender" ? (

          <select
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full p-2 border rounded mb-4"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>

        ) : fieldName === "birthday" ? (

          <input
            type="date"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full p-2 border rounded mb-4"
          />

        ) : fieldName === "experience" ? (

          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full p-2 border rounded mb-4"
            min="0"
          />

        ) : (

          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full p-2 border rounded mb-4"
          />

        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-teal-500 text-white rounded"
          >
            Save
          </button>
        </div>

      </div>
    </div>
  );
};

export default EditModal;