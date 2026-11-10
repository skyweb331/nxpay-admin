import { customerColumns } from "../columns";
import { BulkActions } from "./BulkActions";
import { InviteDialog } from "./InviteDialog";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";

import { Alert, Box, Card, CardContent, Chip, InputAdornment, TextField } from "@mui/material";
import type { GridRowSelectionModel } from "@mui/x-data-grid";

import { useAuthContext } from "@/auth";
import DataTable from "@/components/DataTable";
import EmptyState from "@/components/EmptyState";
import ContentWrapper from "@/components/layout/containers/content-wrapper";
import NiSearch from "@/icons/nexture/ni-search";
import NiUsers from "@/icons/nexture/ni-users";
import { CUSTOMERS } from "@/libs/Customer/useApollo";
import { useGridQuery } from "@/routes/hooks";
import { errorMessage } from "@/utils/graphql";
import { useQuery } from "@apollo/client/react";

const EMPTY_SELECTION: GridRowSelectionModel = { type: "include", ids: new Set() };

export default function CustomerListView({
  inviteOpen = false,
  onInviteClose,
}: {
  inviteOpen?: boolean;
  onInviteClose?: () => void;
}) {
  const { isAdmin } = useAuthContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("q") ?? "";
  const awaitingApproval = searchParams.get("pending") === "1";
  const [term, setTerm] = useState(search);
  const { variables, gridProps } = useGridQuery({ defaultSort: [{ field: "createdAt", sort: "desc" }] });
  const { data, previousData, loading, error } = useQuery(CUSTOMERS, {
    variables: { ...variables, search: search || undefined, awaitingApproval: awaitingApproval || undefined },
  });

  const toggleAwaitingApproval = () =>
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (awaitingApproval) next.delete("pending");
        else next.set("pending", "1");
        next.delete("page");
        return next;
      },
      { replace: true },
    );
  const result = (data ?? previousData)?.customers;
  const rows = result?.customers ?? [];

  const [selection, setSelection] = useState<GridRowSelectionModel>(EMPTY_SELECTION);
  const clearSelection = () => setSelection(EMPTY_SELECTION);
  // "Exclude" means everything on the page except those ids (header checkbox)
  const selectedIds =
    selection.type === "include"
      ? [...selection.ids].map(String)
      : rows.map((r) => r.id).filter((id) => !selection.ids.has(id));

  useEffect(() => {
    if (term.trim() === search) return;
    const timer = setTimeout(
      () =>
        setSearchParams(
          (prev) => {
            const next = new URLSearchParams(prev);
            if (term.trim()) next.set("q", term.trim());
            else next.delete("q");
            next.delete("page");
            return next;
          },
          { replace: true },
        ),
      300,
    );
    return () => clearTimeout(timer);
  }, [term, search, setSearchParams]);

  return (
    <ContentWrapper>
      {error && (
        <Alert severity="error" className="mb-4">
          {errorMessage(error)}
        </Alert>
      )}
      <Card>
        <CardContent>
          <Box className="mb-4 flex flex-wrap items-center gap-3">
            <TextField
              className="max-w-md flex-1"
              fullWidth
              size="small"
              placeholder="Search name or email"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              slotProps={{
                htmlInput: { "aria-label": "Search customers" },
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <NiSearch size="medium" />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Chip
              label="Awaiting approval"
              color={awaitingApproval ? "warning" : "default"}
              variant={awaitingApproval ? "filled" : "outlined"}
              onClick={toggleAwaitingApproval}
            />
          </Box>
          {isAdmin && <BulkActions ids={selectedIds} onDone={clearSelection} />}
          <DataTable
            {...gridProps}
            rows={rows}
            rowCount={result?.total ?? 0}
            columns={customerColumns}
            loading={loading && !result}
            checkboxSelection={isAdmin}
            keepNonExistentRowsSelected
            rowSelectionModel={selection}
            onRowSelectionModelChange={setSelection}
            slots={{
              noRowsOverlay: () => (
                <EmptyState
                  icon={<NiUsers size={40} />}
                  title={
                    awaitingApproval
                      ? "No sign-ups awaiting approval"
                      : search
                        ? "No matching customers"
                        : "No customers yet"
                  }
                  description={search ? "Try a different name, email or ID." : undefined}
                />
              ),
            }}
          />
        </CardContent>
      </Card>
      {onInviteClose && <InviteDialog open={inviteOpen} onClose={onInviteClose} />}
    </ContentWrapper>
  );
}
