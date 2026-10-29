import Helmet from "@/components/Helmet";
import { useParams } from "@/routes/hooks";
import View from "@/sections/Customer/Detail/View";

export default function Page() {
  const { id = "" } = useParams<"id">();

  return (
    <>
      <Helmet title={`Customer ${id}`} />
      <View key={id} id={id} />
    </>
  );
}
