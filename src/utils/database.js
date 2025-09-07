import { neon } from '@neondatabase/serverless';

// Initialize the database connection
const sql = neon(import.meta.env.VITE_NEON_DATABASE_URL);

// Initialize the database
export const initDatabase = async () => {
  try {
    // Check if materials table exists
    const materialsExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'materials'
      );
    `;

    if (!materialsExists[0].exists) {
      await sql`
        CREATE TABLE materials (
          id SERIAL PRIMARY KEY,
          classroom_id TEXT NOT NULL,
          file_name TEXT NOT NULL,
          file_data BYTEA NOT NULL,
          uploaded_by TEXT NOT NULL,
          uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;
    }

    // Check if reports table exists
    const reportsExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'reports'
      );
    `;

    if (!reportsExists[0].exists) {
      await sql`
        CREATE TABLE reports (
          id SERIAL PRIMARY KEY,
          classroom_id TEXT NOT NULL,
          test_id TEXT NOT NULL,
          student_id TEXT NOT NULL,
          student_name TEXT NOT NULL,
          test_title TEXT NOT NULL,
          file_name TEXT NOT NULL,
          file_data BYTEA NOT NULL,
          score NUMERIC NOT NULL,
          total_questions INTEGER NOT NULL,
          correct_answers INTEGER NOT NULL,
          time_spent INTEGER NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(classroom_id, test_id, student_id)
        );
      `;
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// Upload a PDF file
export const uploadPDF = async (classroomId, fileName, fileData, userId) => {
  try {
    const result = await sql`
      INSERT INTO materials (classroom_id, file_name, file_data, uploaded_by)
      VALUES (${classroomId}, ${fileName}, ${fileData}, ${userId})
      RETURNING id
    `;
    return result[0];
  } catch (error) {
    console.error('Error uploading PDF:', error);
    throw error;
  }
};

// Get all PDFs for a classroom
export const getClassroomPDFs = async (classroomId) => {
  try {
    const result = await sql`
      SELECT id, file_name, uploaded_by, uploaded_at 
      FROM materials 
      WHERE classroom_id = ${classroomId}
      ORDER BY uploaded_at DESC
    `;
    return result;
  } catch (error) {
    console.error('Error fetching PDFs:', error);
    throw error;
  }
};

// Get a specific PDF by ID
export const getPDFById = async (pdfId) => {
  try {
    const result = await sql`
      SELECT file_name, file_data 
      FROM materials 
      WHERE id = ${pdfId}
    `;
    return result[0];
  } catch (error) {
    console.error('Error fetching PDF:', error);
    throw error;
  }
};

// Delete a PDF
export const deletePDF = async (pdfId, userId) => {
  try {
    const result = await sql`
      DELETE FROM materials 
      WHERE id = ${pdfId} AND uploaded_by = ${userId}
      RETURNING id
    `;
    return result[0];
  } catch (error) {
    console.error('Error deleting PDF:', error);
    throw error;
  }
}; 