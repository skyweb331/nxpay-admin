import { inviteCustomerSchema, type InviteCustomerValues } from "../schema";
import { useSnackbar } from "notistack";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";

import { Form, FormErrorSummary, RHFAutocomplete, RHFTextField } from "@/components/Form";
import { CREATE_CUSTOMER, CUSTOMERS } from "@/libs/Customer/useApollo";
import { COUNTRY_OPTIONS, US_STATES } from "@/utils/geo";
import { applyServerErrors, errorMessage } from "@/utils/graphql";
import { useMutation } from "@apollo/client/react";
import { zodResolver } from "@hookform/resolvers/zod";

export function InviteDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { enqueueSnackbar } = useSnackbar();
  const [create] = useMutation(CREATE_CUSTOMER, { refetchQueries: [CUSTOMERS] });
  const methods = useForm<InviteCustomerValues>({
    resolver: zodResolver(inviteCustomerSchema),
    defaultValues: { name: "", email: "", country: "", region: null },
  });
  const country = useWatch({ control: methods.control, name: "country" });

  useEffect(() => {
    if (country !== "US") methods.setValue("region", null);
  }, [country, methods]);

  const close = () => {
    methods.reset();
    onClose();
  };

  const onSubmit = methods.handleSubmit(async (values) => {
    try {
      await create({
        variables: {
          data: {
            name: values.name,
            email: values.email,
            country: values.country,
            region: values.country === "US" ? values.region : null,
          },
        },
      });
      enqueueSnackbar(`Invite sent to ${values.email}`, { variant: "success" });
      close();
    } catch (e) {
      if (!applyServerErrors(e, methods.setError, ["name", "email", "country", "region"])) {
        enqueueSnackbar(errorMessage(e), { variant: "error" });
      }
    }
  });

  return (
    <Dialog open={open} onClose={close} maxWidth="sm" fullWidth>
      <Form methods={methods} onSubmit={onSubmit}>
        <DialogTitle>Invite customer</DialogTitle>
        <DialogContent className="flex flex-col gap-4">
          <Typography variant="body2" className="text-text-secondary">
            They get an email to set a password, then can sign in and finish identity verification.
          </Typography>
          <RHFTextField name="name" label="Name" autoFocus />
          <RHFTextField name="email" label="Email" type="email" />
          <RHFAutocomplete name="country" label="Country of residence" options={COUNTRY_OPTIONS} />
          {country === "US" && <RHFAutocomplete name="region" label="State" options={US_STATES} />}
          <FormErrorSummary />
        </DialogContent>
        <DialogActions>
          <Button variant="text" color="grey" onClick={close}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" loading={methods.formState.isSubmitting}>
            Send invite
          </Button>
        </DialogActions>
      </Form>
    </Dialog>
  );
}

export default InviteDialog;
