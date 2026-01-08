// lib/canvas-utils.ts
import { type Crop } from "react-image-crop";

export function getCroppedImg(
  image: HTMLImageElement,
  crop: Crop,
  fileName: string
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  canvas.width = crop.width * scaleX;
  canvas.height = crop.height * scaleY;

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return Promise.reject(new Error("No 2d context"));
  }

  // Draw the cropped image onto the canvas
  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    crop.width * scaleX,
    crop.height * scaleY
  );

  // Return as Blob (standard image format)
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Canvas is empty"));
          return;
        }
        // @ts-ignore
        blob.name = fileName;
        resolve(blob);
      },
      "image/png",
      1.0
    );
  });
}
