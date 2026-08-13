export async function extractDominantColor(imageUrl: string): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(null);
        
        canvas.width = 64;
        canvas.height = 64;
        ctx.drawImage(img, 0, 0, 64, 64);
        
        const imageData = ctx.getImageData(0, 0, 64, 64).data;
        let r = 0, g = 0, b = 0, count = 0;
        
        // Loop through pixels
        for (let i = 0; i < imageData.length; i += 4) {
          // Ignore pixels that are too dark or too white to get a richer color
          const isDark = imageData[i] < 30 && imageData[i+1] < 30 && imageData[i+2] < 30;
          const isLight = imageData[i] > 225 && imageData[i+1] > 225 && imageData[i+2] > 225;
          
          if (!isDark && !isLight) {
            r += imageData[i];
            g += imageData[i + 1];
            b += imageData[i + 2];
            count++;
          }
        }
        
        // Fallback if image was mostly black/white
        if (count === 0) {
          for (let i = 0; i < imageData.length; i += 4) {
             r += imageData[i];
             g += imageData[i + 1];
             b += imageData[i + 2];
             count++;
          }
        }

        if (count > 0) {
          r = Math.floor(r / count);
          g = Math.floor(g / count);
          b = Math.floor(b / count);
          resolve(`${r}, ${g}, ${b}`);
        } else {
          resolve(null);
        }
      } catch (e) {
        console.error("Canvas color extraction failed:", e);
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = imageUrl;
  });
}
