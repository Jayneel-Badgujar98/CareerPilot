import { PDFParse } from "pdf-parse";


export async function parsePdfNode(state) {
  try {
    console.log("--- STARTING PDF PARSING ---");
    const { pdfBuffer, extractedText: existingText } = state;

    if (existingText) {
      console.log("Extracted text already exists in state. Bypassing PDF parsing.");
      return { extractedText: existingText };
    }

    if (!pdfBuffer) {
      throw new Error("No PDF buffer provided to Graph State.");
    }


    // Extract text from PDF
    const parser = new PDFParse({
      data: pdfBuffer,
    });

    const pdfData = await parser.getText();

    await parser.destroy();

    const extractedText = pdfData.text;

    if (!extractedText.trim()) {
      throw new Error("Unable to extract text from PDF.")
    }

    console.log(`Successfully extracted ${extractedText.length} characters.`)

    return { extractedText };

  } catch (error) {
    console.error("Error in parsePdfNode:", error);
    throw error;
  }
}