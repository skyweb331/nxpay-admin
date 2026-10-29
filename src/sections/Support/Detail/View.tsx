import { TICKET_STATUSES } from "../List/View";
import { replySchema, type ReplyValues } from "../schema";

import { useSnackbar } from "notistack";
import { useForm } from "react-hook-form";
import { Link } from "react-router";

import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";

import type { TicketStatus } from "@/__generated__/graphql";
import { useAuthContext } from "@/auth";
import { Form, FormErrorSummary, RHFTextField } from "@/components/Form";
import ContentWrapper from "@/components/layout/containers/content-wrapper";
import LoadingScreen from "@/components/LoadingScreen";
import StatusChip, { statusLabel } from "@/components/StatusChip";
import NiChevronDownSmall from "@/icons/nexture/ni-chevron-down-small";
import { cn } from "@/lib/utils";
import { STAFF_USERS } from "@/libs/Staff/useApollo";
import { REPLY_SUPPORT_TICKET, SUPPORT_TICKET, UPDATE_SUPPORT_TICKET } from "@/libs/SupportTicket/useApollo";
import { paths } from "@/routes/paths";
import { fDateTime } from "@/utils/format-time";
import { applyServerErrors, errorMessage } from "@/utils/graphql";
import { initials } from "@/utils/string";
import { useMutation, useQuery } from "@apollo/client/react";
import { zodResolver } from "@hookform/resolvers/zod";

const UNASSIGNED = "none";

export default function SupportDetailView({ id }: { id: string }) {
  const { user, isAdmin } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const { data, loading, error } = useQuery(SUPPORT_TICKET, { variables: { id }, pollInterval: 30_000 });
  // Only admins can list staff; support agents assign to themselves
  const staff = useQuery(STAFF_USERS, {
    variables: { page: "1,100", sort: "-name" },
    skip: !isAdmin,
  });
  const [reply] = useMutation(REPLY_SUPPORT_TICKET);
  const [update, updateState] = useMutation(UPDATE_SUPPORT_TICKET);
  const methods = useForm<ReplyValues>({ resolver: zodResolver(replySchema), defaultValues: { body: "" } });
  const ticket = data?.supportTicket;

  const assigneeMap = new Map<string, string>();
  if (user) assigneeMap.set(user.id, `${user.name} (me)`);
  for (const s of staff.data?.staffUsers.users ?? []) {
    if (!s.deletedAt && !assigneeMap.has(s.id)) assigneeMap.set(s.id, s.name);
  }
  if (ticket?.assignee && !assigneeMap.has(ticket.assignee.id)) {
    assigneeMap.set(ticket.assignee.id, ticket.assignee.name);
  }
  const assignees = [...assigneeMap.entries()];

  const onSubmit = methods.handleSubmit(async (values) => {
    try {
      await reply({ variables: { input: { ticketId: id, body: values.body } } });
      methods.reset();
      enqueueSnackbar("Reply sent; the customer gets an email", { variant: "success" });
    } catch (e) {
      if (!applyServerErrors(e, methods.setError, ["body"])) enqueueSnackbar(errorMessage(e), { variant: "error" });
    }
  });

  const patch = async (input: { status?: TicketStatus; assigneeId?: string | null }) => {
    try {
      await update({ variables: { input: { id, ...input } } });
      enqueueSnackbar("Ticket updated", { variant: "success" });
    } catch (e) {
      enqueueSnackbar(errorMessage(e), { variant: "error" });
    }
  };

  if (loading && !ticket) return <LoadingScreen inline />;
  if (!ticket) {
    return (
      <ContentWrapper>
        <Alert severity="error">{error ? errorMessage(error) : "Ticket not found."}</Alert>
      </ContentWrapper>
    );
  }

  return (
    <ContentWrapper>
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card>
            <CardContent>
              <Box className="mb-4 flex flex-row flex-wrap items-center gap-2">
                <Typography variant="h5" component="h2" className="mb-0">
                  {ticket.subject}
                </Typography>
                <StatusChip kind="ticket" value={ticket.status} />
              </Box>

              <Box className="flex flex-col gap-4">
                {ticket.messages.map((message) => (
                  <Box key={message.id} className={cn("flex flex-row gap-3", message.isStaff && "flex-row-reverse")}>
                    <Avatar className={cn("small", message.isStaff ? "bg-primary text-white" : "bg-grey-100")}>
                      {initials(message.authorName)}
                    </Avatar>
                    <Box
                      className={cn(
                        "max-w-[80%] rounded-2xl px-4 py-3",
                        message.isStaff ? "bg-primary/10 rounded-tr-sm" : "bg-grey-50 rounded-tl-sm",
                      )}
                    >
                      <Typography variant="caption" className="text-text-secondary block">
                        {message.authorName}
                        {message.isStaff && " (staff)"} · {fDateTime(message.createdAt)}
                      </Typography>
                      <Typography variant="body2" className="whitespace-pre-wrap">
                        {message.body}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>

              <Box className="mt-6">
                <Form methods={methods} onSubmit={onSubmit}>
                  <RHFTextField name="body" label="Reply to the customer" multiline rows={4} />
                  <FormErrorSummary />
                  <Box className="flex flex-row items-center justify-end gap-3">
                    <Typography variant="caption" className="text-text-secondary">
                      Sending sets the ticket to {statusLabel("ticket", "Pending").toLowerCase()}.
                    </Typography>
                    <Button type="submit" variant="contained" loading={methods.formState.isSubmitting}>
                      Send reply
                    </Button>
                  </Box>
                </Form>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Card>
            <CardContent className="flex flex-col gap-4">
              <Box>
                <Typography variant="body2" className="text-text-secondary">
                  Customer
                </Typography>
                <Link to={paths.customers.view(ticket.customerId)} className="link-primary link-underline-hover">
                  {ticket.customer?.user?.name ?? `Customer ${ticket.customerId}`}
                </Link>
                <Typography variant="body2" className="text-text-secondary">
                  {ticket.customer?.user?.email}
                </Typography>
              </Box>
              <FormControl size="small" variant="outlined" fullWidth>
                <InputLabel id="ticket-status">Status</InputLabel>
                <Select
                  labelId="ticket-status"
                  label="Status"
                  value={ticket.status}
                  disabled={updateState.loading}
                  IconComponent={NiChevronDownSmall}
                  MenuProps={{ className: "outlined" }}
                  onChange={(e) => patch({ status: e.target.value as TicketStatus })}
                >
                  {TICKET_STATUSES.map((s) => (
                    <MenuItem key={s} value={s}>
                      {statusLabel("ticket", s)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" variant="outlined" fullWidth>
                <InputLabel id="ticket-assignee">Assignee</InputLabel>
                <Select
                  labelId="ticket-assignee"
                  label="Assignee"
                  value={ticket.assigneeId ?? UNASSIGNED}
                  disabled={updateState.loading}
                  IconComponent={NiChevronDownSmall}
                  MenuProps={{ className: "outlined" }}
                  onChange={(e) => patch({ assigneeId: e.target.value === UNASSIGNED ? null : e.target.value })}
                >
                  <MenuItem value={UNASSIGNED}>Unassigned</MenuItem>
                  {assignees.map(([value, name]) => (
                    <MenuItem key={value} value={value}>
                      {name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Typography variant="caption" className="text-text-secondary">
                Opened {fDateTime(ticket.createdAt)} · last message {fDateTime(ticket.lastMessageAt)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </ContentWrapper>
  );
}
