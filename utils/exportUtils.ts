import { Color } from '../types';
import { jsPDF } from 'jspdf';
import tinycolor from 'tinycolor2';

const triggerDownload = (content: string, fileName: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const exportAsJson = (palette: Color[]) => {
  const data = JSON.stringify({
    palette: palette.map(c => ({ 
        hex: c.hex, 
        rgb: c.rgb,
        p3: c.p3,
        isLocked: c.isLocked,
        contrastWhite: c.wcagWhite,
        contrastBlack: c.wcagBlack,
        isCompliantWhite: c.wcagWhiteCompliant,
        isCompliantBlack: c.wcagBlackCompliant
    })),
    exportedAt: new Date().toISOString()
  }, null, 2);
  triggerDownload(data, 'color-palette-generator.json', 'application/json');
};

export const exportAsSvg = (palette: Color[]) => {
  const width = palette.length * 100;
  const height = 150;
  const rects = palette.map((c, i) => `
    <rect x="${i * 100}" y="0" width="100" height="100" fill="${c.hex}" />
    <text x="${i * 100 + 50}" y="125" font-family="sans-serif" font-size="12" text-anchor="middle" fill="#333" font-weight="bold">${c.hex}</text>
    <text x="${i * 100 + 50}" y="140" font-family="sans-serif" font-size="9" text-anchor="middle" fill="#555">${c.rgb}</text>
  `).join('');
  
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="#fff"/>
  ${rects}
</svg>`.trim();

  triggerDownload(svg, 'color-palette-generator.svg', 'image/svg+xml');
};

export const exportAsHtml = (palette: Color[]) => {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Color Palette Generator</title>
<style>
  body { font-family: system-ui, -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f9fafb; color: #111; }
  .container { text-align: center; max-width: 900px; width: 100%; }
  h1 { margin-bottom: 2rem; color: #111827; }
  .palette { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 0; border-radius: 1rem; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); }
  .swatch { padding-top: 100%; position: relative; }
  .color-block { position: absolute; top: 0; left: 0; right: 0; bottom: 0; }
  .info { padding: 1rem; background: white; text-align: left; font-size: 0.85rem; border-right: 1px solid #eee; }
  .hex { font-weight: bold; font-size: 1.1rem; display: block; margin-bottom: 0.25rem; text-transform: uppercase; }
  .meta { display: block; color: #666; font-family: monospace; margin-bottom: 0.1rem; }
  .wcag { display: inline-block; margin-top: 0.5rem; font-size: 0.75rem; padding: 2px 6px; background: #e6fffa; color: #047857; border-radius: 4px; }
</style>
</head>
<body>
  <div class="container">
    <h1>Color Palette Generator</h1>
    <div class="palette">
      ${palette.map(c => `
      <div>
        <div class="swatch">
            <div class="color-block" style="background-color: ${c.hex}"></div>
        </div>
        <div class="info">
            <span class="hex">${c.hex}</span>
            <span class="meta">${c.rgb}</span>
            <span class="meta" style="font-size: 0.7rem">${c.p3}</span>
            <div style="margin-top: 8px; font-size: 0.75rem; color: #555;">
                <div>Contrast Wht: ${c.wcagWhite.toFixed(2)} ${c.wcagWhiteCompliant ? '(AA)' : ''}</div>
                <div>Contrast Blk: ${c.wcagBlack.toFixed(2)} ${c.wcagBlackCompliant ? '(AA)' : ''}</div>
            </div>
        </div>
      </div>
      `).join('')}
    </div>
  </div>
</body>
</html>`;
  triggerDownload(html, 'color-palette-generator.html', 'text/html');
};

export const exportAsPdf = (palette: Color[]) => {
  try {
      const doc = new jsPDF();
      doc.setFontSize(24);
      doc.text("Color Palette Generator", 20, 20);
      
      const startY = 40;
      const size = 35;
      const gap = 15;
      
      palette.forEach((color, i) => {
        const y = startY + i * (size + gap);
        
        // Draw Color Box
        doc.setFillColor(color.hex);
        doc.rect(20, y, size, size, 'F');
        doc.setDrawColor(200, 200, 200);
        doc.rect(20, y, size, size, 'S');
        
        // Text Details
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text(color.hex.toUpperCase(), 70, y + 10);
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80);
        
        const name = tinycolor(color.hex).toName();
        if (name) doc.text(name, 70, y + 16);

        doc.text(`RGB: ${color.rgb}`, 70, y + 24);
        doc.text(`P3: ${color.p3}`, 70, y + 30);
        
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text(`Contrast (W): ${color.wcagWhite.toFixed(2)} ${color.wcagWhiteCompliant ? 'AA' : ''}`, 70, y + 38);
        doc.text(`Contrast (B): ${color.wcagBlack.toFixed(2)} ${color.wcagBlackCompliant ? 'AA' : ''}`, 70, y + 42);
      });
      
      doc.save('color-palette-generator.pdf');
  } catch (e) {
      console.error("PDF Export Error:", e);
      alert("Could not generate PDF. Please try another format.");
  }
};