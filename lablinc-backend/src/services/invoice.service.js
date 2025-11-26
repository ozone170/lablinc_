const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generate invoice PDF for a booking
 * @param {Object} booking - Booking object
 * @param {Object} user - User object
 * @param {Object} instrument - Instrument object
 * @returns {String} - Invoice file path
 */
const generateInvoice = async (booking, user, instrument) => {
  return new Promise((resolve, reject) => {
    try {
      // Generate unique invoice ID
      const invoiceId = `INV-${Date.now()}-${booking._id.toString().slice(-6)}`;
      const fileName = `${invoiceId}.pdf`;
      const filePath = path.join('invoices', fileName);

      // Ensure invoices directory exists
      if (!fs.existsSync('invoices')) {
        fs.mkdirSync('invoices', { recursive: true });
      }

      // Create PDF document
      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      // Header
      doc.fontSize(20).text('LABLINC INVOICE', { align: 'center' });
      doc.moveDown();
      doc.fontSize(10).text(`Invoice ID: ${invoiceId}`, { align: 'right' });
      doc.text(`Date: ${new Date().toLocaleDateString()}`, { align: 'right' });
      doc.moveDown(2);

      // Billing Information
      doc.fontSize(14).text('Bill To:', { underline: true });
      doc.fontSize(10);
      doc.text(`Name: ${user.name}`);
      doc.text(`Email: ${user.email}`);
      if (user.organization) doc.text(`Organization: ${user.organization}`);
      if (user.phone) doc.text(`Phone: ${user.phone}`);
      doc.moveDown(2);

      // Instrument Details
      doc.fontSize(14).text('Instrument Details:', { underline: true });
      doc.fontSize(10);
      doc.text(`Instrument: ${instrument.name}`);
      doc.text(`Category: ${instrument.category}`);
      doc.text(`Owner: ${booking.ownerName}`);
      doc.text(`Location: ${instrument.location}`);
      doc.moveDown(2);

      // Booking Details
      doc.fontSize(14).text('Booking Details:', { underline: true });
      doc.fontSize(10);
      doc.text(`Booking ID: ${booking._id}`);
      doc.text(`Start Date: ${new Date(booking.startDate).toLocaleDateString()}`);
      doc.text(`End Date: ${new Date(booking.endDate).toLocaleDateString()}`);
      doc.text(`Duration: ${booking.duration.days} days`);
      doc.text(`Status: ${booking.status.toUpperCase()}`);
      doc.moveDown(2);

      // Pricing Table
      doc.fontSize(14).text('Pricing Breakdown:', { underline: true });
      doc.moveDown(0.5);

      const tableTop = doc.y;
      const col1 = 50;
      const col2 = 300;
      const col3 = 450;

      // Table Header
      doc.fontSize(10).font('Helvetica-Bold');
      doc.text('Description', col1, tableTop);
      doc.text('Rate', col2, tableTop);
      doc.text('Amount', col3, tableTop);
      doc.moveTo(col1, tableTop + 15).lineTo(550, tableTop + 15).stroke();

      // Table Content
      doc.font('Helvetica');
      const rowY = tableTop + 25;
      doc.text(`${booking.pricing.rateType.charAt(0).toUpperCase() + booking.pricing.rateType.slice(1)} Rate`, col1, rowY);
      doc.text(`₹${booking.pricing.rate}`, col2, rowY);
      doc.text(`₹${booking.pricing.totalAmount}`, col3, rowY);

      doc.moveDown(3);
      doc.moveTo(col1, doc.y).lineTo(550, doc.y).stroke();

      // Total
      doc.moveDown(0.5);
      doc.fontSize(12).font('Helvetica-Bold');
      doc.text('Total Amount:', col2, doc.y);
      doc.text(`₹${booking.pricing.totalAmount}`, col3, doc.y);

      doc.moveDown(3);

      // Footer
      doc.fontSize(8).font('Helvetica');
      doc.text('Thank you for using LabLinc!', { align: 'center' });
      doc.text('For any queries, please contact us at support@lablinc.com', { align: 'center' });

      // Finalize PDF
      doc.end();

      stream.on('finish', () => {
        resolve({ invoiceId, filePath });
      });

      stream.on('error', (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Get invoice file path
 * @param {String} invoiceId - Invoice ID
 * @returns {String} - File path
 */
const getInvoicePath = (invoiceId) => {
  return path.join('invoices', `${invoiceId}.pdf`);
};

module.exports = {
  generateInvoice,
  getInvoicePath
};
