import { TextField } from '@mui/material';
import { useState } from 'react';

const NumberInput = () => {
  const [value, setValue] = useState(0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const intValue = parseInt(e.target.value,  10);
    if (!isNaN(intValue)) {
      setValue(intValue);
    } else if (e.target.value === '') {
      setValue(0); // Allow empty input to reset to 0
    }
  };

  const handleIncrement = () => {
    setValue((prevValue) => prevValue + 1);
  };

  const handleDecrement = () => {
    setValue((prevValue) => (prevValue > 0 ? prevValue - 1 : 0)); // Prevent negative values
  };

  return (
    <div className="flex items-center border border-gray-300 rounded">
      <TextField
        type="text"
        value={value}
        onChange={handleInputChange}
        label="Maximum hops"
        variant="outlined"
        className="w-40 p-2 text-center border-none focus:outline-none"
      />
      <div className="flex flex-col">
        <button
          onClick={handleIncrement}
          className="p-1 border-l border-b border-gray-300 focus:outline-none hover:bg-gray-100"
        >
          ▲
        </button>
        <button
          onClick={handleDecrement}
          className="p-1 border-l border-gray-300 focus:outline-none hover:bg-gray-100"
        >
          ▼
        </button>
      </div>
    </div>
  );
};

export default NumberInput;
