
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');

async function editPdfFields(inputFilePath, outputFilePath, fieldValues) {
    // Load the existing PDF document
    const existingPdfBytes = fs.readFileSync(inputFilePath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    // Get the form in the PDF
    const form = pdfDoc.getForm();

    // Update fields with new values
    Object.keys(fieldValues).forEach(fieldName => {
        const field = form.getField(fieldName);
        if (field) {
            field.setText(fieldValues[fieldName]);
        } else {
            console.log(`Field ${fieldName} not found`);
        }
    });

    // Serialize the PDFDocument to bytes (a Uint8Array)
    const pdfBytes = await pdfDoc.save();

    // Write the PDF to a file
    fs.writeFileSync(outputFilePath, pdfBytes);
}

// Define the new values for each field
const fieldValues = {
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

// Example usage
// Ensure you have the 'pdf-lib' module installed via npm
// Replace 'input.pdf' and 'output.pdf' with your actual file paths
editPdfFields('StrainPDFFillable.pdf', 'output.pdf', fieldValues);
