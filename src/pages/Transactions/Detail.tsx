import Helmet from "@/components/Helmet";
import PageHeader from "@/components/PageHeader";
import { TRANSACTION_DETAIL } from "@/libs/Transaction/useApollo";
import { useParams } from "@/routes/hooks";
import { paths } from "@/routes/paths";
import View from "@/sections/Transaction/Detail/View";
import { useQuery } from "@apollo/client/react";

export default function Page() {
  const { id = "" } = useParams<"id">();
  const { data } = useQuery(TRANSACTION_DETAIL, { variables: { id }, fetchPolicy: "cache-only" });
  const label = data?.transaction?.reference ?? "Transaction";

  return (
    <>
      <Helmet title={`Transaction ${label}`} />
      <PageHeader
        title={`Transaction ${label}`}
        crumbs={[{ label: "Transactions", href: paths.transactions.root }, { label }]}
      />
      <View key={id} id={id} />
    </>
  );
}
