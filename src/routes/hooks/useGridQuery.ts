import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router";

import type { GridFilterModel, GridPaginationModel, GridSortModel } from "@mui/x-data-grid";

import { parseFilterModel } from "@/utils/parseFilter";

/**
 * limelite's `useQuery`, for MUI X DataGrid: keeps page / sort / filter in the URL and
 * returns them in the backend's list-argument notation (`page=1,25`, `sort=field|-field`).
 * Backend sort notation: `field` = descending, `-field` = ascending.
 */
export function useGridQuery({ pageSize = 25, defaultSort }: { pageSize?: number; defaultSort?: GridSortModel } = {}) {
  const [searchParams, setSearchParams] = useSearchParams();
  // DataGrid jumps to page 1 whenever it receives a new sort or filter model object,
  // so the models are memoized on the raw URL values (and callers' inline `defaultSort`).
  const pageParam = searchParams.get("page") ?? "";
  const sortParam = searchParams.get("sort") ?? "";
  const filterParam = searchParams.get("filter") ?? "";
  const defaultSortKey = JSON.stringify(defaultSort ?? []);

  const paginationModel = useMemo<GridPaginationModel>(() => {
    const [page, size] = pageParam.split(",").map((v) => parseInt(v, 10));
    return { page: Number.isFinite(page) && page! > 0 ? page! - 1 : 0, pageSize: size || pageSize };
  }, [pageParam, pageSize]);

  const sortModel = useMemo<GridSortModel>(() => {
    if (!sortParam) return JSON.parse(defaultSortKey) as GridSortModel;
    return sortParam.split(",").map((s) => ({ field: s.replace(/^-/, ""), sort: s.startsWith("-") ? "asc" : "desc" }));
  }, [sortParam, defaultSortKey]);

  const filterModel = useMemo<GridFilterModel>(() => {
    try {
      return filterParam ? (JSON.parse(filterParam) as GridFilterModel) : { items: [] };
    } catch {
      return { items: [] };
    }
  }, [filterParam]);

  const update = useCallback(
    (patch: Record<string, string | null>) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const [key, value] of Object.entries(patch)) {
            if (value === null || value === "") next.delete(key);
            else next.set(key, value);
          }
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const onPaginationModelChange = useCallback(
    (model: GridPaginationModel) => update({ page: `${model.page + 1},${model.pageSize}` }),
    [update],
  );

  const onSortModelChange = useCallback(
    (model: GridSortModel) =>
      update({
        sort: model.map((s) => (s.sort === "asc" ? `-${s.field}` : s.field)).join(",") || null,
        page: `1,${paginationModel.pageSize}`,
      }),
    [update, paginationModel.pageSize],
  );

  const onFilterModelChange = useCallback(
    (model: GridFilterModel) =>
      update({
        filter: model.items.length || model.quickFilterValues?.length ? JSON.stringify(model) : null,
        page: `1,${paginationModel.pageSize}`,
      }),
    [update, paginationModel.pageSize],
  );

  const variables = useMemo(
    () => ({
      page: `${paginationModel.page + 1},${paginationModel.pageSize}`,
      sort: sortModel.map((s) => (s.sort === "asc" ? `-${s.field}` : s.field)).join(",") || undefined,
      filter: parseFilterModel(filterModel),
    }),
    [paginationModel, sortModel, filterModel],
  );

  return {
    variables,
    gridProps: {
      paginationMode: "server" as const,
      sortingMode: "server" as const,
      filterMode: "server" as const,
      paginationModel,
      sortModel,
      filterModel,
      onPaginationModelChange,
      onSortModelChange,
      onFilterModelChange,
      pageSizeOptions: [10, 25, 50, 100],
    },
  };
}
