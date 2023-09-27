import { CellValueChangedEvent } from "ag-grid-community";
import { QueryFilter, Template, Upload } from "../../../api/types";

export type ReviewProps = {
  upload: Upload;
  onCancel: () => void;
  close: () => void;
  onComplete: (data: any, error: string | null) => void;
  showImportLoadingStatus?: boolean;
  template: Template;
  reload: () => void;
};

export type TableProps = {
  theme: "light" | "dark";
  uploadId: string;
  filter: QueryFilter;
  template: Template;
  onCellValueChanged: (event: CellValueChangedEvent) => void;
};
