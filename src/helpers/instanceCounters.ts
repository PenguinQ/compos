type InstanceCounters = {
  [key: string]: number;
};

const counters: InstanceCounters = {};

export default (name: string) => {
  if (counters[name as keyof InstanceCounters] === undefined) {
    counters[name] = 0;
  }

  return `${name}-${++counters[name]}`;
};