import { useState } from "react";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">

      <h1 className="text-4xl font-bold text-blue-600 mb-6">
        React + Tailwind
      </h1>

      <p className="mb-4 text-gray-700">
        Tailwind CSS is working 🚀
      </p>

      <button
        onClick={() => setCount(count + 1)}
        className="px-6 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition"
      >
        Count is {count}
      </button>

    </div>
  );
}

export default App;