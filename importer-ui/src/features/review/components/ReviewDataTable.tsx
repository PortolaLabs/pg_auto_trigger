/* eslint-disable */
import { ColDef, GridReadyEvent, ICellRendererParams, IDatasource } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { useEffect, useRef, useState } from "react";
import { Icon, Tooltip } from "@tableflow/ui-library";
import { IconType } from "@tableflow/ui-library/build/Icon/types";
import useGetRows from "../../../api/useGetRows";
import { TableProps } from "../types";
import style from "../style/Review.module.scss";
import "./TableStyle.scss";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

function ReviewDataTable({ cellClickedListener, theme, uploadId, filter }: TableProps) {
  const gridRef: any = useRef(null);
  const [columnDefs, setColumnDefs] = useState<any>([]);
  const [gridReady, setGridReady] = useState(false);

  const { data: initialRowData, fetchNextPage, isLoading } = useGetRows(uploadId, filter, 100, 0);

  useEffect(() => {
    // gridRef.current?.purgeInfiniteCache();
    const total = initialRowData?.pages[0]?.pagination?.total || 0;

    total === 0 && gridRef.current?.showNoRowsOverlay();
    total > 0 && gridRef.current?.hideOverlay();
    setColumnSizes();
  }, [filter]);

  useEffect(() => {
    if (gridRef.current) {
      isLoading && gridRef.current.showLoadingOverlay();
      !isLoading && gridRef.current.hideOverlay();
      setColumnSizes();
    }
  }, [isLoading]);

  const onGridReady = (params: GridReadyEvent<any>) => {
    console.log("onGridReady");
    gridRef.current = params.api as any;
    setGridReady(true);
    setTimeout(() => {
      setColumnSizes();
    }, 10);
  };

  useEffect(() => {
    console.log(gridReady);
    console.log(gridRef.current);
    if (!gridRef.current || !initialRowData?.pages[0]?.rows) return;
    console.log("initialRowData", initialRowData?.pages[0]?.rows);

    const dataSource: IDatasource = {
      rowCount: initialRowData?.pages?.[0]?.pagination?.total || undefined,
      getRows: async (params: any) => {
        const nextOffset = initialRowData?.pages[0]?.pagination?.next_offset || 0;
        console.log("asking for " + params.startRow + " to " + nextOffset);

        const data = await fetchNextPage({
          pageParam: nextOffset,
        });
        const paginationInfo = data?.data?.pages[0]?.pagination;
        const rowThisPage = data?.data?.pages?.flatMap((page: any) => page?.rows) || [];

        let lastRow = -1;
        if (paginationInfo?.total !== undefined && paginationInfo.total <= params.endRow) {
          lastRow = paginationInfo.total;
        }
        params.successCallback(rowThisPage, lastRow);
      },
    };
    gridRef.current.setDatasource(dataSource);
    setColumnSizes();
  }, [filter, gridRef.current, JSON.stringify(initialRowData?.pages?.[0]?.rows), gridReady, isLoading]);

  window.addEventListener("resize", () => {
    setColumnSizes();
  });

  const setColumnSizes = () => {
    gridRef.current && gridRef.current?.sizeColumnsToFit();
  };

  useEffect(() => {
    if (initialRowData?.pages?.[0]?.rows?.[0]?.values) {
      const headers = Object.keys(initialRowData.pages[0]?.rows[0]?.values);
      const generatedColumnDefs = headers.map((header: string) => {
        return {
          headerName: header,
          field: `values.${header}`,
          cellStyle: (params: any) => {
            if (params.data?.errors?.[header]) {
              return { backgroundColor: getCellBackgroundColor(params.data.errors[header][0].severity) };
            }
            return null;
          },
          cellRenderer: (params: ICellRendererParams) => cellRenderer(params, header),
          tooltipValueGetter: tooltipValueGetterImproved,
          sortable: false,
          filter: false,
          suppressMovable: true,
          tooltipComponent: CustomTooltip,
        } as ColDef;
      });
      setColumnDefs(generatedColumnDefs.reverse());
    }
  }, [initialRowData?.pages]);
  return (
    <div
      className={theme === "dark" ? "ag-theme-alpine-dark" : "ag-theme-alpine"}
      style={{
        // TODO: make the height dynamic
        // height: initialRowData?.pages?.flat()?.length != null ? (initialRowData?.pages?.flat()?.length + 1) * 43 : 100,
        height: 500,
      }}>
      <AgGridReact
        columnDefs={columnDefs}
        defaultColDef={{}}
        animateRows={true}
        rowSelection="multiple"
        onCellValueChanged={cellClickedListener}
        onGridReady={onGridReady}
        infiniteInitialRowCount={100}
        cacheBlockSize={0}
        rowBuffer={0}
        rowModelType={"infinite"}
        cacheOverflowSize={2}
        maxConcurrentDatasourceRequests={1}
        maxBlocksInCache={10}
        tooltipShowDelay={500}
      />
    </div>
  );
}

function CustomTooltip(props: any) {
  const { data } = props;
  const { errors } = data;
  const { headerName } = props.colDef;
  const error = errors?.[headerName];
  if (!error) return null;
  return (
    <Tooltip className={style.tableflowTooltip}>
      {
        <div className={style.tooltipContent}>
          {error?.map((err: any, index: number) => (
            <span key={index}>{err?.message}</span>
          ))}
        </div>
      }
    </Tooltip>
  );
}

const tooltipValueGetterImproved = (params: any, header: string) => {
  if (params.data?.errors?.[header]) {
    return params.data.errors[header].map((err: any) => `• ${err.type.toUpperCase()}: ${err.message}`).join("");
  }
  return "Validation failed for this field."; // Fallback tooltip
};

type IconKeyType = "error" | "warning" | "info";

const iconTypeMap: Record<IconKeyType, IconType> = {
  error: "error",
  warning: "help",
  info: "info",
};

const getIconType = (type: string): IconType => {
  return iconTypeMap[type as IconKeyType] || "info";
};

const getCellBackgroundColor = (severity: IconKeyType): string | null => {
  const colorMap = {
    error: "#f04339",
    warning: "#ffcc00",
    info: "#4caf50",
  };

  return colorMap[severity] || null;
};

const cellRenderer = (params: any, header: string) => {
  if (params.data) {
    const errors = params.data?.errors?.[header];

    const cellContent = (
      <span
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
        }}>
        <span>{params.value}</span>
        {errors && (
          <button className={style.iconButton}>
            <Icon icon={getIconType(errors[0].type)} />
          </button>
        )}
      </span>
    );

    return cellContent;
  }
};

export default ReviewDataTable;