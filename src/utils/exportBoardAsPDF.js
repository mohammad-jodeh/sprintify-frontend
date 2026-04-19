import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Export the board view as a PDF
 * @param {string} projectName - Name of the project
 * @param {Array} columns - Board columns with issues
 * @param {string} fileName - Optional custom file name
 */
export const exportBoardAsPDF = async (projectName, columns, fileName = null) => {
  try {
    // Get the board element
    const boardElement = document.getElementById('board-content');
    
    if (!boardElement) {
      console.error('Board element not found');
      return;
    }

    // Hide scrollbars during capture
    const originalOverflow = boardElement.style.overflow;
    boardElement.style.overflow = 'visible';

    // Create canvas from the board element
    const canvas = await html2canvas(boardElement, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      allowTaint: true,
    });

    // Restore overflow
    boardElement.style.overflow = originalOverflow;

    // Get canvas dimensions
    const imgData = canvas.toDataURL('image/png');
    const imgWidth = 297; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Create PDF
    const pdf = new jsPDF({
      orientation: imgHeight > imgWidth ? 'portrait' : 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    const pageHeight = pdf.internal.pageSize.getHeight();
    const pageWidth = pdf.internal.pageSize.getWidth();
    let heightLeft = imgHeight;
    let position = 0;

    // Add title page
    pdf.setFontSize(20);
    pdf.text(`${projectName} - Board Export`, pageWidth / 2, 20, { align: 'center' });
    pdf.setFontSize(12);
    pdf.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 30, { align: 'center' });
    pdf.text(`Total Columns: ${columns.length}`, pageWidth / 2, 40, { align: 'center' });

    const totalIssues = columns.reduce((sum, col) => sum + (col.issues?.length || 0), 0);
    pdf.text(`Total Issues: ${totalIssues}`, pageWidth / 2, 50, { align: 'center' });

    // Add new page for board content
    pdf.addPage();
    position = 10;

    // Add board image
    while (heightLeft >= 0) {
      const heightToPrint = Math.min(pageHeight - 20, heightLeft);
      pdf.addImage(
        imgData,
        'PNG',
        10,
        position - heightLeft + 10,
        imgWidth - 20,
        imgHeight
      );

      heightLeft -= pageHeight - 20;
      if (heightLeft > 0) {
        pdf.addPage();
        position = heightLeft + 10;
      }
    }

    // Add summary page
    pdf.addPage();
    pdf.setFontSize(16);
    pdf.text('Board Summary', 20, 20);

    let yPosition = 35;
    pdf.setFontSize(12);

    // Add column details
    columns.forEach((column, index) => {
      const issueCount = column.issues?.length || 0;
      const storyPoints = column.issues?.reduce((sum, issue) => sum + (issue.storyPoint || 0), 0) || 0;

      pdf.text(`${index + 1}. ${column.name}`, 20, yPosition);
      yPosition += 8;
      pdf.setFontSize(10);
      pdf.text(`   Issues: ${issueCount} | Story Points: ${storyPoints}`, 25, yPosition);
      yPosition += 8;

      // Add first 5 issue titles
      const issuesList = column.issues?.slice(0, 5).map(issue => `• ${issue.title}`);
      if (issuesList && issuesList.length > 0) {
        issuesList.forEach(issue => {
          if (yPosition > 270) {
            pdf.addPage();
            yPosition = 20;
          }
          pdf.text(issue, 30, yPosition);
          yPosition += 6;
        });
      }

      if (column.issues?.length > 5) {
        pdf.text(`   +${column.issues.length - 5} more issues`, 30, yPosition);
        yPosition += 8;
      }

      yPosition += 5;
      pdf.setFontSize(12);
    });

    // Generate file name
    const timestamp = new Date().toISOString().slice(0, 10);
    const exportFileName = fileName || `${projectName.replace(/\s+/g, '_')}_Board_${timestamp}.pdf`;

    // Download PDF
    pdf.save(exportFileName);
  } catch (error) {
    console.error('Error exporting board as PDF:', error);
    throw error;
  }
};
