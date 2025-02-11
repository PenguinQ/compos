export default (defaultArgs: object, args?: string[]) => {
  const returnedArgs = { ...defaultArgs };

  if (args) {
    for (const arg of Object.keys(returnedArgs)) {
      if (args.includes(arg)) returnedArgs[arg] = { table: { disable: true } };
    }
  }

  return returnedArgs;
};
