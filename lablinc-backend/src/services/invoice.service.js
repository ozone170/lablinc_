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
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      // Professional Color Palette
      const brandPrimary = '#667eea';
      const brandSecondary = '#764ba2';
      const accentGreen = '#10b981';
      const accentBlue = '#3b82f6';
      const darkColor = '#1a1a2e';
      const lightGray = '#f3f4f6';
      const mediumGray = '#6b7280';
      const borderGray = '#d1d5db';
      const successGreen = '#059669';

      // Header with professional gradient (reduced height)
      doc.rect(0, 0, 612, 100).fillAndStroke(brandPrimary, brandPrimary);
      
      // Add gradient effect with overlapping rectangles
      doc.rect(0, 0, 612, 100).fillOpacity(0.8).fill(brandSecondary);
      doc.fillOpacity(1);
      
      // Add Logo Image
      const logoPath = 'D:\\desktop\\lab\\lablinc-frontend\\public\\logo.png';
      
      try {
        if (fs.existsSync(logoPath)) {
          doc.image(logoPath, 50, 25, { width: 50, height: 50 });
        } else {
          // Fallback: Logo Circle with text
          doc.circle(75, 50, 25).fillAndStroke('white', 'white');
          doc.fontSize(16).fillColor(brandPrimary).font('Helvetica-Bold').text('LL', 65, 42);
        }
      } catch (err) {
        // Fallback: Logo Circle with text
        doc.circle(75, 50, 25).fillAndStroke('white', 'white');
        doc.fontSize(16).fillColor(brandPrimary).font('Helvetica-Bold').text('LL', 65, 42);
      }
      
      // Company Name
      doc.fontSize(28)
         .fillColor('white')
         .font('Helvetica-Bold')
         .text('LabLinc', 115, 30);
      
      doc.fontSize(9)
         .fillColor('white')
         .font('Helvetica')
         .text('Bridging Academia & Industry', 115, 62);
      
      // Invoice Title Box
      doc.roundedRect(420, 25, 140, 55, 5).fillAndStroke('white', 'white');
      
      doc.fontSize(22)
         .fillColor(brandPrimary)
         .font('Helvetica-Bold')
         .text('INVOICE', 435, 30);
      
      // Invoice Details
      doc.fontSize(8)
         .fillColor(darkColor)
         .font('Helvetica-Bold')
         .text('Invoice #:', 430, 52)
         .font('Helvetica')
         .text(invoiceId, 470, 52);
      
      doc.font('Helvetica-Bold')
         .text('Date:', 430, 64)
         .font('Helvetica')
         .text(new Date().toLocaleDateString('en-IN', { 
           day: '2-digit', 
           month: 'short', 
           year: 'numeric' 
         }), 460, 64);

      // Reset to black for content
      doc.fillColor(darkColor);
      
      // Billing Information Box (compact)
      const billToY = 120;
      
      // Main box
      doc.roundedRect(50, billToY, 250, 85, 5).fillAndStroke(lightGray, borderGray);
      
      // Header bar
      doc.roundedRect(50, billToY, 250, 22, 5).fill(brandPrimary);
      doc.rect(50, billToY + 17, 250, 5).fill(brandPrimary);
      
      doc.fontSize(10)
         .fillColor('white')
         .font('Helvetica-Bold')
         .text('BILL TO', 60, billToY + 6);
      
      doc.fontSize(9)
         .fillColor(darkColor)
         .font('Helvetica-Bold')
         .text(user.name, 60, billToY + 30);
      
      doc.font('Helvetica')
         .fillColor(mediumGray)
         .fontSize(8)
         .text(user.email, 60, billToY + 43);
      
      if (user.organization) {
        doc.fillColor(darkColor).text(user.organization, 60, billToY + 56);
      }
      if (user.phone) {
        doc.fillColor(mediumGray).text(`Ph: ${user.phone}`, 60, billToY + 69);
      }
      
      // Booking Information Box
      doc.roundedRect(310, billToY, 250, 85, 5).fillAndStroke(lightGray, borderGray);
      
      // Header bar
      doc.roundedRect(310, billToY, 250, 22, 5).fill(accentBlue);
      doc.rect(310, billToY + 17, 250, 5).fill(accentBlue);
      
      doc.fontSize(10)
         .fillColor('white')
         .font('Helvetica-Bold')
         .text('BOOKING DETAILS', 320, billToY + 6);
      
      doc.fontSize(8)
         .fillColor(darkColor)
         .font('Helvetica-Bold')
         .text('Booking ID:', 320, billToY + 30);
      
      doc.font('Helvetica')
         .fillColor(mediumGray)
         .text(booking._id.toString().slice(-8).toUpperCase(), 400, billToY + 30);
      
      doc.font('Helvetica-Bold')
         .fillColor(darkColor)
         .text('Duration:', 320, billToY + 48);
      
      doc.font('Helvetica')
         .fillColor(mediumGray)
         .text(`${booking.duration.days} day${booking.duration.days > 1 ? 's' : ''}`, 400, billToY + 48);
      
      doc.font('Helvetica-Bold')
         .fillColor(darkColor)
         .text('Dates:', 320, billToY + 66);
      
      doc.font('Helvetica')
         .fillColor(mediumGray)
         .fontSize(7)
         .text(`${new Date(booking.startDate).toLocaleDateString('en-IN')} - ${new Date(booking.endDate).toLocaleDateString('en-IN')}`, 400, billToY + 66);

      // Instrument Details Section (compact)
      const instrumentY = 215;
      
      // Section header
      doc.fontSize(9)
         .fillColor(brandPrimary)
         .font('Helvetica-Bold')
         .text('INSTRUMENT DETAILS', 50, instrumentY);
      
      doc.moveTo(50, instrumentY + 13).lineTo(560, instrumentY + 13).lineWidth(1.5).strokeColor(brandPrimary).stroke();
      
      // Details box
      const detailsY = instrumentY + 18;
      doc.roundedRect(50, detailsY, 510, 50, 4).fillAndStroke(lightGray, borderGray);
      
      doc.fontSize(7)
         .fillColor(darkColor)
         .font('Helvetica');
      
      const leftCol = 58;
      const leftVal = 115;
      const rightCol = 300;
      const rightVal = 355;
      
      // Left column
      doc.font('Helvetica-Bold').fillColor(mediumGray).text('Instrument:', leftCol, detailsY + 8);
      doc.font('Helvetica-Bold').fillColor(darkColor).text(instrument.name, leftVal, detailsY + 8);
      
      doc.font('Helvetica-Bold').fillColor(mediumGray).text('Category:', leftCol, detailsY + 20);
      doc.font('Helvetica').fillColor(darkColor).text(instrument.category, leftVal, detailsY + 20);
      
      doc.font('Helvetica-Bold').fillColor(mediumGray).text('Owner:', leftCol, detailsY + 32);
      doc.font('Helvetica').fillColor(darkColor).text(booking.ownerName, leftVal, detailsY + 32);
      
      // Right column
      doc.font('Helvetica-Bold').fillColor(mediumGray).text('Location:', rightCol, detailsY + 8);
      doc.font('Helvetica').fillColor(darkColor).text(instrument.location || 'N/A', rightVal, detailsY + 8);
      
      doc.font('Helvetica-Bold').fillColor(mediumGray).text('Start:', rightCol, detailsY + 20);
      doc.font('Helvetica').fillColor(darkColor).fontSize(6.5).text(new Date(booking.startDate).toLocaleDateString('en-IN') + ' ' + 
        new Date(booking.startDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }), rightVal, detailsY + 20);
      
      doc.fontSize(7).font('Helvetica-Bold').fillColor(mediumGray).text('End:', rightCol, detailsY + 32);
      doc.font('Helvetica').fillColor(darkColor).fontSize(6.5).text(new Date(booking.endDate).toLocaleDateString('en-IN') + ' ' + 
        new Date(booking.endDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }), rightVal, detailsY + 32);

      // Pricing Breakdown Section (compact)
      const pricingY = 280;
      
      doc.fontSize(9)
         .fillColor(brandPrimary)
         .font('Helvetica-Bold')
         .text('PRICING BREAKDOWN', 50, pricingY);
      
      doc.moveTo(50, pricingY + 13).lineTo(560, pricingY + 13).lineWidth(1.5).strokeColor(brandPrimary).stroke();

      const tableTop = pricingY + 18;
      const col1 = 60;
      const col2 = 320;
      const col3 = 470;

      // Calculate fees with detailed breakdown
      // Base amount is rate × duration
      const ratePerUnit = booking.pricing.rate || 0;
      const baseAmount = booking.pricing.basePrice || (ratePerUnit * booking.duration.days);
      
      // Security deposit (10% of base)
      const securityFee = booking.pricing.securityDeposit || Math.round(baseAmount * 0.10);
      
      // GST (18% of base)
      const gst = booking.pricing.gst || Math.round(baseAmount * 0.18);
      
      // Total = Base + Security + GST
      // Example: ₹100 + ₹10 + ₹18 = ₹128
      const totalAmount = baseAmount + securityFee + gst;
      
      console.log('Invoice Calculation:', {
        baseAmount,
        securityFee,
        gst,
        totalAmount,
        storedTotal: booking.pricing.totalAmount
      });

      // Table with professional styling
      doc.roundedRect(50, tableTop, 510, 110, 4).fillAndStroke(lightGray, borderGray);
      
      // Table Header
      doc.roundedRect(50, tableTop, 510, 18, 4).fill(darkColor);
      doc.rect(50, tableTop + 14, 510, 4).fill(darkColor);
      
      doc.fontSize(7)
         .font('Helvetica-Bold')
         .fillColor('white')
         .text('DESCRIPTION', col1, tableTop + 5)
         .text('RATE', col2, tableTop + 5)
         .text('AMOUNT', col3, tableTop + 5);

      // Table Content
      let rowY = tableTop + 26;
      
      // Base Amount Row
      doc.fillColor(darkColor).font('Helvetica-Bold').fontSize(7);
      doc.text(`${booking.pricing.rateType.charAt(0).toUpperCase() + booking.pricing.rateType.slice(1)} Booking`, col1, rowY);
      doc.fillColor(mediumGray).font('Helvetica').fontSize(6);
      doc.text(`${booking.duration.days} ${booking.duration.days > 1 ? 'days' : 'day'} × ₹${ratePerUnit.toLocaleString()}/${booking.pricing.rateType === 'hourly' ? 'hr' : 'day'}`, col1, rowY + 8);
      
      doc.fontSize(7).fillColor(darkColor).font('Helvetica');
      doc.text(`₹${ratePerUnit.toLocaleString()}`, col2, rowY);
      doc.font('Helvetica-Bold').text(`₹${baseAmount.toLocaleString()}`, col3, rowY);
      
      // Separator line
      rowY += 22;
      doc.moveTo(60, rowY).lineTo(550, rowY).strokeColor(borderGray).lineWidth(0.5).stroke();
      
      // Security Fee Row
      rowY += 8;
      doc.fillColor(darkColor).font('Helvetica-Bold').fontSize(7);
      doc.text('Security Deposit (Refundable)', col1, rowY);
      
      doc.fontSize(7).fillColor(mediumGray).font('Helvetica');
      doc.text('10% of base', col2, rowY);
      doc.fillColor(accentGreen).font('Helvetica-Bold').text(`₹${securityFee.toLocaleString()}`, col3, rowY);
      
      // GST Row
      rowY += 16;
      doc.fillColor(darkColor).font('Helvetica-Bold').fontSize(7);
      doc.text('GST (18%)', col1, rowY);
      
      doc.fontSize(7).fillColor(mediumGray).font('Helvetica');
      doc.text('As per regulations', col2, rowY);
      doc.fillColor(darkColor).font('Helvetica-Bold').text(`₹${gst.toLocaleString()}`, col3, rowY);

      // Total Section
      rowY += 22;
      doc.roundedRect(50, rowY, 510, 24, 4).fillAndStroke(brandPrimary, brandPrimary);
      
      doc.fontSize(9)
         .font('Helvetica-Bold')
         .fillColor('white')
         .text('TOTAL AMOUNT PAYABLE', col1, rowY + 7);
      
      doc.fontSize(11)
         .font('Helvetica-Bold')
         .fillColor('white')
         .text(`₹${totalAmount.toLocaleString('en-IN')}`, col3, rowY + 6);

      // Payment Terms Section (compact)
      const termsY = 425;
      
      doc.roundedRect(50, termsY, 510, 40, 4).fillAndStroke('#fef3c7', '#f59e0b');
      
      doc.fontSize(7)
         .fillColor('#92400e')
         .font('Helvetica-Bold')
         .text('PAYMENT TERMS & CONDITIONS', 58, termsY + 6);
      
      doc.fontSize(6)
         .font('Helvetica')
         .fillColor('#78350f')
         .text('• Security deposit is fully refundable upon completion without damages', 58, termsY + 17)
         .text('• GST (18%) is applicable as per Indian tax regulations', 58, termsY + 26)
         .text('• Payment must be completed before equipment access', 305, termsY + 17)
         .text('• Equipment must be returned in same condition', 305, termsY + 26);

      // Footer with professional gradient (compact)
      const footerY = 480;
      doc.rect(0, footerY, 612, 50).fill(darkColor);
      
      // Add subtle gradient overlay
      doc.rect(0, footerY, 612, 50).fillOpacity(0.9).fill(brandSecondary);
      doc.fillOpacity(1);
      
      doc.fontSize(8)
         .fillColor('white')
         .font('Helvetica-Bold')
         .text('Thank you for choosing LabLinc!', 50, footerY + 8, { align: 'center', width: 512 });
      
      doc.fontSize(7)
         .font('Helvetica')
         .fillColor('#e5e7eb')
         .text('Bridging Academia & Industry Through Smart Equipment Sharing', 50, footerY + 20, { align: 'center', width: 512 });
      
      doc.fontSize(6)
         .fillColor('#d1d5db')
         .text('support@lablinc.com  |  www.lablinc.com  |  +91-XXXX-XXXXXX', 50, footerY + 32, { align: 'center', width: 512 })
         .text('© 2024 LabLinc. All rights reserved.', 50, footerY + 41, { align: 'center', width: 512 });

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
