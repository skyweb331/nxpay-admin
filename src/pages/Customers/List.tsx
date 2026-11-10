import { useState } from "react";

import { Button } from "@mui/material";

import { useAuthContext } from "@/auth";
import Helmet from "@/components/Helmet";
import PageHeader from "@/components/PageHeader";
import NiPlus from "@/icons/nexture/ni-plus";
import View from "@/sections/Customer/List/View";

export default function Page() {
  const { isAdmin } = useAuthContext();
  const [inviteOpen, setInviteOpen] = useState(false);

  return (
    <>
      <Helmet title="Customers" />
      <PageHeader
        title="Customers"
        crumbs={[{ label: "Customers" }]}
        actions={
          isAdmin ? (
            <Button variant="contained" startIcon={<NiPlus size="medium" />} onClick={() => setInviteOpen(true)}>
              Invite customer
            </Button>
          ) : undefined
        }
      />
      <View inviteOpen={inviteOpen} onInviteClose={() => setInviteOpen(false)} />
    </>
  );
}
