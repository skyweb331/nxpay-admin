import Helmet from "@/components/Helmet";
import ContentWrapper from "@/components/layout/containers/content-wrapper";
import PageHeader from "@/components/PageHeader";
import View from "@/sections/AuditLog/List/View";

export default function Page() {
  return (
    <>
      <Helmet title="Audit log" />
      <PageHeader title="Audit log" crumbs={[{ label: "Logs" }, { label: "Audit log" }]} />
      <ContentWrapper>
        <View />
      </ContentWrapper>
    </>
  );
}
