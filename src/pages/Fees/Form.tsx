import Helmet from "@/components/Helmet";
import { useParams } from "@/routes/hooks";
import View from "@/sections/FeeSchedule/Form/View";

export default function Page() {
  const { id } = useParams<"id">();

  return (
    <>
      <Helmet title={id ? "Edit fee schedule" : "New fee schedule"} />
      <View key={id ?? "new"} id={id} />
    </>
  );
}
