import Helmet from "@/components/Helmet";
import { CUSTOMER_DETAIL } from "@/libs/Customer/useApollo";
import { useParams } from "@/routes/hooks";
import View from "@/sections/Customer/Detail/View";
import { useQuery } from "@apollo/client/react";

export default function Page() {
  const { id = "" } = useParams<"id">();
  const { data } = useQuery(CUSTOMER_DETAIL, { variables: { id }, fetchPolicy: "cache-only" });

  return (
    <>
      <Helmet title={data?.customer?.user?.name ?? "Customer"} />
      <View key={id} id={id} />
    </>
  );
}
