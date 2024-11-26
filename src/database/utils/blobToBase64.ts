export default (blob: Blob): Promise<string> => new Promise((resolve, reject) => {
  const reader = new FileReader();

  reader.onload = () => {
    const base64_string = reader.result as string;

    resolve(base64_string.split(',')[1]);
  };

  reader.onerror = () => {
    reject(new Error('Failed to convert blob to base64'));
  };

  reader.readAsDataURL(blob);
});
