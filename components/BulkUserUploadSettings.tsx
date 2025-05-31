import React, { useState } from 'react';
import { createNewUserWithoutSigningOut } from '@/lib/firebase';

type UploadResult = { email: string; status: string; message?: string };

type FileType = 'student' | 'faculty';

const BulkUserUploadSettings = () => {
  const [fileType, setFileType] = useState<FileType>('student');
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<UploadResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const templateLinks: Record<FileType, string> = {
    student: '/templates/student-upload-template.csv',
    faculty: '/templates/faculty-upload-template.csv',
  };

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFile(e.target.files ? e.target.files[0] : null);
    setResults([]);
    setError(null);
    setSuccess(null);
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setParsing(true);
    setError(null);
    setSuccess(null);
    try {
      // Parse CSV (simple, for demo)
      const text = await (file as File).text();
      const rows = text.split('\n').map((row: string) => row.split(','));
      const headers = rows[0].map((h: string) => h.trim());
      const dataRows = rows.slice(1).filter((row: string[]) => row.length === headers.length);
      setParsing(false);
      setUploading(true);
      const uploadResults: UploadResult[] = [];
      for (const row of dataRows) {
        const user = Object.fromEntries(headers.map((h: string, i: number) => [h, row[i]?.trim()]));
        try {
          if (fileType === 'student') {
            await createNewUserWithoutSigningOut(user.email, user.password, 'student', {
              name: user.name,
              registrationNumber: user.registrationNumber,
              department: user.department,
              semester: user.semester,
              sendWelcomeEmail: true,
              initialPassword: user.password,
            });
          } else {
            await createNewUserWithoutSigningOut(user.email, user.password, 'faculty', {
              name: user.name,
              department: user.department,
              sendWelcomeEmail: true,
              initialPassword: user.password,
            });
          }
          uploadResults.push({ email: user.email, status: 'success' });
        } catch (err: any) {
          uploadResults.push({ email: user.email, status: 'error', message: err.message });
        }
      }
      setResults(uploadResults);
      setSuccess('Upload complete.');
    } catch (err: any) {
      setError(err.message || 'Failed to parse or upload CSV.');
    } finally {
      setParsing(false);
      setUploading(false);
    }
  }

  return (
    <div>
      <h3 className="text-xl font-semibold mb-2">Bulk User Upload</h3>
      <p className="text-gray-600 dark:text-gray-300 mb-2">Upload CSV files to create student and faculty accounts in bulk.</p>
      {error && <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>}
      {success && <div className="p-3 bg-green-100 text-green-700 rounded-md text-sm">{success}</div>}
      <div className="mb-4 flex gap-4">
        <button
          className={`px-4 py-2 rounded-md ${fileType === 'student' ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
          onClick={() => setFileType('student')}
        >Student Upload</button>
        <button
          className={`px-4 py-2 rounded-md ${fileType === 'faculty' ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
          onClick={() => setFileType('faculty')}
        >Faculty Upload</button>
        <a
          href={templateLinks[fileType]}
          download
          className="ml-auto text-indigo-600 hover:underline text-sm"
        >Download {fileType.charAt(0).toUpperCase() + fileType.slice(1)} CSV Template</a>
      </div>
      <form onSubmit={handleUpload} className="flex flex-col gap-4">
        <input type="file" accept=".csv" onChange={handleFileChange} />
        <button type="submit" disabled={parsing || uploading || !file} className="bg-indigo-600 text-white px-4 py-2 rounded-md">
          {parsing ? 'Parsing...' : uploading ? 'Uploading...' : 'Upload'}
        </button>
      </form>
      {results.length > 0 && (
        <div className="mt-6">
          <h4 className="font-semibold mb-2">Upload Results</h4>
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Message</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {results.map((r: UploadResult, i: number) => (
                <tr key={i}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{r.email}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${r.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>{r.status}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{r.message || ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BulkUserUploadSettings; 