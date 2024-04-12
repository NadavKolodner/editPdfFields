const { PDFDocument } = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit');
const fs = require('fs');

function randomNumberInRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateMETRCNUM() {
    return `1A4010${randomNumberInRange(1, 9)}0000${randomNumberInRange(1000, 9999)}0000${randomNumberInRange(1000, 9999)}`;
}

async function fillFormAndFlatten(inputPdfPath, outputPdfPath, formData, fontPath) {
    const pdfBytes = fs.readFileSync(inputPdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);

    pdfDoc.registerFontkit(fontkit);

    const fontBytes = fs.readFileSync(fontPath);
    const helveticaBoldFont = await pdfDoc.embedFont(fontBytes);

    const form = pdfDoc.getForm();

    // Generate a METRCNUM dynamically and add it to formData
    formData.METRCNUM = generateMETRCNUM();

    Object.keys(formData).forEach(key => {
        const field = form.getField(key);
        if (!field) {
            console.warn(`Field ${key} not found.`);
            return;
        }
        
        field.setText(formData[key]);
    });

    form.getFields().forEach(field => {
        field.defaultUpdateAppearances(helveticaBoldFont);
    });

    form.flatten();

    const filledPdfBytes = await pdfDoc.save();
    fs.writeFileSync(outputPdfPath, filledPdfBytes);
}

// Specify the path to your input PDF, the output PDF, and the Helvetica Bold font file
const inputPdfPath = 'StrainPDFFillable.pdf'; // Make sure this is the correct path to your input PDF
const outputPdfPath = 'Output.pdf'; // Desired path for the output PDF
const fontPath = 'helvetica-bold.ttf'; // Update this to the correct path to your Helvetica Bold font file

// Define the form data you want to fill out
const formData = {
    "GROWER": "New Grower Name",
    "CULTLICNUM": "New Cultivator License Number",
    "STORELICNUM": "New Store License Number",
    "STRAINNAME": "New Strain Name",
    "METRCNUM": "New METRC Number",
    "HARVESTDATE": "New Harvest Date",
    "PACKEDBY": "New Packed By Name",
    "NETWT": "New Net Weight",
    "THCP": "New THC Percentage",
    "CBDP": "New CBD Percentage",
    "TESTINGLAB": "New Testing Lab",
    "PACKDATE": "New Pack Date"
};

// Call the function with the specified paths and form data
fillFormAndFlatten(inputPdfPath, outputPdfPath, formData, fontPath);
