export default (files: File[]) => {
  const allowed_file_types = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
  ];

  return files.reduce((acc, file) => {
    return acc && allowed_file_types.includes(file.type);
  }, true);
};
