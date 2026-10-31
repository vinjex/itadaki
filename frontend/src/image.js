// Phone photos are several MB; a recipe needs far less. The browser scales the
// picture down and re-encodes it as JPEG before upload, so the database and
// every page load stay small.
const MAX_SIDE = 1600;

// Where the backend serves uploaded photos.
export const IMAGE_PATH = "/api/itadaki/images/";

export async function shrinkToBase64(file) {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  // JPEG has no transparency: transparent areas become white, not black.
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
  return dataUrl.slice(dataUrl.indexOf(",") + 1);
}
