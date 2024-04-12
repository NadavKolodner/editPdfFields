const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { PDFDocument } = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit');
const fs = require('fs');
const path = require('path');

const app = express();
const hostname = '0.0.0.0';
const port = 3001;

app.use(cors());
app.use(bodyParser.json());
app.use('/pdfs', express.static(path.join(__dirname, 'public')));

function randomNumberInRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateMETRCNUM() {
    return `1A4010${randomNumberInRange(1, 9)}0000${randomNumberInRange(1000, 9999)}0000${randomNumberInRange(1000, 9999)}`;
}

async function fillFormAndFlatten(formData, fontPath) {
    // Ensure the 'public' directory exists
    const publicDir = path.join(__dirname, 'public');
    if (!fs.existsSync(publicDir)){
        fs.mkdirSync(publicDir);
    }

    const inputPdfPath = path.join(__dirname, 'StrainPDFFillable.pdf');
    formData.METRCNUM = generateMETRCNUM(); 
    const outputPdfPath = path.join(publicDir, `${formData.METRCNUM}.pdf`);

    const pdfBytes = fs.readFileSync(inputPdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);

    pdfDoc.registerFontkit(fontkit);

    const fontBytes = fs.readFileSync(fontPath);
    const helveticaBoldFont = await pdfDoc.embedFont(fontBytes);

    const form = pdfDoc.getForm();

    Object.keys(formData).forEach(key => {
        const field = form.getField(key);
        if (field) {
            field.setText(formData[key]);
        }
    });

    form.getFields().forEach(field => {
        field.defaultUpdateAppearances(helveticaBoldFont);
    });

    form.flatten();

    const filledPdfBytes = await pdfDoc.save();

    // Save the filled PDF to a file
    fs.writeFileSync(outputPdfPath, filledPdfBytes);

    return `/pdfs/${formData.METRCNUM}.pdf`;
}

app.post('/api/fill-pdf', async (req, res) => {
    const formData = req.body;
    const fontPath = path.join(__dirname, 'helvetica-bold.ttf');

    try {
        const pdfFilePath = await fillFormAndFlatten(formData, fontPath);
        const pdfUrl = `http://localhost:${port}${pdfFilePath}`;
        res.json({ pdfUrl }); // Corrected to send only once
    } catch (error) {
        console.error('Error processing PDF:', error);
        res.status(500).send('Error processing PDF');
    }
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
