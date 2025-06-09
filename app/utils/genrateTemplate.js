// app/utils/emailTemplates.js


function generateEmailTemplate(subject, html) {
    return `
    <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              padding: 20px;
              margin: 0;
              line-height: 1.6;
            }
            .container {
              max-width: 600px;
              margin: auto;
              background: #ffffff;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
            }
            .header {
              background-color: #0073e6;
              color: white;
              text-align: center;
              padding: 10px;
              font-size: 20px;
              font-weight: bold;
              border-radius: 8px 8px 0 0;
            }
            .logo-container {
              text-align: center;
              margin: 20px 0;
            }
            .logo-container img {
              max-width: 150px;
            }
            .content {
              padding: 20px;
              font-size: 14px;
              line-height: 1.5;
              color: #333;
            }
            .footer {
              text-align: center;
              font-size: 12px;
              color: #777;
              margin-top: 20px;
              padding-top: 10px;
              border-top: 1px solid #ddd;
            }
            .footer a {
              color: #0073e6;
              text-decoration: none;
            }
            .footer a:hover {
              text-decoration: underline;
            }
            
            /* Additional utility classes for content styling */
            .success-box {
              background: #f1f8e9;
              border-left: 4px solid #28a745;
              padding: 15px;
              margin: 15px 0;
              border-radius: 6px;
            }
            .warning-box {
              background: #fff8e1;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 15px 0;
              border-radius: 6px;
            }
            .error-box {
              background: #ffebee;
              border-left: 4px solid #dc3545;
              padding: 15px;
              margin: 15px 0;
              border-radius: 6px;
            }
            .info-box {
              background: #e3f2fd;
              border-left: 4px solid #0073e6;
              padding: 15px;
              margin: 15px 0;
              border-radius: 6px;
            }
            .summary-card {
              background: #f8f9fa;
              padding: 20px;
              margin: 20px 0;
              border-radius: 6px;
              border-left: 4px solid #0073e6;
            }
            .metric-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
              gap: 15px;
              margin: 15px 0;
            }
            .metric-item {
              background: #ffffff;
              padding: 15px;
              border-radius: 6px;
              text-align: center;
              border-left: 4px solid #0073e6;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
            }
            .metric-item h4 {
              margin: 0 0 8px 0;
              font-size: 14px;
              font-weight: 600;
              color: #333;
            }
            .metric-item p {
              margin: 0;
              font-size: 12px;
              color: #666;
              font-weight: 500;
            }
            .status-good { border-left-color: #28a745; }
            .status-warning { border-left-color: #ffc107; }
            .status-error { border-left-color: #dc3545; }
            .button {
              display: inline-block;
              background-color: #0073e6;
              color: white;
              padding: 12px 25px;
              text-decoration: none;
              border-radius: 6px;
              font-weight: 600;
              font-size: 14px;
              margin: 10px 0;
            }
            .button:hover {
              background-color: #005bb5;
            }
            .cta-section {
              text-align: center;
              margin: 30px 0;
              padding: 20px;
              background: #f8f9fa;
              border-radius: 6px;
            }
            
            @media (max-width: 600px) {
              body { padding: 10px; }
              .container { padding: 15px; }
              .metric-grid { grid-template-columns: 1fr; }
              .header { font-size: 18px; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">${subject}</div>
            <div class="logo-container">
              <img src="https://storage.googleapis.com/website-bucket-uploads/logo.png" alt="Company Logo">
            </div>
            <div class="content">
              ${html}
            </div>
            <div class="footer">
              <p>AnalyticsLiv Team</p>
              <p><a href="https://www.analyticsliv.com" style="color: #0073e6; text-decoration: none;">Visit Our Website</a></p>
            </div>
          </div>
        </body>
    </html>`;
}

export { generateEmailTemplate };