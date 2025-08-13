# Data Alchemist

Data Alchemist is a Next.js web application designed to help users clean and prepare messy spreadsheet data for downstream processing. It provides a user-friendly interface for uploading CSV or XLSX files, validating the data against a set of core and AI-powered rules, editing the data in-place, and exporting the cleaned data and a set of business rules to a JSON file.



https://github.com/user-attachments/assets/2d71f4ab-bb12-46f2-bfca-951cf843ee61



## Features

*   **File Upload:** Upload CSV or XLSX files for clients, workers, and tasks.
*   **Editable Data Grid:** View and edit your data in an intuitive, spreadsheet-like interface.
*   **Core Validation:** The application automatically runs a suite of 12 core validation rules to catch common errors, such as:
    *   Missing columns
    *   Duplicate IDs
    *   Malformed lists and JSON
    *   Out-of-range values
    *   Circular dependencies in rules
    *   Resource allocation conflicts
*   **AI-Powered Validation:** Use the power of AI to run broader, more complex validations on your data.
*   **AI-Powered Error Correction:** Automatically fix validation errors with the click of a button.
*   **Natural Language Rule Creation:** Create complex business rules by typing them in plain English.
*   **Prioritization:** Set weights for different criteria to guide the downstream allocation process.
*   **Export:** Export your cleaned data to CSV and your business rules and prioritization settings to a `rules.json` file.

## Getting Started

### Prerequisites

*   Node.js (v18 or later)
*   npm

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/Dark-Kernel/data-alchemist.git
    ```
2.  Navigate to the project directory:
    ```bash
    cd data-alchemist
    ```
3.  Install the dependencies:
    ```bash
    npm install
    ```
4.  Create a `.env.local` file in the root of the project and add your Google API key:
    ```
    GOOGLE_API_KEY=your-api-key
    ```

### Running the Application

To run the application in development mode, use the following command:

```bash
npm run dev
```

This will start the development server at `http://localhost:3000`.

## Usage

1.  **Upload Data:** Use the "Upload" buttons to upload your `clients.csv`, `workers.csv`, and `tasks.csv` files.
2.  **View and Edit Data:** The data will be displayed in three separate grids. You can edit any cell by double-clicking on it.
3.  **Validate Data:** The application will automatically validate the data and display any errors in the "Validation Summary" card.
4.  **Fix Errors:** You can fix errors manually by editing the data in the grid, or you can use the "Fix with AI" button to have the AI attempt to fix the errors automatically.
5.  **Create Business Rules:** Use the "Add Rule" button or the natural language input to create business rules.
6.  **Set Priorities:** Use the sliders in the "Prioritization" card to set the weights for different criteria.
7.  **Export Data:** When you are finished, click the "Export" button to download your cleaned data and a `rules.json` file.

## Tech Stack

*   **Framework:** Next.js
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS
*   **UI Components:** shadcn/ui
*   **Data Grid:** react-data-grid
*   **File Parsing:** papaparse, xlsx
*   **AI:** Google Generative AI

