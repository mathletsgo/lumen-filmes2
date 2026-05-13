export async function getAverageColor(src: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    
    img.onload = () => {
      const canvas = document.createElement("canvas");
      // Scale down to 1x1 to let the browser compute the average color
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return resolve("#000000");
      
      try {
        ctx.drawImage(img, 0, 0, 1, 1);
        const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
        
        // Optional: darken the color slightly so it looks better on the URL bar
        const darken = 0.5;
        const dr = Math.floor(r * darken);
        const dg = Math.floor(g * darken);
        const db = Math.floor(b * darken);

        const hex = "#" + [dr, dg, db].map(x => x.toString(16).padStart(2, "0")).join("");
        resolve(hex);
      } catch (err) {
        resolve("#000000");
      }
    };
    
    img.onerror = () => resolve("#000000");
    img.src = src;
  });
}

export function updateThemeColor(color: string) {
  let meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", "theme-color");
    document.head.appendChild(meta);
  }
  
  // Update the color only if it actually changes to avoid unnecessary repaints
  if (meta.getAttribute("content") !== color) {
    // Add transition to smooth out color changes natively
    meta.setAttribute("content", color);
  }
}
