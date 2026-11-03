import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateQuotePDF = (quote: any, company: any) => {
  const doc = new jsPDF();
  
  // 1. Encabezado de la Empresa
  doc.setFontSize(20);
  doc.setTextColor(37, 99, 235); // Azul Zentia
  doc.text(company?.name || 'Zentia ERP', 14, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`NIT: ${company?.nit || 'N/A'}`, 14, 30);
  doc.text(`Dirección: ${company?.address || 'N/A'}`, 14, 35);
  doc.text(`Teléfono: ${company?.phone || 'N/A'}`, 14, 40);
  doc.text(`Correo: ${company?.email || 'N/A'}`, 14, 45);

  // 2. Datos de la Cotización y Cliente
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text(`Cotización #${quote.number || '0001'}`, 130, 22);
  
  doc.setFontSize(10);
  doc.text(`Fecha: ${new Date(quote.createdAt || Date.now()).toLocaleDateString()}`, 130, 30);
  doc.text(`Cliente: ${quote.customer?.name || 'Cliente de mostrador'}`, 130, 40);
  if (quote.customer?.document) doc.text(`Documento: ${quote.customer.document}`, 130, 45);

  // Línea separadora
  doc.setLineWidth(0.5);
  doc.setDrawColor(200);
  doc.line(14, 52, 196, 52);

  // 3. Tabla de Productos (Usamos datos de ejemplo si no hay items aún)
  const tableData = quote.items && quote.items.length > 0 
    ? quote.items.map((item: any) => [
        item.product?.name || 'Producto genérico', 
        item.quantity || 1, 
        `$ ${item.unitPrice?.toLocaleString('es-CO') || 0}`, 
        `$ ${item.subtotal?.toLocaleString('es-CO') || 0}`
      ])
    : [['Servicio / Producto de prueba', '1', `$ ${quote.total?.toLocaleString('es-CO') || 0}`, `$ ${quote.total?.toLocaleString('es-CO') || 0}`]];

  autoTable(doc, {
    startY: 60,
    head: [['Descripción', 'Cantidad', 'Precio Unitario', 'Subtotal']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [37, 99, 235] }, // Azul oscuro
    styles: { fontSize: 10, cellPadding: 5 }
  });

  // 4. Total
  const finalY = (doc as any).lastAutoTable.finalY || 60;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`TOTAL A PAGAR: $ ${quote.total?.toLocaleString('es-CO') || 0}`, 130, finalY + 15);

  // 5. Descargar el archivo
  doc.save(`Cotizacion_${quote.number || '0001'}.pdf`);
};