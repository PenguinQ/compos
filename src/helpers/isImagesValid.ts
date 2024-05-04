export default (files: File[]) => {
  const allowed_types = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
  ];

  for (let i = 0; i < files.length; i++) {
    if (!allowed_types.includes(files[i].type)) return false;
  }

  return true;
};
