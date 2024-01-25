export type ImagesMacrograph = {
  id: string;
  data: File;
}

export type ImagesThumbnail = {
  id: string;
  data: File;
}

export type Images = {
  thumbnail: ImagesThumbnail | undefined,
  macrograph: ImagesMacrograph[],
}
