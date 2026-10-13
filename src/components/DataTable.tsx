import { useCallback } from "react";

import { FormControl, InputLabel, Select, SelectProps } from "@mui/material";
import { DataGrid, type DataGridProps, type GridRowSpacingParams, type GridValidRowModel } from "@mui/x-data-grid";

import { DataGridPaginationFullPage } from "@/components/data-grid/data-grid-pagination";
import NiArrowDown from "@/icons/nexture/ni-arrow-down";
import NiArrowUp from "@/icons/nexture/ni-arrow-up";
import NiBinEmpty from "@/icons/nexture/ni-bin-empty";
import NiChevronDownSmall from "@/icons/nexture/ni-chevron-down-small";
import NiChevronLeftRightSmall from "@/icons/nexture/ni-chevron-left-right-small";
import NiCols from "@/icons/nexture/ni-cols";
import NiCross from "@/icons/nexture/ni-cross";
import NiEllipsisVertical from "@/icons/nexture/ni-ellipsis-vertical";
import NiEyeInactive from "@/icons/nexture/ni-eye-inactive";
import NiFilter from "@/icons/nexture/ni-filter";
import NiFilterPlus from "@/icons/nexture/ni-filter-plus";
import NiSearch from "@/icons/nexture/ni-search";
import { cn } from "@/lib/utils";

/** MUI X DataGrid (MIT) with the starter's full-page styling and icon slots. */
export function DataTable<R extends GridValidRowModel>({ className, slots, slotProps, ...props }: DataGridProps<R>) {
  const getRowSpacing = useCallback(
    (params: GridRowSpacingParams) => ({ top: params.isFirstVisible ? 0 : 5, bottom: 5 }),
    [],
  );

  return (
    <DataGrid
      autoHeight
      rowHeight={60}
      columnHeaderHeight={40}
      getRowSpacing={getRowSpacing}
      disableRowSelectionOnClick
      disableColumnSelector
      pagination
      className={cn("full-page border-none", className)}
      slotProps={{ panel: { className: "mt-1!" }, main: { className: "overflow-visible" }, ...slotProps }}
      slots={{
        basePagination: DataGridPaginationFullPage,
        columnSortedDescendingIcon: () => <NiArrowDown size="small" />,
        columnSortedAscendingIcon: () => <NiArrowUp size="small" />,
        columnFilteredIcon: () => <NiFilterPlus size="small" />,
        columnReorderIcon: () => <NiChevronLeftRightSmall size="small" />,
        columnMenuIcon: () => <NiEllipsisVertical size="small" />,
        columnMenuSortAscendingIcon: NiArrowUp,
        columnMenuSortDescendingIcon: NiArrowDown,
        columnMenuFilterIcon: NiFilter,
        columnMenuHideIcon: NiEyeInactive,
        columnMenuClearIcon: NiCross,
        columnMenuManageColumnsIcon: NiCols,
        filterPanelDeleteIcon: NiCross,
        filterPanelRemoveAllIcon: NiBinEmpty,

        baseSelect: (selectProps: any) => (
          <FormControl size="small" variant="outlined">
            <InputLabel>{selectProps.label}</InputLabel>
            <Select
              {...(selectProps as SelectProps)}
              IconComponent={NiChevronDownSmall}
              MenuProps={{ className: "outlined" }}
            />
          </FormControl>
        ),
        quickFilterIcon: () => <NiSearch size="medium" />,
        quickFilterClearIcon: () => <NiCross size="medium" />,
        ...slots,
      }}
      {...props}
    />
  );
}

export default DataTable;
