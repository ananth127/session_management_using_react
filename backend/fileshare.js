const express = require('express');
const multer = require('multer');
const ftpClient = require('ftp');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 5000;

// Create uploads directory if it doesn't exist
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, uploadDir)));

// Multer setup for handling file uploads
const upload = multer({ dest: uploadDir });

// FTP connection details
const ftpConfig = {
  host: 'your-ftp-server-address',
  user: 'your-ftp-username',
  password: 'your-ftp-password',
};

// Upload file to FTP server
app.post('/upload', upload.single('file'), (req, res) => {
  const filePath = req.file.path;
  const fileName = req.file.originalname;

  const client = new ftpClient();
  client.on('ready', () => {
    client.put(filePath, fileName, (err) => {
      fs.unlinkSync(filePath); // Delete the file from local storage after uploading
      if (err) {
        res.status(500).send('Error uploading file to FTP');
        return;
      }
      res.json({ message: 'File uploaded to FTP server' });
      client.end();
    });
  });

  client.connect(ftpConfig);
});

// Route to list all files in the uploads directory with view and download links
app.get('/files', (req, res) => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) {
      return res.status(500).send('Unable to scan directory: ' + err);
    }

    // Generate HTML response
    let fileLinks = files.map(file => {
      const fileUrl = `/uploads/${file}`;
      return `<li>
                ${file} - 
                <a href="${fileUrl}" target="_blank">View</a> | 
                <a href="${fileUrl}" download>Download</a>
              </li>`;
    }).join('');

    // Send HTML response
    res.send(`
      <h1>Files in Uploads Directory</h1>
      <ul>
        ${fileLinks}
      </ul>
    `);
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
