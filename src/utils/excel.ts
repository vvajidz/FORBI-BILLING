import * as XLSX from 'xlsx';

export const exportToExcel = (data: any[], filename: string) => {
    // Create a new workbook
    const wb = XLSX.utils.book_new();

    // Convert data to worksheet
    const ws = XLSX.utils.json_to_sheet(data);

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    // Generate Excel file and trigger download
    XLSX.writeFile(wb, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const importFromExcel = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'binary' });

                // Get first worksheet
                const worksheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[worksheetName];

                // Convert to JSON
                const jsonData = XLSX.utils.sheet_to_json(worksheet);
                resolve(jsonData);
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = (error) => reject(error);
        reader.readAsBinaryString(file);
    });
};
