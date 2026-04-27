const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());

// File upload setup
const storage = multer.diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    cb(null, uuidv4() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Ensure directories exist
['uploads', 'outputs'].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
});

// Embed endpoint
app.post('/api/embed', upload.single('image'), (req, res) => {
  try {
    const { secret, password } = req.body;
    const imagePath = req.file.path;
    const outputPath = `outputs/${uuidv4()}.png`;
    
    const command = `python ../python-engine/steganography.py embed "${imagePath}" "${secret}" "${password}" "${outputPath}"`;
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        return res.status(500).json({ error: stderr });
      }
      
      const result = JSON.parse(stdout);
      
      // Read output image and send as base64
      const imageBuffer = fs.readFileSync(outputPath);
      const base64Image = imageBuffer.toString('base64');
      
      res.json({
        success: true,
        image: `data:image/png;base64,${base64Image}`,
        downloadUrl: `/api/download/${path.basename(outputPath)}`
      });
      
      // Cleanup
      fs.unlinkSync(imagePath);
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Extract endpoint
app.post('/api/extract', upload.single('stegoImage'), (req, res) => {
  try {
    const { password } = req.body;
    const stegoPath = req.file.path;
    
    const command = `python ../python-engine/steganography.py extract "${stegoPath}" "${password}"`;
    
    exec(command, (error, stdout, stderr) => {
      fs.unlinkSync(stegoPath); // Cleanup
      
      if (error) {
        return res.status(500).json({ error: 'Extraction failed. Wrong password or corrupted image.' });
      }
      
      const result = JSON.parse(stdout);
      res.json({ success: true, secret: result.secret });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Download endpoint
app.get('/api/download/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'outputs', req.params.filename);
  res.download(filePath);
});

app.listen(5000, () => {
  console.log('Backend running on port 5000');
});
