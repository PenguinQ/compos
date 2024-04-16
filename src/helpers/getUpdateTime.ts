export default (date: Date) => {
  const update_date = new Date(date);

  return update_date.toLocaleString('en-GB');
};
