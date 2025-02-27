import { Artifact } from "@/components/create-artifact";
import {
  CopyIcon,
  LineChartIcon,
  RedoIcon,
  SparklesIcon,
  UndoIcon,
} from "@/components/icons";
import { SpreadsheetEditor } from "@/components/sheet-editor";
import { Database, DatabaseIcon, Download } from "lucide-react";
import { parse, unparse } from "papaparse";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import axios from "axios";

type Metadata = any;

export const sheetArtifact = new Artifact<"sheet", Metadata>({
  kind: "sheet",
  description: "Useful for working with spreadsheets",
  initialize: async () => {},
  onStreamPart: ({ setArtifact, streamPart }) => {
    if (streamPart.type === "sheet-delta") {
      setArtifact((draftArtifact) => ({
        ...draftArtifact,
        content: streamPart.content as string,
        isVisible: true,
        status: "streaming",
      }));
    } else if ((streamPart as { type: string }).type === "metadata") {
      setArtifact((draftArtifact) => ({
        ...draftArtifact,
        metadata: streamPart.content,
      }));
    }
  },
  content: ({
    content,
    currentVersionIndex,
    isCurrentVersion,
    onSaveContent,
    status,
  }) => {
    return (
      <SpreadsheetEditor
        content={content}
        currentVersionIndex={currentVersionIndex}
        isCurrentVersion={isCurrentVersion}
        saveContent={onSaveContent}
        status={status}
      />
    );
  },
  actions: [
    {
      icon: <DatabaseIcon size={18} />,
      description: "Upload to Database",
      onClick: async ({ content, handleVersionChange, metadata }) => {
        console.log("content to save", content);
        console.log("content metadata", metadata);

        // Parse CSV content
        // @ts-ignore
        const parsed = parse(content, {
          header: true,
          skip_empty_lines: true,
        });
        const items = parsed;
        console.log("parsed items", items);
        // Send the items and documentId to the backend using Axios
        try {
          const response = await axios.post("/api/save-data", {
            documentId: id, // Unique identifier for the document
            items, // Parsed CSV data
          });

          console.log("Data saved:", response.data);
          toast.success("Data saved to database"); // Optional success message
        } catch (error) {
          console.error("Error saving data:", error);
          toast.error("Failed to save data"); // Optional error message
        }
      },
    },
    {
      icon: <Download size={18} />,
      description: "Download Sheet Content",
      onClick: ({ content, handleVersionChange }) => {
        // console.log("content to download", content);
        // Parse the CSV content into an array of arrays
        const parsed = parse(content, { delimiter: "," });

        // Filter out rows where all cells are empty or whitespace
        const nonEmptyRows = parsed.data.filter((row: any) =>
          row.some((cell: any) => cell.trim() !== "")
        );

        // Create an Excel worksheet from the cleaned data
        // @ts-ignore
        const ws = XLSX.utils.aoa_to_sheet(nonEmptyRows);

        // Create a new workbook and append the worksheet
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

        // Write the workbook to an array buffer (XLSX format)
        const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });

        // Create a Blob for the Excel file
        const blob = new Blob([wbout], { type: "application/octet-stream" });

        // Generate a URL and trigger the download
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "sheet.xlsx"; // Filename for the downloaded file
        a.click();
        URL.revokeObjectURL(url); // Clean up the URL
      },
    },
    {
      icon: <UndoIcon size={18} />,
      description: "View Previous version",
      onClick: ({ handleVersionChange }) => {
        handleVersionChange("prev");
      },
      isDisabled: ({ currentVersionIndex }) => {
        if (currentVersionIndex === 0) {
          return true;
        }

        return false;
      },
    },
    {
      icon: <RedoIcon size={18} />,
      description: "View Next version",
      onClick: ({ handleVersionChange }) => {
        handleVersionChange("next");
      },
      isDisabled: ({ isCurrentVersion }) => {
        if (isCurrentVersion) {
          return true;
        }

        return false;
      },
    },
    {
      icon: <CopyIcon />,
      description: "Copy as .csv",
      onClick: ({ content }) => {
        const parsed = parse<string[]>(content, { skipEmptyLines: true });

        const nonEmptyRows = parsed.data.filter((row) =>
          row.some((cell) => cell.trim() !== "")
        );

        const cleanedCsv = unparse(nonEmptyRows);

        navigator.clipboard.writeText(cleanedCsv);
        toast.success("Copied csv to clipboard!");
      },
    },
  ],
  toolbar: [
    {
      description: "Format and clean data",
      icon: <SparklesIcon />,
      onClick: ({ appendMessage }) => {
        appendMessage({
          role: "user",
          content: "Can you please format and clean the data?",
        });
      },
    },
    {
      description: "Analyze and visualize data",
      icon: <LineChartIcon />,
      onClick: ({ appendMessage }) => {
        appendMessage({
          role: "user",
          content:
            "Can you please analyze and visualize the data by creating a new code artifact in python?",
        });
      },
    },
  ],
});
