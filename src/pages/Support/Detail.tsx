import Helmet from "@/components/Helmet";
import PageHeader from "@/components/PageHeader";
import { SUPPORT_TICKET } from "@/libs/SupportTicket/useApollo";
import { useParams } from "@/routes/hooks";
import { paths } from "@/routes/paths";
import View from "@/sections/Support/Detail/View";
import { useQuery } from "@apollo/client/react";

export default function Page() {
  const { id = "" } = useParams<"id">();
  const { data } = useQuery(SUPPORT_TICKET, { variables: { id }, fetchPolicy: "cache-only" });
  const label = data?.supportTicket?.reference ?? "Ticket";

  return (
    <>
      <Helmet title={`Ticket ${label}`} />
      <PageHeader title={`Ticket ${label}`} crumbs={[{ label: "Support", href: paths.support.root }, { label }]} />
      <View key={id} id={id} />
    </>
  );
}
