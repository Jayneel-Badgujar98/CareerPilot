import pdfParse from "pdf-parse"; // Install using: npm i pdf-parse

export async function parsePdfNode(state) {
  try {
    console.log("--- STARTING PDF PARSING ---");
    const { pdfBuffer } = state;  

    if (!pdfBuffer) {
      throw new Error("No PDF buffer provided to Graph State.");
    }

    // Try standard extraction first
    const data = await pdfParse(pdfBuffer);
    let extractedText = data.text?.trim() || "";

    return { extractedText };

  } catch (error) {
    console.error("Error in parsePdfNode:", error);
    throw error;
  }
}