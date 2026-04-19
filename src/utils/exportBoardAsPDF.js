import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Export the board view as a PDF with improved layout and data
 * @param {string} projectName - Name of the project
 * @param {Array} columns - Board columns
 * @param {Array} issues - All issues (filtered/sorted)
 * @param {string} fileName - Optional custom file name
 */
export const exportBoardAsPDF = async (projectName, columns, issues, fileName = null) => {
  try {
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let yPosition = 15;

    // ===== PAGE 1: TITLE PAGE =====
    pdf.setFontSize(24);
    pdf.setTextColor(79, 70, 229); // Primary color
    pdf.text(`${projectName}`, pageWidth / 2, 40, { align: 'center' });
    
    pdf.setFontSize(14);
    pdf.setTextColor(100, 100, 100);
    pdf.text('Board Export Report', pageWidth / 2, 55, { align: 'center' });

    // Export details box
    pdf.setDrawColor(200, 200, 200);
    pdf.rect(20, 70, pageWidth - 40, 60);
    
    yPosition = 80;
    pdf.setFontSize(11);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`Generated: ${new Date().toLocaleString()}`, 30, yPosition);
    
    yPosition += 10;
    pdf.text(`Total Columns: ${columns.length}`, 30, yPosition);
    
    yPosition += 10;
    pdf.text(`Total Issues: ${issues.length}`, 30, yPosition);

    // Column summary
    yPosition += 20;
    pdf.setFontSize(12);
    pdf.setTextColor(79, 70, 229);
    pdf.text('Columns:', 30, yPosition);
    
    yPosition += 8;
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    
    columns.forEach((column, idx) => {
      const columnIssues = issues.filter(issue => issue.statusId && 
        column.statuses?.some(s => s.id === issue.statusId)
      );
      pdf.text(`${idx + 1}. ${column.name} (${columnIssues.length} issues)`, 35, yPosition);
      yPosition += 7;
    });

    // ===== PAGE 2+: DETAILED BOARD VIEW =====
    pdf.addPage();
    yPosition = 15;

    pdf.setFontSize(16);
    pdf.setTextColor(79, 70, 229);
    pdf.text('Board Details', 15, yPosition);
    
    yPosition += 12;

    // Create a table-like layout with columns and their issues
    const columnWidth = (pageWidth - 30) / Math.min(columns.length, 3); // Max 3 columns per page
    let columnIndex = 0;
    let startX = 15;
    let startY = yPosition;

    columns.forEach((column, colIdx) => {
      if (columnIndex > 0 && columnIndex % 3 === 0) {
        // New row of columns
        pdf.addPage();
        startX = 15;
        startY = 15;
        yPosition = startY;
      }

      const xPos = startX + (columnIndex % 3) * columnWidth;
      const columnIssues = issues.filter(issue => issue.statusId && 
        column.statuses?.some(s => s.id === issue.statusId)
      );

      // Column header
      pdf.setDrawColor(79, 70, 229);
      pdf.setFillColor(240, 240, 255);
      pdf.rect(xPos, yPosition, columnWidth - 5, 10, 'F');
      
      pdf.setFontSize(11);
      pdf.setTextColor(79, 70, 229);
      pdf.text(column.name, xPos + 3, yPosition + 7);
      
      yPosition += 12;
      
      // Column stats
      pdf.setFontSize(9);
      pdf.setTextColor(100, 100, 100);
      const storyPoints = columnIssues.reduce((sum, issue) => sum + (issue.storyPoint || 0), 0);
      pdf.text(`Issues: ${columnIssues.length} | Story Points: ${storyPoints}`, xPos + 3, yPosition);
      
      yPosition += 8;

      // Issues in this column
      pdf.setFontSize(9);
      pdf.setTextColor(0, 0, 0);
      
      const maxIssuesPerPage = 15;
      columnIssues.slice(0, maxIssuesPerPage).forEach((issue, idx) => {
        const issueType = issue.issueType || 'TASK';
        const priority = issue.issuePriority || 'MEDIUM';
        
        // Issue number and title
        const issuePrefix = `[${issueType.substring(0, 1)}]`;
        const issueText = `${issuePrefix} #${idx + 1}: ${issue.title?.substring(0, 35)}...`;
        
        pdf.setTextColor(0, 0, 0);
        pdf.text(issueText, xPos + 5, yPosition);
        
        // Issue details
        yPosition += 5;
        pdf.setFontSize(8);
        pdf.setTextColor(120, 120, 120);
        
        let detailsText = '';
        if (issue.assignee) detailsText += `👤 ${issue.assignee} `;
        if (issue.storyPoint) detailsText += `📊 ${issue.storyPoint}pts `;
        if (priority) detailsText += `🎯 ${priority}`;
        
        pdf.text(detailsText, xPos + 7, yPosition);
        
        yPosition += 6;
        pdf.setFontSize(9);

        // Check if we need a new page
        if (yPosition > pageHeight - 20 && idx < columnIssues.length - 1) {
          pdf.addPage();
          yPosition = 15;
          startY = yPosition;
        }
      });

      if (columnIssues.length > maxIssuesPerPage) {
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        yPosition += 3;
        pdf.text(`+${columnIssues.length - maxIssuesPerPage} more issues`, xPos + 5, yPosition);
        yPosition += 5;
      }

      if ((colIdx + 1) % 3 === 0) {
        // Reset Y for next row
        yPosition = startY;
        columnIndex = 0;
      } else {
        yPosition = startY;
        columnIndex++;
      }
    });

    // ===== PAGE 3+: DETAILED ISSUE LIST =====
    pdf.addPage();
    yPosition = 15;

    pdf.setFontSize(16);
    pdf.setTextColor(79, 70, 229);
    pdf.text('All Issues', 15, yPosition);
    
    yPosition += 12;

    // Create detailed issue list
    issues.forEach((issue, idx) => {
      if (yPosition > pageHeight - 30) {
        pdf.addPage();
        yPosition = 15;
      }

      // Issue number and title
      pdf.setFontSize(11);
      pdf.setTextColor(79, 70, 229);
      pdf.text(`${idx + 1}. ${issue.title}`, 15, yPosition);
      
      yPosition += 7;

      // Issue details
      pdf.setFontSize(9);
      pdf.setTextColor(0, 0, 0);

      const details = [
        issue.id ? `ID: ${issue.id.substring(0, 8)}...` : '',
        issue.issueType ? `Type: ${issue.issueType}` : '',
        issue.issuePriority ? `Priority: ${issue.issuePriority}` : '',
        issue.storyPoint ? `Story Points: ${issue.storyPoint}` : '',
        issue.assignee ? `Assigned to: ${issue.assignee}` : 'Not assigned',
        issue.description ? `Description: ${issue.description.substring(0, 80)}...` : '',
      ].filter(d => d);

      details.forEach(detail => {
        pdf.text(detail, 20, yPosition);
        yPosition += 5;
      });

      yPosition += 3;
      
      // Separator line
      pdf.setDrawColor(220, 220, 220);
      pdf.line(15, yPosition, pageWidth - 15, yPosition);
      yPosition += 5;
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
