// Stub for API calls

export const fetchPointTypes = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 1, name: 'Type 1' },
        { id: 2, name: 'Type 2' },
        { id: 3, name: 'Type 3' },
      ]);
    }, 500); // Simulate network delay
  });
};

export const savePoint = async (data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Saving point to server:', data);
      resolve({ success: true, id: Date.now(), ...data });
    }, 500);
  });
};

