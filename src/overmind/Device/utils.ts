import { DeviceInstrument } from './state';

export const cleanInstrumentData = (
  instruments: { name: string; value: string }[]
): DeviceInstrument[] => {
  return instruments.reduce((acc, { name, value }, currentIndex) => {
    if (
      acc[acc.length - 1] &&
      acc[acc.length - 1].value.length === 1 &&
      acc[acc.length - 1].value[0] === ' / '
    ) {
      acc[acc.length - 1].value.push(value);
      acc[acc.length - 1].indices.push(currentIndex);
    } else {
      acc.push({ name, value: [value], indices: [currentIndex] });
    }
    return acc;
  }, []);
};
