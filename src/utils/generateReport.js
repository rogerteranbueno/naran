import jsPDF from 'jspdf';

export function generateWeeklyPDF(userName, logs) {
  const doc = new jsPDF();
  const orange = [224, 122, 95];
  const dark = [44, 44, 44];
  const gray = [120, 120, 120];

  // Header bar
  doc.setFillColor(...orange);
  doc.rect(0, 0, 210, 18, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('🍊  Naran — Informe Semanal', 14, 12);

  // Subtitle
  doc.setTextColor(...gray);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const now = new Date();
  doc.text(`Generado el ${now.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`, 14, 26);

  // User greeting
  doc.setTextColor(...dark);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`Hola, ${userName || 'Usuario'}`, 14, 38);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(...gray);
  doc.text(`Registraste ${logs.length} momento${logs.length !== 1 ? 's' : ''} esta semana.`, 14, 46);

  // Divider
  doc.setDrawColor(...orange);
  doc.setLineWidth(0.5);
  doc.line(14, 51, 196, 51);

  // Logs
  let y = 60;
  logs.forEach((log, i) => {
    if (y > 260) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...dark);
    doc.text(`${i + 1}. Lo que sentías`, 14, y);

    doc.setFont('helvetica', 'italic');
    doc.setTextColor(...gray);
    const original = doc.splitTextToSize(`"${log.original_text?.slice(0, 120) || ''}"`, 170);
    doc.text(original, 18, y + 6);
    y += 6 + original.length * 5;

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...orange);
    doc.text('Naran sugirió', 14, y + 3);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...dark);
    const reframe = doc.splitTextToSize(log.reframe_message?.slice(0, 200) || '', 170);
    doc.text(reframe, 18, y + 9);
    y += 9 + reframe.length * 5 + 8;

    // Subtle separator
    doc.setDrawColor(220, 215, 210);
    doc.setLineWidth(0.3);
    doc.line(14, y, 196, y);
    y += 6;
  });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(...gray);
  doc.text('Naran · Tu espacio de pausa y conexión · naran.app', 14, 288);

  doc.save(`Naran_Informe_${now.toISOString().slice(0, 10)}.pdf`);
}