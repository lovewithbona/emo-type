export async function exportPNG(svg, background) {
 await document.fonts.ready;
 const copy = svg.cloneNode(true);
 const { x, y, width, height } = svg.viewBox.baseVal;
 copy.setAttribute('xmlns','http://www.w3.org/2000/svg');
 copy.setAttribute('width',String(width*2)); copy.setAttribute('height',String(height*2));
 copy.querySelectorAll('[tabindex]').forEach(node => { node.removeAttribute('tabindex'); node.removeAttribute('role'); });
 const rect = document.createElementNS('http://www.w3.org/2000/svg','rect');
 Object.entries({x,y,width,height,fill:background}).forEach(([key,value]) => rect.setAttribute(key,String(value))); copy.prepend(rect);
 const blob = new Blob([new XMLSerializer().serializeToString(copy)],{type:'image/svg+xml;charset=utf-8'});
 const url = URL.createObjectURL(blob);
 try {
 const img = new Image(); img.src = url; await img.decode();
 const canvas = document.createElement('canvas'); canvas.width = width*2; canvas.height = height*2;
 canvas.getContext('2d').drawImage(img,0,0);
 const png = await new Promise(resolve => canvas.toBlob(resolve,'image/png'));
 if (!png) throw new Error('PNG 생성 실패');
 const download = URL.createObjectURL(png); const a = document.createElement('a'); a.href = download; a.download = `emo-type-${Date.now()}.png`; a.click(); setTimeout(() => URL.revokeObjectURL(download),10000);
 } finally { URL.revokeObjectURL(url); }
}
